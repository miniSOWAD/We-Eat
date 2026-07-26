import { redirect } from "next/navigation";
import { ModeratorManagementPanel } from "@/components/moderator-management-panel";
import { backendFetch,getSession,getToken } from "@/lib/server-api";
import type { AdminUser } from "@/types";
export default async function Page(){const[user,token]=await Promise.all([getSession(),getToken()]);if(!user)return redirect("/login?next=/dashboard/admin/moderators");if(user.role!=="ADMIN")return redirect("/dashboard");let items:AdminUser[]=[];try{items=await backendFetch<AdminUser[]>("/admin/moderators",{},token)}catch{}return <div className="stack"><div className="pageIntro"><span className="badge badgeExchange">Role management</span><h1 className="sectionTitle">Moderators</h1><p className="sectionLead">Review moderator accounts, revoke the role or suspend access. Only administrators can change moderator membership.</p></div><ModeratorManagementPanel initial={items}/></div>}
