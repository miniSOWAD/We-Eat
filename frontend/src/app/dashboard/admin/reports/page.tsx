import { redirect } from "next/navigation";
import { ModerationPanel } from "@/components/moderation-panel";
import { backendFetch,getSession,getToken } from "@/lib/server-api";
import type { Report } from "@/types";
export default async function Page(){const[user,token]=await Promise.all([getSession(),getToken()]);if(!user)return redirect("/login?next=/dashboard/admin/reports");if(user.role!=="ADMIN")return redirect("/dashboard");let items:Report[]=[];try{items=await backendFetch<Report[]>("/reports/moderation",{},token)}catch{}return <div className="stack"><div className="pageIntro"><span className="badge badgeFree">Safety queue</span><h1 className="sectionTitle">Reports</h1><p className="sectionLead">Investigate reports and record a transparent resolution outcome.</p></div><ModerationPanel initial={items}/></div>}
