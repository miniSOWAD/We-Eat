import { redirect } from "next/navigation";
import { UserManagementPanel } from "@/components/user-management-panel";
import { backendFetch,getSession,getToken } from "@/lib/server-api";
import type { AdminUser } from "@/types";
export default async function Page(){const[user,token]=await Promise.all([getSession(),getToken()]);if(!user)return redirect("/login?next=/dashboard/moderator/users");if(!["MODERATOR","ADMIN"].includes(user.role))return redirect("/dashboard");let items:AdminUser[]=[];try{items=await backendFetch<AdminUser[]>("/admin/users?role=USER",{},token)}catch{}return <div className="stack"><div className="pageIntro"><span className="badge badgeExchange">Moderator tools</span><h1 className="sectionTitle">Users</h1><p className="sectionLead">Search basic users and suspend or restore their access. Moderator and administrator accounts are outside your authority.</p></div><UserManagementPanel initial={items} canPromote={false}/></div>}
