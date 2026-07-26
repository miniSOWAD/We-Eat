import { redirect } from "next/navigation";
import { AuditLogPanel } from "@/components/audit-log-panel";
import { backendFetch,getSession,getToken } from "@/lib/server-api";
import type { AuditLog } from "@/types";
export default async function Page(){const[user,token]=await Promise.all([getSession(),getToken()]);if(!user)return redirect("/login?next=/dashboard/moderator/audit-logs");if(!["MODERATOR","ADMIN"].includes(user.role))return redirect("/dashboard");let items:AuditLog[]=[];try{items=await backendFetch<AuditLog[]>("/admin/audit-logs",{},token)}catch{}return <div className="stack"><div className="pageIntro"><span className="badge badgeMuted">Accountability</span><h1 className="sectionTitle">Audit logs</h1><p className="sectionLead">Review recorded moderation actions and their affected targets.</p></div><AuditLogPanel items={items}/></div>}
