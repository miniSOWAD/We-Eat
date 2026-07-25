import { FavoritesPanel } from "@/components/favorites-panel";
import { backendFetch, getToken } from "@/lib/server-api";
import type { Favorite } from "@/types";
export default async function Page(){const token=await getToken();let items:Favorite[]=[];try{items=await backendFetch<Favorite[]>("/favorites",{},token)}catch{}return <div className="stack"><div><h1 className="sectionTitle">Saved food</h1><p className="sectionLead">Favorites are stored in your account, not only in this browser.</p></div><FavoritesPanel initial={items}/></div>}
