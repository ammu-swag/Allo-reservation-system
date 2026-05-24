import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } = await context.params;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    if (!reservation) {

      return NextResponse.json(
        {
          error: "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    if (reservation.status !== "pending") {

      return NextResponse.json(
        {
          error: "Reservation already processed",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(async (tx) => {

      await tx.inventory.update({
        where: {
          id: reservation.inventoryId,
        },

        data: {
          reservedUnits: {
            decrement: reservation.quantity,
          },
        },
      });

      await tx.reservation.update({
        where: {
          id,
        },

        data: {
          status: "released",
        },
      });
    });

    return NextResponse.json({
      message: "Reservation released",
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error: "Release failed",
      },
      {
        status: 500,
      }
    );
  }
}