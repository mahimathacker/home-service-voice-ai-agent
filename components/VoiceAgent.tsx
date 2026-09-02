"use client";

import { useEffect, useRef, useState } from "react";

type SessionState = "idle" | "connecting" | "live" | "ended" | "error";

export default function VoiceAgent({ agentUrl }: { agentUrl?: string }) {
  const [state, setState] = useState<SessionState>("idle");
  const [sessionKey, setSessionKey] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (startedAt.current) window.dispatchEvent(new CustomEvent("homeserve:session-ended"));
    };
  }, []);

  function start() {
    startedAt.current = Date.now();
    setSessionKey((key) => key + 1);
    setState("connecting");
    window.dispatchEvent(new CustomEvent("homeserve:session-started"));
  }

  function end() {
    startedAt.current = null;
    setState("ended");
    window.dispatchEvent(new CustomEvent("homeserve:session-ended"));
  }

  if (!agentUrl) {
    return (
      <section className="voice-card empty-state" aria-labelledby="voice-title">
        <div className="eyebrow">Sarvam connection</div>
        <h2 id="voice-title">Connect your existing agent</h2>
        <p>Add its Web deployment URL to <code>NEXT_PUBLIC_SARVAM_AGENT_URL</code>. Credentials stay in Sarvam; this app only embeds the deployed agent.</p>
        <span className="state-pill muted"><span /> Not configured</span>
      </section>
    );
  }

  return (
    <section className="voice-card" aria-labelledby="voice-title">
      <div className="voice-heading">
        <div>
          <div className="eyebrow">HomeServe voice line</div>
          <h2 id="voice-title">Talk to our AC service agent</h2>
        </div>
        <span className={`state-pill ${state}`}><span />{state === "live" ? "Live" : state}</span>
      </div>

      {state === "idle" || state === "ended" || state === "error" ? (
        <div className="call-ready">
          <div className="orb"><i /><i /><i /></div>
          <p>Speak naturally in English, Hindi, or Hinglish.</p>
          <button className="primary-button" onClick={start}>Start voice call</button>
        </div>
      ) : (
        <div className="agent-frame-wrap">
          <iframe
            key={sessionKey}
            className="agent-frame"
            src={agentUrl}
            title="HomeServe Booking Agent"
            allow="microphone; autoplay"
            onLoad={() => setState("live")}
            onError={() => setState("error")}
          />
          <button className="end-button" onClick={end}>End session</button>
        </div>
      )}
    </section>
  );
}
