import { describe, expect, it } from "vitest";
import { getAvailableSlots, isIsoDate } from "./availability";
import { bookingIdFor } from "./bookings";
import { checkServiceArea } from "./service-areas";

describe("deterministic booking domain", () => {
  it("returns the requested demo slots deterministically", () => {
    expect(getAvailableSlots("370001", "2026-09-03")).toEqual(["10:00 AM", "02:00 PM", "05:00 PM"]);
    expect(getAvailableSlots("370001", "2026-09-03")).toEqual(getAvailableSlots("370001", "2026-09-03"));
  });
  it("checks service areas without guessing", () => {
    expect(checkServiceArea("370001")).toEqual({ available: true, city: "Bhuj" });
    expect(checkServiceArea("999999")).toEqual({ available: false, city: null });
  });
  it("validates real ISO calendar dates", () => {
    expect(isIsoDate("2026-09-03")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
  });
  it("generates the same ID for the same booking", () => {
    const input = { name: "Mahima", pin_code: "370001", service_type: "ac_repair" as const, date: "2026-09-03", time: "05:00 PM" };
    expect(bookingIdFor(input)).toBe(bookingIdFor(input));
    expect(bookingIdFor(input)).toMatch(/^HS-\d{5}$/);
  });
});
