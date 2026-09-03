# HomeServe × Sarvam Voice Agent

A small Next.js developer surface around the existing **HomeServe Booking Agent** in Sarvam. Sarvam continues to own speech recognition, agent reasoning, text-to-speech, language switching, and turn-taking. This repository owns the web experience and three deterministic HTTP tools.

## Architecture

```text
Next.js web app
  └─ Sarvam browser SDK → existing HomeServe agent
                               ├─ check_service_area → POST /api/service-area
                               ├─ get_available_slots → POST /api/slots
                               └─ book_appointment   → POST /api/book
```

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Copy the agent ID, org ID, workspace ID, and an **embed-scoped** key from Sarvam's **Deploy with code → Embed an agent** guide into `.env.local`. These four values use the `NEXT_PUBLIC_` prefix because Sarvam designed the embed key for browser publication. Keep `SARVAM_API_KEY` server-only; it is not used by the browser session.

The custom interface uses Sarvam's browser conversation SDK for microphone capture, playback, state changes, transcripts, mute/unmute, and session teardown. A stable anonymous user ID is generated per browser so calls can be found in Sarvam analytics.

The web session overrides the first message with a neutral English greeting. Language selection remains automatic after the caller begins speaking, allowing the agent to follow English, Hindi, or Hinglish naturally.

Sarvam must reach public HTTPS endpoints. For local testing, expose the Next.js server through a tunnel, then use that public base URL in each API Tool. For production, deploy the app and replace the URLs with the production origin.

## Configure the three Sarvam API Tools

All endpoints accept `pin_code`; `postal_code` is also accepted for compatibility with the original mock definitions.

### `check_service_area`

- Method: `POST`
- URL: `https://YOUR_ORIGIN/api/service-area`
- Description: `Check whether HomeServe provides AC repair service for the caller's PIN code. Always use this before checking appointment availability.`
- Body: `{ "pin_code": "{{postal_code}}" }`

### `get_available_slots`

- Method: `POST`
- URL: `https://YOUR_ORIGIN/api/slots`
- Description: `Retrieve actual available appointment slots for the requested date. Only offer slots returned by this tool.`
- Body: `{ "pin_code": "{{postal_code}}", "date": "{{requested_date}}", "service_type": "ac_repair" }`

For `{ "pin_code": "370001", "date": "2026-09-03" }`, this returns:

```json
{
  "date": "2026-09-03",
  "available_slots": ["10:00 AM", "02:00 PM", "05:00 PM"]
}
```

### `book_appointment`

- Method: `POST`
- URL: `https://YOUR_ORIGIN/api/book`
- Description: `Book the selected appointment only after the customer explicitly confirms the date and time.`
- Body: `{ "name": "{{customer_name}}", "pin_code": "{{postal_code}}", "service_type": "ac_repair", "date": "{{requested_date}}", "time": "{{requested_time}}" }`

The endpoint rechecks both the service area and the deterministic slot list. A stale or invented time returns `409 SLOT_UNAVAILABLE`; unsupported PIN codes return `422 UNSUPPORTED_AREA`. Successful bookings receive a stable `HS-#####` ID. `GET /api/book` feeds the UI’s result panel.

> The in-memory booking list is intentionally demo-only and resets when the server process restarts or a serverless instance is recycled. The validation and booking ID remain deterministic.

## Tests

```bash
npm test
npm run build
```

Suggested conversational checks:

1. Hinglish happy path, choose 2 PM, change to 5 PM, then explicitly confirm. Only 5 PM should be booked.
2. Unsupported PIN `999999`. The agent must stop before slot lookup.
3. Ask for a time not returned by the tool. The booking endpoint must return `SLOT_UNAVAILABLE`, and the agent must not claim success.
