export type Car = {
  id: string; // Drupal UUID
  title: string;
  pricePerDay: number | null;
  seats: number | null;
  transmission: string | null;
  fuel: string | null;
  available: boolean | null;
  imageUrl: string | null;
};

export type CarDetail = Car & {
  description: string | null;
};

const drupalBaseUrl = process.env.DRUPAL_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const username = process.env.DRUPAL_USERNAME;
  const password = process.env.DRUPAL_PASSWORD;
  if (!username || !password) return {};
  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

function absoluteDrupalUrl(path: string | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${drupalBaseUrl}${path}`;
}

export async function getCars(): Promise<Car[]> {
  const url = `${drupalBaseUrl}/jsonapi/node/car?include=field_image&fields[node--car]=title,field_price_per_day,field_seats,field_transmission,field_fuel,field_available,field_image`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Failed to fetch cars: ${res.status}`);
  const json: any = await res.json();

  const includedFiles = new Map<string, any>();
  for (const inc of json.included || []) {
    if (inc.type === "file--file") {
      includedFiles.set(inc.id, inc);
    }
  }

  return (json.data || []).map((item: any) => {
    const imageRel = item.relationships?.field_image?.data;
    let imageUrl: string | null = null;
    if (imageRel && includedFiles.has(imageRel.id)) {
      const file = includedFiles.get(imageRel.id);
      imageUrl = absoluteDrupalUrl(file?.attributes?.uri?.url);
    }

    return {
      id: item.id,
      title: item.attributes?.title ?? "",
      pricePerDay: item.attributes?.field_price_per_day != null ? Number(item.attributes.field_price_per_day) : null,
      seats: item.attributes?.field_seats != null ? Number(item.attributes.field_seats) : null,
      transmission: item.attributes?.field_transmission ?? null,
      fuel: item.attributes?.field_fuel ?? null,
      available: item.attributes?.field_available ?? null,
      imageUrl,
    } as Car;
  });
}

export async function getCarById(id: string): Promise<CarDetail | null> {
  const url = `${drupalBaseUrl}/jsonapi/node/car/${id}?include=field_image`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch car ${id}: ${res.status}`);
  const json: any = await res.json();

  const item = json.data;
  const imageRel = item.relationships?.field_image?.data;
  let imageUrl: string | null = null;
  if (imageRel && Array.isArray(json.included)) {
    const file = json.included.find((i: any) => i.type === "file--file" && i.id === imageRel.id);
    imageUrl = absoluteDrupalUrl(file?.attributes?.uri?.url);
  }

  return {
    id: item.id,
    title: item.attributes?.title ?? "",
    pricePerDay: item.attributes?.field_price_per_day != null ? Number(item.attributes.field_price_per_day) : null,
    seats: item.attributes?.field_seats != null ? Number(item.attributes.field_seats) : null,
    transmission: item.attributes?.field_transmission ?? null,
    fuel: item.attributes?.field_fuel ?? null,
    available: item.attributes?.field_available ?? null,
    description: item.attributes?.field_description ?? null,
    imageUrl,
  } as CarDetail;
}

export type CreateBookingInput = {
  carId: string; // car UUID
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  customerName: string;
  email: string;
  phone?: string;
};

export async function createBooking(input: CreateBookingInput): Promise<any> {
  const url = `${drupalBaseUrl}/jsonapi/node/booking`;
  const body = {
    data: {
      type: "node--booking",
      attributes: {
        title: `Booking for ${input.customerName}`,
        field_start_date: input.startDate,
        field_end_date: input.endDate,
        field_customer_name: input.customerName,
        field_email: input.email,
        field_phone: input.phone || "",
        field_status: "pending",
      },
      relationships: {
        field_car: {
          data: { type: "node--car", id: input.carId },
        },
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create booking (${res.status}): ${errText}`);
  }

  return res.json();
}
