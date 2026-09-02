import { NextResponse } from "next/server";
import { getAvailableSlots, isIsoDate } from "@/lib/availability";
import { listBookings, saveBooking } from "@/lib/bookings";
import { apiError, pinFrom, readJson } from "@/lib/http";
import { checkServiceArea, isValidPinCode } from "@/lib/service-areas";
import { SERVICE_TYPES, type BookAppointmentRequest, type ServiceType } from "@/types/booking";

export async function GET() {
  return NextResponse.json({ bookings: listBookings() });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return apiError("Request body must be valid JSON.", "INVALID_JSON");
  const pinCode = pinFrom(body);
  if (!isValidPinCode(pinCode)) return apiError("pin_code must contain exactly 6 digits.", "INVALID_PIN_CODE");
  if (!checkServiceArea(pinCode).available) return apiError("HomeServe does not serve this PIN code.", "UNSUPPORTED_AREA", 422);
  if (!isIsoDate(body.date)) return apiError("date must use YYYY-MM-DD.", "INVALID_DATE");
  if (typeof body.name !== "string" || !body.name.trim()) return apiError("name is required.", "INVALID_NAME");
  if (typeof body.time !== "string") return apiError("time is required.", "INVALID_TIME");
  const slots = getAvailableSlots(pinCode, body.date);
  if (!slots.includes(body.time)) return apiError("The requested time is not available for this date.", "SLOT_UNAVAILABLE", 409);

  const requestedType = body.service_type ?? "ac_repair";
  if (typeof requestedType !== "string" || !SERVICE_TYPES.includes(requestedType as ServiceType)) {
    return apiError("service_type must be ac_repair or ac_service.", "INVALID_SERVICE_TYPE");
  }

  const input: BookAppointmentRequest = {
    name: body.name,
    pin_code: pinCode,
    service_type: requestedType as ServiceType,
    date: body.date,
    time: body.time
  };
  return NextResponse.json(saveBooking(input), { status: 201 });
}
