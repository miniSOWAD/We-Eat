import { redirect } from "next/navigation";
import { UserManagementPanel } from "@/components/user-management-panel";
import { backendFetch,getSession,getToken } from "@/lib/server-api";
import type { AdminUser } from "@/types";
export default async function Page(){const[user,token]=await Promise.all([getSession(),getToken()]);if(!user)return redirect("/login?next=/dashboard/admin/users");if(user.role!=="ADMIN")return redirect("/dashboard");let items:AdminUser[]=[];try{items=await backendFetch<AdminUser[]>("/admin/users?role=USER",{},token)}catch{}return <div className="stack"><div className="pageIntro"><span className="badge badgeDiscounted">Administration</span><h1 className="sectionTitle">Users</h1><p className="sectionLead">Search basic users by name, username or email. Passwords are never exposed; only secure hashes exist in the database.</p></div><UserManagementPanel initial={items} canPromote/></div>}
