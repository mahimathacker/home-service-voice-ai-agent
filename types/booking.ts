export const SERVICE_TYPES = ["ac_repair", "ac_service"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export interface ServiceAreaRequest {
  pin_code: string;
}

export interface SlotRequest extends ServiceAreaRequest {
  date: string;
  service_type?: ServiceType;
}

export interface BookAppointmentRequest extends SlotRequest {
  name: string;
  time: string;
}

export interface BookingConfirmation {
  confirmed: true;
  booking_id: string;
  name: string;
  pin_code: string;
  service_type: ServiceType;
  date: string;
  time: string;
  created_at: string;
}

export type ApiError = { error: string; code: string };
