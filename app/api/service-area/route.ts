import { NextResponse } from "next/server";
import { apiError, pinFrom, readJson } from "@/lib/http";
import { checkServiceArea, isValidPinCode } from "@/lib/service-areas";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return apiError("Request body must be valid JSON.", "INVALID_JSON");
  const pinCode = pinFrom(body);
  if (!isValidPinCode(pinCode)) return apiError("pin_code must contain exactly 6 digits.", "INVALID_PIN_CODE");
  return NextResponse.json(checkServiceArea(pinCode));
}
