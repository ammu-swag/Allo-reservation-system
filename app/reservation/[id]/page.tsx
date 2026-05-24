"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Reservation = {
  id: string;
  inventoryId: string;
  quantity: number;
  status: string;
  expiresAt: string;
};

export default function ReservationPage() {

  const params = useParams();

  const router = useRouter();

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  const fetchReservation = async () => {

    try {

      const response = await axios.get(
        `/api/reservations/${params.id}`
      );

      setReservation(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    fetchReservation();

  }, []);

  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const expiry = new Date(
        reservation.expiresAt
      ).getTime();

      const distance = expiry - now;

      if (distance <= 0) {

        setTimeLeft("Expired");

        clearInterval(interval);

        fetchReservation();

        return;
      }

      const minutes = Math.floor(
        distance / (1000 * 60)
      );

      const seconds = Math.floor(
        (distance % (1000 * 60)) / 1000
      );

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [reservation]);

  const confirmReservation = async () => {

    try {

      await axios.post(
        `/api/reservations/${params.id}/confirm`
      );

      alert("Purchase confirmed");

      fetchReservation();

    } catch (error: any) {

      if (
        error.response?.status === 410
      ) {

        alert("Reservation expired");

      } else {

        alert("Confirmation failed");
      }
    }
  };

  const cancelReservation = async () => {

    try {

      await axios.post(
        `/api/reservations/${params.id}/release`
      );

      alert("Reservation cancelled");

      router.push("/");

    } catch (error) {

      console.log(error);

      alert("Cancellation failed");
    }
  };

  if (!reservation) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Reservation Details
      </h1>

      <div className="border p-6 rounded-lg">

        <p>
          Reservation ID:
          {" "}
          {reservation.id}
        </p>

        <p>
          Status:
          {" "}
          {reservation.status}
        </p>

        <p>
          Quantity:
          {" "}
          {reservation.quantity}
        </p>

        <p>
          Time Left:
          {" "}
          {timeLeft}
        </p>

        <div className="flex gap-4 mt-6">

          <button
            onClick={confirmReservation}

            disabled={
              reservation.status !== "pending"
            }

            className="
              bg-green-600
              text-white
              px-4
              py-2
              rounded
              disabled:opacity-50
            "
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}

            disabled={
              reservation.status !== "pending"
            }

            className="
              bg-red-600
              text-white
              px-4
              py-2
              rounded
              disabled:opacity-50
            "
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}