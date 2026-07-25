import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateListingForm } from "@/components/create-listing-form";
import { getSession } from "@/lib/server-api";
export const metadata:Metadata={title:"Share food"};
export default async function Page(){const user=await getSession();if(!user)redirect("/login?next=/share");return <main className="page"><div className="container" style={{maxWidth:900}}><span className="badge badgeFree">Create a listing</span><h1 className="sectionTitle" style={{margin:"16px 0"}}>Share food clearly and safely.</h1><p className="sectionLead">Public location is limited to city and area. Exact pickup details are stored separately.</p><CreateListingForm/></div></main>}
