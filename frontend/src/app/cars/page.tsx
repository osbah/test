import Link from "next/link";
import Image from "next/image";
import { getCars } from "@/lib/drupal";

export const revalidate = 0;

export default async function CarsPage() {
  const cars = await getCars();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Available cars</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Link key={car.id} href={`/cars/${car.id}`} className="border rounded-lg overflow-hidden hover:shadow-md transition bg-white dark:bg-neutral-900">
            <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 relative">
              {car.imageUrl ? (
                <Image src={car.imageUrl} alt={car.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">No image</div>
              )}
            </div>
            <div className="p-4">
              <div className="font-medium text-lg">{car.title}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {car.pricePerDay != null ? `$${car.pricePerDay.toFixed(2)}/day` : "—"}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {car.seats ?? "?"} seats • {car.transmission ?? "?"} • {car.fuel ?? "?"}
              </div>
              <div className="text-xs mt-2">
                {car.available ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-600">Unavailable</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
