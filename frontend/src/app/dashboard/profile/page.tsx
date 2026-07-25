import { redirect } from "next/navigation";
import { Eye, LockKeyhole } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { getSession } from "@/lib/server-api";

export default async function Page() {
  const user = await getSession();
  if (!user) return redirect("/login?next=/dashboard/profile");

  return (
    <div className="stack">
      <div className="pageIntro"><span className="badge badgeDiscounted">Account profile</span><h1 className="sectionTitle">Profile</h1><p className="sectionLead">Keep your community-facing information accurate without exposing private fulfilment data.</p></div>
      <div className="softPanel" data-reveal><div style={{ display: "grid", gap: 9 }}><span><Eye size={17} style={{ verticalAlign: "-4px", marginRight: 7 }} /><strong>Potentially public:</strong> display name, avatar, bio, city and area.</span><span><LockKeyhole size={17} style={{ verticalAlign: "-4px", marginRight: 7 }} /><strong>Not public listing data:</strong> exact pickup address and private transaction details.</span></div></div>
      <div data-reveal><ProfileForm user={user} /></div>
    </div>
  );
}
