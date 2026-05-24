import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const { inventoryId, quantity } = body;

    const reservation = await prisma.$transaction(
      async (tx) => {

        const inventory = await tx.inventory.findUnique({
          where: {
            id: inventoryId,
          },
        });

        if (!inventory) {
          throw new Error("Inventory not found");
        }

        const availableUnits =
          inventory.totalUnits - inventory.reservedUnits;

        if (availableUnits < quantity) {
          throw new Error("OUT_OF_STOCK");
        }

        await tx.inventory.update({
          where: {
            id: inventoryId,
          },

          data: {
            reservedUnits: {
              increment: quantity,
            },
          },
        });

        const reservation = await tx.reservation.create({
          data: {
            inventoryId,
            quantity,
            status: "pending",

            expiresAt: new Date(
              Date.now() + 10 * 60 * 1000
            ),
          },
        });

        return reservation;
      }
    );

    return NextResponse.json(reservation);

  } catch (error) {

    console.log(error);

    if (error instanceof Error) {

      if (error.message === "OUT_OF_STOCK") {

        return NextResponse.json(
          {
            error: "Not enough stock available",
          },
          {
            status: 409,
          }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Reservation failed",
      },
      {
        status: 500,
      }
    );
  }
}