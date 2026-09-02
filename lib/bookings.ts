import { createHash } from "node:crypto";
import type { BookAppointmentRequest, BookingConfirmation } from "@/types/booking";

const globalStore = globalThis as typeof globalThis & {
  __homeServeBookings?: Map<string, BookingConfirmation>;
};

const bookings = globalStore.__homeServeBookings ?? new Map<string, BookingConfirmation>();
globalStore.__homeServeBookings = bookings;

export function bookingIdFor(input: BookAppointmentRequest): string {
  const digest = createHash("sha256")
    .update(`${input.pin_code}|${input.date}|${input.time}|${input.name.trim().toLowerCase()}`)
    .digest("hex");
  const numeric = Number.parseInt(digest.slice(0, 8), 16) % 100000;
  return `HS-${numeric.toString().padStart(5, "0")}`;
}

export function saveBooking(input: BookAppointmentRequest): BookingConfirmation {
  const booking: BookingConfirmation = {
    confirmed: true,
    booking_id: bookingIdFor(input),
    name: input.name.trim(),
    pin_code: input.pin_code,
    service_type: input.service_type ?? "ac_repair",
    date: input.date,
    time: input.time,
    created_at: new Date().toISOString()
  };
  bookings.set(booking.booking_id, booking);
  return booking;
}

export function listBookings(): BookingConfirmation[] {
  return [...bookings.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
