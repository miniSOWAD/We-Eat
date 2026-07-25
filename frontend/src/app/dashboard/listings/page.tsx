import { MyListings } from "@/components/my-listings";
import { backendFetch, getToken } from "@/lib/server-api";
import type { Listing } from "@/types";
export default async function Page(){const token=await getToken();let items:Listing[]=[];try{items=await backendFetch<Listing[]>("/listings/mine",{},token)}catch{}return <div className="stack"><div><h1 className="sectionTitle">My listings</h1><p className="sectionLead">Manage every listing, including removed or completed ones.</p></div><MyListings initial={items}/></div>}
