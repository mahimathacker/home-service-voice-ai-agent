const SERVICE_AREAS: Readonly<Record<string, string>> = {
  "370001": "Bhuj",
  "560001": "Bengaluru",
  "400001": "Mumbai",
  "110001": "New Delhi"
};

export function checkServiceArea(pinCode: string) {
  const city = SERVICE_AREAS[pinCode] ?? null;
  return { available: city !== null, city };
}

export function isValidPinCode(value: unknown): value is string {
  return typeof value === "string" && /^\d{6}$/.test(value);
}

export const supportedPinCodes = Object.keys(SERVICE_AREAS);
