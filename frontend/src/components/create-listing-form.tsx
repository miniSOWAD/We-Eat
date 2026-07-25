"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Listing, ListingImage, ListingType } from "@/types";

export function CreateListingForm(){
  const router=useRouter();const [type,setType]=useState<ListingType>("FREE");const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");const form=new FormData(e.currentTarget);
    try{
      const files=form.getAll("images").filter(v=>v instanceof File&&v.size>0) as File[];
      if(!files.length)throw new Error("Add at least one food image");
      const images:ListingImage[]=[];
      for(let i=0;i<files.length;i++){const body=new FormData();body.set("file",files[i]);const uploaded=await api<Omit<ListingImage,"position">>("/listings/upload",{method:"POST",body});images.push({...uploaded,position:i})}
      const expires=new Date(String(form.get("expires_at")));
      const preparedRaw=String(form.get("prepared_at")||"");
      const payload={listing_type:type,title:form.get("title"),description:form.get("description"),category:form.get("category"),quantity:Number(form.get("quantity")),unit:form.get("unit"),original_price:type==="DISCOUNTED"&&form.get("original_price")?Number(form.get("original_price")):null,discounted_price:type==="DISCOUNTED"?Number(form.get("discounted_price")):null,exchange_for:type==="EXCHANGE"?form.get("exchange_for"):null,prepared_at:preparedRaw?new Date(preparedRaw).toISOString():null,expires_at:expires.toISOString(),city:form.get("city"),area:form.get("area"),is_vegetarian:form.get("is_vegetarian")==="on",allergens:form.get("allergens")||null,images,private_details:{pickup_address:form.get("pickup_address"),contact_phone:form.get("contact_phone")||null,delivery_notes:form.get("delivery_notes")||null}};
      const created=await api<Listing>("/listings",{method:"POST",body:payload});toast.success("Food listing published");router.push(`/listings/${created.id}`);router.refresh();
    }catch(e){setError(e instanceof Error?e.message:"Unable to create listing")}finally{setBusy(false)}
  }
  return <form className="card stack" style={{padding:28}} onSubmit={submit}>
    {error&&<div className="error">{error}</div>}
    <div className="field"><label>How are you offering this food?</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{(["FREE","DISCOUNTED","EXCHANGE"] as ListingType[]).map(v=><button key={v} type="button" className={`button ${type===v?"buttonPrimary":"buttonGhost"}`} onClick={()=>setType(v)}>{v}</button>)}</div></div>
    <div className="formGrid">
      <div className="field full"><label htmlFor="title">Listing title</label><input className="input" id="title" name="title" minLength={4} maxLength={160} placeholder="Fresh homemade chicken biryani" required/></div>
      <div className="field full"><label htmlFor="description">Description</label><textarea className="textarea" id="description" name="description" minLength={10} placeholder="Describe ingredients, condition, packaging and timing honestly." required/></div>
      <div className="field"><label htmlFor="category">Category</label><select className="select" id="category" name="category" required><option value="">Select category</option><option>Cooked meal</option><option>Bakery</option><option>Vegetables</option><option>Fruit</option><option>Groceries</option><option>Dessert</option><option>Beverage</option><option>Other</option></select></div>
      <div className="field"><label htmlFor="quantity">Quantity</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><input className="input" id="quantity" name="quantity" type="number" min={1} required/><input className="input" name="unit" placeholder="portions / kg" required/></div></div>
      {type==="DISCOUNTED"&&<><div className="field"><label>Original price (BDT)</label><input className="input" name="original_price" type="number" min={0} step="0.01"/></div><div className="field"><label>Discounted price per unit (BDT)</label><input className="input" name="discounted_price" type="number" min={0} step="0.01" required/></div></>}
      {type==="EXCHANGE"&&<div className="field full"><label>What would you accept in exchange?</label><input className="input" name="exchange_for" maxLength={300} placeholder="Vegetables, rice or another homemade meal" required/></div>}
      <div className="field"><label>Prepared at (optional)</label><input className="input" name="prepared_at" type="datetime-local"/></div>
      <div className="field"><label>Expires / collect before</label><input className="input" name="expires_at" type="datetime-local" required/></div>
      <div className="field"><label>City</label><input className="input" name="city" placeholder="Dhaka" required/></div><div className="field"><label>Area</label><input className="input" name="area" placeholder="Dhanmondi" required/></div>
      <div className="field full"><label><input type="checkbox" name="is_vegetarian"/> Vegetarian</label></div>
      <div className="field full"><label>Allergen information</label><input className="input" name="allergens" placeholder="Milk, nuts, gluten, egg…"/></div>
      <div className="field full"><label htmlFor="images"><ImagePlus size={17}/> Food images</label><input className="input" id="images" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required/><span className="help">1–6 images. Each must be JPEG, PNG or WebP and no larger than 5 MB.</span></div>
    </div>
    <div style={{background:"var(--cream-soft)",padding:20,borderRadius:18}} className="stack"><h3 style={{margin:0}}>Private collection details</h3><p className="help">These fields are not returned by the public listing API.</p><div className="field"><label>Exact pickup address</label><textarea className="textarea" name="pickup_address" required/></div><div className="formGrid"><div className="field"><label>Contact phone</label><input className="input" name="contact_phone"/></div><div className="field"><label>Delivery notes</label><input className="input" name="delivery_notes"/></div></div></div>
    <label><input type="checkbox" required/> I confirm that the food description and safety information are accurate.</label>
    <button className="button buttonPrimary" disabled={busy}>{busy?<><Loader2 size={18} className="spin"/>Uploading and publishing…</>:"Publish listing"}</button>
  </form>
}
