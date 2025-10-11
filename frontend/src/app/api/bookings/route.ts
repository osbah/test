import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/drupal";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { carId, startDate, endDate, customerName, email, phone } = payload || {};

    if (!carId || !startDate || !endDate || !customerName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createBooking({ carId, startDate, endDate, customerName, email, phone });
    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
