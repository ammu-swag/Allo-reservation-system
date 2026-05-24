"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Inventory = {
  inventoryId: string;
  warehouse: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
};

type Product = {
  id: string;
  name: string;
  inventories: Inventory[];
};

export default function HomePage() {

  const [products, setProducts] = useState<Product[]>([]);

  const router = useRouter();

  const fetchProducts = async () => {

    try {

      const response = await axios.get(
        "/api/products"
      );

      setProducts(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    fetchProducts();

  }, []);

  const reserveProduct = async (
    inventoryId: string
  ) => {

    try {

      const response = await axios.post(
        "/api/reservations",
        {
          inventoryId,
          quantity: 1,
        }
      );

      router.push(
        `/reservation/${response.data.id}`
      );

      fetchProducts();

    } catch (error: any) {

      if (
        error.response?.status === 409
      ) {

        alert("Not enough stock");

      } else {

        alert("Reservation failed");
      }
    }
  };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Products
      </h1>

      <div className="space-y-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="border p-5 rounded-lg"
          >

            <h2 className="text-xl font-semibold mb-4">
              {product.name}
            </h2>

            <div className="space-y-3">

              {product.inventories.map(
                (inventory) => (

                  <div
                    key={inventory.inventoryId}
                    className="border p-3 rounded"
                  >

                    <p>
                      Warehouse:
                      {" "}
                      {inventory.warehouse}
                    </p>

                    <p>
                      Available Units:
                      {" "}
                      {inventory.availableUnits}
                    </p>

                    <button
                      onClick={() =>
                        reserveProduct(
                          inventory.inventoryId
                        )
                      }

                      className="
                        mt-3
                        bg-black
                        text-white
                        px-4
                        py-2
                        rounded
                      "
                    >
                      Reserve
                    </button>

                  </div>
                )
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}