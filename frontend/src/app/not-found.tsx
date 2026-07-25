import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="empty card" data-hero-item>
          <span className="badge badgeMuted">404</span>
          <h1 className="sectionTitle" style={{ margin: "16px auto", fontSize: "clamp(2.3rem,7vw,4.2rem)" }}>This page is not on the table.</h1>
          <p className="sectionLead" style={{ marginInline: "auto" }}>The link may be outdated, the listing may have been removed, or the address may be incorrect.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="button buttonPrimary" href="/listings"><Search size={17} /> Find food</Link>
            <Link className="button buttonGhost" href="/"><ArrowLeft size={17} /> Return home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
