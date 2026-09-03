"use client";

import { useEffect, useRef, useState } from "react";
import type { ConversationAgent } from "sarvam-conv-ai-sdk/browser";

type SessionState = "idle" | "connecting" | "connected" | "listening" | "speaking" | "ended" | "error";
type Transcript = { role: "user" | "bot"; content: string };

export interface SarvamClientConfig { apiKey?: string; appId?: string; orgId?: string; workspaceId?: string }

function getAnonymousUserId() {
  const storageKey = "homeserve-sarvam-user-id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const created = `web-${crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, created);
  return created;
}

export default function VoiceAgent({ config }: { config: SarvamClientConfig }) {
  const [state, setState] = useState<SessionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const sessionRef = useRef<ConversationAgent | null>(null);
  const missing = [!config.apiKey && "NEXT_PUBLIC_SARVAM_EMBED_KEY", !config.appId && "NEXT_PUBLIC_SARVAM_AGENT_ID", !config.orgId && "NEXT_PUBLIC_SARVAM_ORG_ID", !config.workspaceId && "NEXT_PUBLIC_SARVAM_WORKSPACE_ID"].filter(Boolean) as string[];

  useEffect(() => () => {
    const active = sessionRef.current;
    sessionRef.current = null;
    if (active) void active.stop();
  }, []);

  async function start() {
    if (missing.length) return;
    setError(null);
    setTranscript([]);
    setState("connecting");
    try {
      const { BrowserAudioInterface, ConversationAgent, InteractionType } = await import("sarvam-conv-ai-sdk/browser");
      const session = new ConversationAgent({
        apiKey: config.apiKey!,
        audioInterface: new BrowserAudioInterface(16000),
        config: {
          app_id: config.appId!, org_id: config.orgId!, workspace_id: config.workspaceId!,
          user_identifier_type: "custom", user_identifier: getAnonymousUserId(), interaction_type: InteractionType.CALL,
          input_sample_rate: 16000,
          output_sample_rate: 22050,
          initial_bot_message: "Hi! Thanks for calling HomeServe. How can I help you today?",
          agent_variables: { channel: "homeserve_web" }
        },
        stateCallback: (nextState) => setState(nextState),
        transcriptCallback: async (message) => {
          if (message.content?.trim()) setTranscript((items) => [...items, { role: message.role, content: message.content }]);
        },
        endCallback: async () => {
          sessionRef.current = null;
          setMuted(false);
          setState("ended");
          window.dispatchEvent(new CustomEvent("homeserve:session-ended"));
        }
      });
      sessionRef.current = session;
      window.dispatchEvent(new CustomEvent("homeserve:session-started"));
      await session.start();
    } catch (cause) {
      sessionRef.current = null;
      setState("error");
      setError(cause instanceof Error ? cause.message : "The voice session could not be started.");
    }
  }

  async function stop() {
    const session = sessionRef.current;
    sessionRef.current = null;
    try { await session?.stop(); }
    finally {
      setMuted(false);
      setState("ended");
      window.dispatchEvent(new CustomEvent("homeserve:session-ended"));
    }
  }

  function toggleMute() {
    const session = sessionRef.current;
    if (!session) return;
    if (muted) session.unmute(); else session.mute();
    setMuted(!muted);
  }

  if (missing.length) return (
    <section className="voice-card empty-state" aria-labelledby="voice-title">
      <div className="eyebrow">Sarvam connection</div><h2 id="voice-title">Finish the browser SDK setup</h2>
      <p>Add the remaining embed configuration to <code>.env.local</code>:</p>
      <ul className="missing-config">{missing.map((name) => <li key={name}><code>{name}</code></li>)}</ul>
      <p className="security-note">Use the embed-scoped key here—never the server-side <code>SARVAM_API_KEY</code>.</p>
    </section>
  );

  const active = ["connecting", "connected", "listening", "speaking"].includes(state);
  return (
    <section className="voice-card" aria-labelledby="voice-title">
      <div className="voice-heading"><div><div className="eyebrow">HomeServe voice line</div><h2 id="voice-title">Talk to our AC service agent</h2></div><span className={`state-pill ${state}`}><span />{state}</span></div>
      {!active ? <div className="call-ready">
        <div className="orb"><i /><i /><i /></div><p>Speak naturally in English, Hindi, or Hinglish.</p>
        {error && <p className="call-error" role="alert">{error} You can also call our service desk directly.</p>}
        <button className="primary-button" onClick={start}>Start voice call</button>
      </div> : <div className="live-session">
        <div className={`live-orb ${state}`}><i /><i /><i /><i /></div>
        <p className="live-label">{state === "speaking" ? "Agent is speaking" : state === "listening" ? "Listening…" : "Connecting securely…"}</p>
        <div className="transcript" aria-live="polite">
          {transcript.length ? transcript.slice(-4).map((item, index) => <p className={item.role} key={`${index}-${item.content}`}><b>{item.role === "bot" ? "HomeServe" : "You"}</b>{item.content}</p>) : <p className="transcript-empty">The live transcript will appear here.</p>}
        </div>
        <div className="call-controls"><button className="mute-button" onClick={toggleMute}>{muted ? "Unmute" : "Mute"}</button><button className="end-button" onClick={stop}>End session</button></div>
      </div>}
    </section>
  );
}
