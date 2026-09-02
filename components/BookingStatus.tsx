"use client";

import { useCallback, useEffect, useState } from "react";
import type { BookingConfirmation } from "@/types/booking";

export default function BookingStatus() {
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/book", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as { bookings: BookingConfirmation[] };
        setBooking(data.bookings[0] ?? null);
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(refresh, 3000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return (
    <aside className="status-card" aria-live="polite">
      <div className="status-title">
        <div>
          <div className="eyebrow">Live result</div>
          <h2>Booking status</h2>
        </div>
        <button className="refresh" onClick={refresh} disabled={checking} aria-label="Refresh booking status">↻</button>
      </div>
      {booking ? (
        <div className="confirmed">
          <div className="checkmark">✓</div>
          <h3>Appointment confirmed</h3>
          <p className="booking-id">{booking.booking_id}</p>
          <dl>
            <div><dt>Customer</dt><dd>{booking.name}</dd></div>
            <div><dt>Date</dt><dd>{booking.date}</dd></div>
            <div><dt>Time</dt><dd>{booking.time}</dd></div>
            <div><dt>PIN code</dt><dd>{booking.pin_code}</dd></div>
          </dl>
        </div>
      ) : (
        <div className="waiting">
          <div className="waiting-icon">⌁</div>
          <h3>No booking yet</h3>
          <p>Confirmed appointment details will appear here after the agent calls the booking tool.</p>
        </div>
      )}
    </aside>
  );
}
