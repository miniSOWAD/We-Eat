import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { getSession } from "@/lib/server-api";

export default async function Page() {
  const user = await getSession();
  if (!user) {
    return redirect("/login?next=/dashboard/profile");
  }

  return (
    <div className="stack">
      <div>
        <h1 className="sectionTitle">Profile</h1>
        <p className="sectionLead">
          Only your display name, avatar, bio, city and area can appear publicly.
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
