import BookingStatus from "@/components/BookingStatus";
import VoiceAgent from "@/components/VoiceAgent";

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#"><span>H</span> HomeServe</a>
        <div className="nav-meta"><span className="online-dot" /> Service desk online</div>
      </nav>
      <div className="shell">
        <header className="hero">
          <div className="eyebrow">Voice-first AC care</div>
          <h1>Book a technician.<br /><em>Just by talking.</em></h1>
          <p>Describe the problem, check real availability, and confirm your visit with our multilingual voice agent.</p>
          <div className="language-row"><span>English</span><span>हिन्दी</span><span>Hinglish</span></div>
        </header>
        <div className="workspace">
          <VoiceAgent config={{ apiKey: process.env.NEXT_PUBLIC_SARVAM_EMBED_KEY, appId: process.env.NEXT_PUBLIC_SARVAM_AGENT_ID, orgId: process.env.NEXT_PUBLIC_SARVAM_ORG_ID, workspaceId: process.env.NEXT_PUBLIC_SARVAM_WORKSPACE_ID }} />
          <BookingStatus />
        </div>
        <section className="how-it-works">
          <div className="eyebrow">One simple conversation</div>
          <div className="steps">
            <article><b>01</b><h3>Tell us the issue</h3><p>“AC thanda nahi kar raha.”</p></article>
            <article><b>02</b><h3>Choose a real slot</h3><p>We check your PIN and live demo availability.</p></article>
            <article><b>03</b><h3>Confirm the visit</h3><p>Nothing is booked until you clearly say yes.</p></article>
          </div>
        </section>
      </div>
      <footer>Powered by Sarvam Voice Agents <span>•</span> HomeServe developer demo</footer>
    </main>
  );
}
