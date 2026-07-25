import { redirect } from "next/navigation";
import { ExchangesPanel } from "@/components/exchanges-panel";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { Exchange } from "@/types";

export default async function Page() {
  const [token, user] = await Promise.all([getToken(), getSession()]);
  if (!user) {
    return redirect("/login?next=/dashboard/exchanges");
  }

  let items: Exchange[] = [];
  try {
    items = await backendFetch<Exchange[]>("/exchanges/mine", {}, token);
  } catch {
    // The page still renders an empty state while the API is unavailable.
  }

  return (
    <div className="stack">
      <div>
        <h1 className="sectionTitle">Exchanges</h1>
        <p className="sectionLead">
          Track offers, acceptance and two-party completion.
        </p>
      </div>
      <ExchangesPanel initial={items} userId={user.id} />
    </div>
  );
}
