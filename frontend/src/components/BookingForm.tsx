"use client";

import { useState } from "react";

export default function BookingForm({ carId }: { carId: string }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId, startDate, endDate, customerName, email, phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create booking");
      setStatus("success");
      setMessage("Booking request submitted.");
      setStartDate("");
      setEndDate("");
      setCustomerName("");
      setEmail("");
      setPhone("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Start date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded p-2 bg-transparent" required />
      </div>
      <div>
        <label className="block text-sm mb-1">End date</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border rounded p-2 bg-transparent" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border rounded p-2 bg-transparent" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded p-2 bg-transparent" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Phone (optional)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded p-2 bg-transparent" />
      </div>
      <button type="submit" disabled={status === "submitting"} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">
        {status === "submitting" ? "Submitting..." : "Book now"}
      </button>
      {message && <div className="text-sm mt-2">{message}</div>}
    </form>
  );
}
