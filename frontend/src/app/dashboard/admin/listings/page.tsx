import { redirect } from "next/navigation";
import { ListingManagementPanel } from "@/components/listing-management-panel";
import { backendFetch,getSession,getToken } from "@/lib/server-api";
import type { Listing } from "@/types";
export default async function Page(){const[user,token]=await Promise.all([getSession(),getToken()]);if(!user)return redirect("/login?next=/dashboard/admin/listings");if(user.role!=="ADMIN")return redirect("/dashboard");let items:Listing[]=[];try{items=await backendFetch<Listing[]>("/admin/listings",{},token)}catch{}return <div className="stack"><div className="pageIntro"><span className="badge badgeDiscounted">Content management</span><h1 className="sectionTitle">Listings</h1><p className="sectionLead">Review current food listings and remove content that violates platform rules.</p></div><ListingManagementPanel initial={items}/></div>}
