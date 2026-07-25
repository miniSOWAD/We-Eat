import Link from "next/link";
import {
  ArrowUpRight,
  HandHeart,
  HeartHandshake,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} data-reveal>
      <div className={`container ${styles.top}`}>
        <div className={styles.brandColumn}>
          <Link href="/" className={styles.brand} aria-label="We Eat home">
            <span className={styles.brandIcon}><HandHeart size={23} /></span>
            <span>We Eat</span>
          </Link>
          <p>
            A local food-sharing marketplace designed to keep safe surplus food
            moving—from one table to another.
          </p>
          <div className={styles.brandTags}>
            <span>Local</span><span>Private by design</span><span>Mobile first</span>
          </div>
        </div>

        <div className={styles.linkColumn}>
          <strong>Explore</strong>
          <Link href="/listings">Find nearby food</Link>
          <Link href="/share">Share surplus food</Link>
          <Link href="/how-it-works">How We Eat works</Link>
        </div>

        <div className={styles.linkColumn}>
          <strong>Community</strong>
          <Link href="/safety">Food-safety guidance</Link>
          <Link href="/register">Create an account</Link>
          <Link href="/login">Sign in</Link>
        </div>

        <div className={styles.promise}>
          <strong>Built around trust</strong>
          <div><ShieldCheck size={18} /> Private pickup details</div>
          <div><HeartHandshake size={18} /> Completion-based reviews</div>
          <div><Leaf size={18} /> Less avoidable food waste</div>
          <Link href="/safety">Read safety guidance <ArrowUpRight size={15} /></Link>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {year} We Eat. Community food sharing, handled responsibly.</span>
        <div className={styles.types} aria-label="Supported listing types">
          <span>Free</span><span>Discounted</span><span>Exchange</span>
        </div>
      </div>
    </footer>
  );
}
