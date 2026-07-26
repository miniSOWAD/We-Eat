import { redirect } from "next/navigation";
import { Eye, LockKeyhole } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { getSession } from "@/lib/server-api";

export default async function Page(){const user=await getSession();if(!user)return redirect("/login?next=/dashboard/settings");return <div className="stack"><div className="pageIntro"><span className="badge badgeDiscounted">Account settings</span><h1 className="sectionTitle">Profile and photo</h1><p className="sectionLead">Update your username, public details and profile photo.</p></div><div className="softPanel" data-reveal><div style={{display:"grid",gap:9}}><span><Eye size={17} style={{verticalAlign:"-4px",marginRight:7}}/><strong>Public:</strong> name, username, avatar, bio, city and area.</span><span><LockKeyhole size={17} style={{verticalAlign:"-4px",marginRight:7}}/><strong>Private:</strong> email, phone and transaction details.</span></div></div><div data-reveal><ProfileForm user={user}/></div></div>}
