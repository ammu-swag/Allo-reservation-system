import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    if (
      reservation.status === "pending" &&
      new Date() > reservation.expiresAt
    ) {

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
        ...reservation,
        status: "released",
      });
    }

    return NextResponse.json(reservation);

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error: "Failed to fetch reservation",
      },
      {
        status: 500,
      }
    );
  }
}