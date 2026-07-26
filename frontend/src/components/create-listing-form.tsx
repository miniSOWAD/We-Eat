"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ImagePlus, Loader2, LockKeyhole, PackageOpen, HandHeart } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Listing, ListingImage, ListingType } from "@/types";
import styles from "./create-listing-form.module.css";

const typeHelp: Record<ListingType, string> = {
  FREE: "No payment",
  DISCOUNTED: "Lower price",
  EXCHANGE: "Food for food",
};

export function CreateListingForm() {
  const router = useRouter();
  const [type, setType] = useState<ListingType>("FREE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const files = form.getAll("images").filter((value) => value instanceof File && value.size > 0) as File[];
      if (!files.length) throw new Error("Add at least one food image");

      const images: ListingImage[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const body = new FormData();
        body.set("file", files[index]);
        const uploaded = await api<Omit<ListingImage, "position">>("/listings/upload", { method: "POST", body });
        images.push({ ...uploaded, position: index });
      }

      const expires = new Date(String(form.get("expires_at")));
      const preparedRaw = String(form.get("prepared_at") || "");
      const payload = {
        listing_type: type,
        title: form.get("title"),
        description: form.get("description"),
        category: form.get("category"),
        quantity: Number(form.get("quantity")),
        unit: form.get("unit"),
        original_price: type === "DISCOUNTED" && form.get("original_price") ? Number(form.get("original_price")) : null,
        discounted_price: type === "DISCOUNTED" ? Number(form.get("discounted_price")) : null,
        exchange_for: type === "EXCHANGE" ? form.get("exchange_for") : null,
        prepared_at: preparedRaw ? new Date(preparedRaw).toISOString() : null,
        expires_at: expires.toISOString(),
        city: form.get("city"),
        area: form.get("area"),
        is_vegetarian: form.get("is_vegetarian") === "on",
        allergens: form.get("allergens") || null,
        images,
        private_details: {
          pickup_address: form.get("pickup_address"),
          contact_phone: form.get("contact_phone") || null,
          delivery_notes: form.get("delivery_notes") || null,
        },
      };

      const created = await api<Listing>("/listings", { method: "POST", body: payload });
      toast.success("Food listing published");
      router.push(`/listings/${created.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create listing");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`card stack ${styles.form}`} onSubmit={submit}>
      {error && <div className="error">{error}</div>}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><h2>1. Choose the arrangement</h2><p>Make the expectation clear before anyone sends a request.</p></div>
          <span className="iconBox"><HandHeart size={20} /></span>
        </div>
        <div className={styles.typeGrid}>
          {(["FREE", "DISCOUNTED", "EXCHANGE"] as ListingType[]).map((value) => (
            <button key={value} type="button" className={`button ${styles.typeButton} ${type === value ? "buttonPrimary" : "buttonGhost"}`} onClick={() => setType(value)}>
              <span>{value}</span><small>{typeHelp[value]}</small>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><h2>2. Describe the food</h2><p>Accurate details help people decide safely.</p></div>
          <span className="iconBox"><PackageOpen size={20} /></span>
        </div>
        <div className="formGrid">
          <div className="field full"><label htmlFor="title">Listing title</label><input className="input" id="title" name="title" minLength={4} maxLength={160} placeholder="Fresh homemade chicken biryani" required /></div>
          <div className="field full"><label htmlFor="description">Description</label><textarea className="textarea" id="description" name="description" minLength={10} placeholder="Describe ingredients, condition, packaging and timing honestly." required /></div>
          <div className="field"><label htmlFor="category">Category</label><select className="select" id="category" name="category" required><option value="">Select category</option><option>Cooked meal</option><option>Bakery</option><option>Vegetables</option><option>Fruit</option><option>Groceries</option><option>Dessert</option><option>Beverage</option><option>Other</option></select></div>
          <div className="field"><label htmlFor="quantity">Quantity</label><div className={styles.quantityGrid}><input className="input" id="quantity" name="quantity" type="number" min={1} placeholder="2" required /><input className="input" name="unit" placeholder="portions / kg" required /></div></div>
          {type === "DISCOUNTED" && <><div className="field"><label>Original price (BDT)</label><input className="input" name="original_price" type="number" min={0} step="0.01" /></div><div className="field"><label>Discounted price per unit (BDT)</label><input className="input" name="discounted_price" type="number" min={0} step="0.01" required /></div></>}
          {type === "EXCHANGE" && <div className="field full"><label>What would you accept in exchange?</label><input className="input" name="exchange_for" maxLength={300} placeholder="Vegetables, rice or another homemade meal" required /></div>}
          <div className="field"><label>Prepared at (optional)</label><input className="input" name="prepared_at" type="datetime-local" /></div>
          <div className="field"><label>Expires / collect before</label><input className="input" name="expires_at" type="datetime-local" required /></div>
          <div className="field"><label>City</label><input className="input" name="city" placeholder="Dhaka" required /></div>
          <div className="field"><label>Area</label><input className="input" name="area" placeholder="Dhanmondi" required /></div>
          <label className={`full ${styles.checkbox}`}><input type="checkbox" name="is_vegetarian" /><span>Mark this food as vegetarian</span></label>
          <div className="field full"><label>Allergen information</label><input className="input" name="allergens" placeholder="Milk, nuts, gluten, egg…" /></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><h2>3. Add food images</h2><p>Use current images that show the actual item and packaging.</p></div>
          <span className="iconBox"><ImagePlus size={20} /></span>
        </div>
        <div className="field"><label htmlFor="images">Food images</label><input className="input" id="images" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required /><span className="help">1–6 images. JPEG, PNG or WebP; maximum 5 MB each.</span></div>
      </section>

      <section className={`${styles.section} ${styles.privateSection}`}>
        <div className={styles.sectionHeader}>
          <div><h2>4. Private collection details</h2><p>Only accepted participants can view these collection details.</p></div>
          <span className="iconBox"><LockKeyhole size={20} /></span>
        </div>
        <div className="field"><label>Exact pickup address</label><textarea className="textarea" name="pickup_address" required /></div>
        <div className="formGrid"><div className="field"><label>Contact phone</label><input className="input" name="contact_phone" /></div><div className="field"><label>Delivery notes</label><input className="input" name="delivery_notes" /></div></div>
      </section>

      <label className={styles.checkbox}><input type="checkbox" required /><span>I confirm that the food description, timing and safety information are accurate.</span></label>
      <button className={`button buttonPrimary buttonBlock ${styles.submit}`} disabled={busy}>{busy ? <><Loader2 size={18} className="spin" />Uploading and publishing…</> : "Publish listing"}</button>
    </form>
  );
}
