import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Camera, CheckCircle2, Clock3, LockKeyhole, ShieldCheck } from "lucide-react";
import { CreateListingForm } from "@/components/create-listing-form";
import { getSession } from "@/lib/server-api";
import styles from "./share.module.css";

export const metadata: Metadata = { title: "Share food" };

export default async function Page() {
  const user = await getSession();
  if (!user) redirect("/login?next=/share");

  return (
    <main className="page">
      <div className="container">
        <div className={styles.intro} data-hero-item>
          <span className="badge badgeFree">Create a listing</span>
          <h1 className="sectionTitle" style={{ margin: "16px 0" }}>Share food clearly and safely.</h1>
          <p className="sectionLead">Public location is limited to city and area. Exact pickup details are stored separately and used only in the fulfilment workflow.</p>
        </div>

        <div className={styles.layout}>
          <div data-reveal><CreateListingForm /></div>
          <aside className={styles.sidebar} data-reveal>
            <section className={`card ${styles.tipCard}`}>
              <span className="iconBox"><Camera size={21} /></span>
              <h2 style={{ marginTop: 14 }}>A useful listing</h2>
              <div className={styles.steps}>
                <div className={styles.step}><span>1</span><div><strong>Show the real food</strong><small>Use recent, clear images.</small></div></div>
                <div className={styles.step}><span>2</span><div><strong>Explain condition</strong><small>Include ingredients, storage and allergens.</small></div></div>
                <div className={styles.step}><span>3</span><div><strong>Set honest timing</strong><small>Choose a realistic collection deadline.</small></div></div>
              </div>
            </section>

            <section className={`card ${styles.tipCard} ${styles.privacyCard}`}>
              <span className="iconBox"><LockKeyhole size={21} /></span>
              <h3 style={{ marginTop: 14 }}>Privacy boundary</h3>
              <p>Do not put a precise address or phone number in the public title, description, images or comments.</p>
            </section>

            <section className={`card ${styles.tipCard}`}>
              <h3><ShieldCheck size={19} style={{ verticalAlign: "-4px", marginRight: 7 }} />Before publishing</h3>
              <p><CheckCircle2 size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />Food is still suitable to share.</p>
              <p style={{ marginTop: 8 }}><Clock3 size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />The expiry time leaves enough time for collection.</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
