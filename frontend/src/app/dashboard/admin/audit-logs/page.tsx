import { redirect } from "next/navigation";
import { AuditLogPanel } from "@/components/audit-log-panel";
import { backendFetch,getSession,getToken } from "@/lib/server-api";
import type { AuditLog } from "@/types";
export default async function Page(){const[user,token]=await Promise.all([getSession(),getToken()]);if(!user)return redirect("/login?next=/dashboard/admin/audit-logs");if(user.role!=="ADMIN")return redirect("/dashboard");let items:AuditLog[]=[];try{items=await backendFetch<AuditLog[]>("/admin/audit-logs",{},token)}catch{}return <div className="stack"><div className="pageIntro"><span className="badge badgeMuted">Accountability</span><h1 className="sectionTitle">Audit logs</h1><p className="sectionLead">Review recorded role, suspension and report-resolution actions.</p></div><AuditLogPanel items={items}/></div>}
