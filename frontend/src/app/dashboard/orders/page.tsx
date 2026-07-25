import { redirect } from "next/navigation";
import { OrdersPanel } from "@/components/orders-panel";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { Order } from "@/types";

export default async function Page() {
  const [token, user] = await Promise.all([getToken(), getSession()]);
  if (!user) {
    return redirect("/login?next=/dashboard/orders");
  }

  let items: Order[] = [];
  try {
    items = await backendFetch<Order[]>("/orders/mine", {}, token);
  } catch {
    // The page still renders an empty state while the API is unavailable.
  }

  return (
    <div className="stack">
      <div>
        <h1 className="sectionTitle">Food requests</h1>
        <p className="sectionLead">
          A provider accepts one request, then both parties confirm completion.
        </p>
      </div>
      <OrdersPanel initial={items} userId={user.id} />
    </div>
  );
}
