import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { backendFetch } from "@/lib/server-api";
import type { ListingBrowse, ListingType } from "@/types";
import styles from "./listings.module.css";

export const metadata: Metadata = { title: "Find food" };

const categories = ["Cooked meal", "Bakery", "Vegetables", "Fruit", "Groceries", "Dessert"];

export default async function ListingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const get = (key: string) => typeof sp[key] === "string" ? String(sp[key]) : "";
  const params = new URLSearchParams();
  ["search", "city", "category", "listing_type"].forEach((key) => {
    const value = get(key);
    if (value) params.set(key, value);
  });
  params.set("page", get("page") || "1");
  params.set("page_size", "12");

  let data: ListingBrowse = { items: [], total: 0, page: 1, page_size: 12, pages: 0 };
  let error = "";
  try {
    data = await backendFetch<ListingBrowse>(`/listings?${params}`);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load listings";
  }

  return (
    <main className="page">
      <div className="container stack">
        <div className={styles.hero}>
          <div className="pageIntro" data-hero-item>
            <div className={styles.heroMeta}>
              <span className="badge badgeDiscounted">Community marketplace</span>
              <span className="badge badgeMuted">Mobile-friendly discovery</span>
            </div>
            <h1 className="sectionTitle">Find food near you</h1>
            <p className="sectionLead">
              Search by food, area or arrangement. Public listings show enough to
              decide, while exact collection information stays private.
            </p>
          </div>
          <div className={styles.heroNote} data-hero-item>
            <LockKeyhole size={20} />
            <span>Pickup addresses and direct contact details are not exposed in the public feed.</span>
          </div>
        </div>

        <form className={`card ${styles.filterCard}`} method="get" data-reveal>
          <div className={styles.filterHead}>
            <h2><SlidersHorizontal size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />Filter listings</h2>
            <span className="help">Use one filter or combine several.</span>
          </div>
          <div className="formGrid">
            <div className="field"><label htmlFor="search">Search</label><input className="input" id="search" name="search" defaultValue={get("search")} placeholder="Rice, cake, vegetables…" /></div>
            <div className="field"><label htmlFor="city">City</label><input className="input" id="city" name="city" defaultValue={get("city")} placeholder="Dhaka" /></div>
            <div className="field"><label htmlFor="category">Category</label><input className="input" id="category" name="category" defaultValue={get("category")} placeholder="Cooked meal" /></div>
            <div className="field"><label htmlFor="listing_type">Arrangement</label><select className="select" id="listing_type" name="listing_type" defaultValue={get("listing_type") as ListingType | ""}><option value="">All types</option><option value="FREE">Free</option><option value="DISCOUNTED">Discounted</option><option value="EXCHANGE">Exchange</option></select></div>
          </div>
          <div className={styles.filterActions} style={{ marginTop: 18 }}>
            <button className="button buttonPrimary" type="submit"><Search size={17} />Apply filters</button>
            <Link className="button buttonGhost" href="/listings">Clear filters</Link>
          </div>
        </form>

        <div className={styles.categoryRow} aria-label="Popular categories" data-reveal>
          {categories.map((category) => <Link key={category} href={`/listings?category=${encodeURIComponent(category)}`}>{category}</Link>)}
        </div>

        {error && <div className="error">{error}</div>}

        <div className={styles.resultsBar} data-reveal>
          <div><strong>{data.total} listing{data.total === 1 ? "" : "s"}</strong><div className="help">Availability changes as providers accept requests.</div></div>
          <Link className="button buttonCream" href="/share"><Sparkles size={17} />Share food</Link>
        </div>

        {data.items.length ? (
          <div className="grid" data-stagger-grid>{data.items.map((item) => <ListingCard key={item.id} listing={item} />)}</div>
        ) : (
          <div className="empty" data-reveal><h2>No matching food found</h2><p className="muted">Remove a filter or check again when new food is shared.</p><Link className="button buttonPrimary" href="/share">Create the first matching listing</Link></div>
        )}

        {data.pages > 1 && (
          <nav className={styles.pagination} aria-label="Pagination" data-reveal>
            {Array.from({ length: data.pages }, (_, index) => index + 1).map((page) => {
              const query = new URLSearchParams(params);
              query.set("page", String(page));
              return <Link key={page} className={`button ${page === data.page ? "buttonPrimary" : "buttonGhost"}`} href={`/listings?${query}`}>{page}</Link>;
            })}
          </nav>
        )}
      </div>
    </main>
  );
}
