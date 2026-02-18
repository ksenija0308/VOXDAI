import { supabase } from "@/lib/supabaseClient";

export async function fetchOutreachCounts() {
  const contactedQuery = supabase
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

  const confirmedQuery = supabase
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted");

  const declinedQuery = supabase
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "declined");

  const [contacted, confirmed, declined] = await Promise.all([
    contactedQuery,
    confirmedQuery,
    declinedQuery,
  ]);

  if (contacted.error) throw contacted.error;
  if (confirmed.error) throw confirmed.error;
  if (declined.error) throw declined.error;

  return {
    contacted: contacted.count ?? 0,
    confirmed: confirmed.count ?? 0,
    declined: declined.count ?? 0,
  };
}

