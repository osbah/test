import Image from "next/image";
import { getCarById } from "@/lib/drupal";
import BookingForm from "@/components/BookingForm";

export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const car = await getCarById(params.id);
  if (!car) {
    return <div className="max-w-3xl mx-auto p-6">Car not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 grid gap-8 lg:grid-cols-2">
      <div>
        <div className="aspect-[4/3] relative bg-neutral-100 dark:bg-neutral-800 rounded">
          {car.imageUrl ? (
            <Image src={car.imageUrl} alt={car.title} fill className="object-cover rounded" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">No image</div>
          )}
        </div>
        <h1 className="text-2xl font-semibold mt-4">{car.title}</h1>
        <div className="text-neutral-600 dark:text-neutral-400 mt-1">
          {car.pricePerDay != null ? `$${car.pricePerDay.toFixed(2)}/day` : "—"}
        </div>
        <p className="mt-4 whitespace-pre-wrap">{car.description || ""}</p>
      </div>
      <div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-3">Book this car</h2>
          <BookingForm carId={car.id} />
        </div>
      </div>
    </div>
  );
}
