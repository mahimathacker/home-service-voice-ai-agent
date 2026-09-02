import { NextResponse } from "next/server";
import { getAvailableSlots, isIsoDate } from "@/lib/availability";
import { apiError, pinFrom, readJson } from "@/lib/http";
import { checkServiceArea, isValidPinCode } from "@/lib/service-areas";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return apiError("Request body must be valid JSON.", "INVALID_JSON");
  const pinCode = pinFrom(body);
  if (!isValidPinCode(pinCode)) return apiError("pin_code must contain exactly 6 digits.", "INVALID_PIN_CODE");
  if (!isIsoDate(body.date)) return apiError("date must use YYYY-MM-DD.", "INVALID_DATE");
  if (!checkServiceArea(pinCode).available) return apiError("HomeServe does not serve this PIN code.", "UNSUPPORTED_AREA", 422);

  return NextResponse.json({ date: body.date, available_slots: getAvailableSlots(pinCode, body.date) });
}
