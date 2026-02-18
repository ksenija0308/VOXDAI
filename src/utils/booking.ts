import { supabase } from "@/lib/supabaseClient";

export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled" | "expired";

export type BookingRequest = {
  id: string;
  organizer_user_id: string;
  speaker_user_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location?: string;
  notes?: string;
  status: BookingStatus;
  created_at: string;
  responded_at?: string;
  organization_name_snapshot?: string;
  speaker_name_snapshot?: string;
};

export type CreateBookingPayload = {
  speakerProfileId: string;
  title: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  timezone: string;
  location?: string;
  notes?: string;
};

export async function createBooking(payload: CreateBookingPayload) {
  const { data, error } = await supabase.functions.invoke("create-booking", {
    body: payload,
  });
  if (error) throw error;
  return data as { ok?: boolean; bookingId: string; emailSent: boolean };
}

export async function respondBooking(payload: {
  bookingId: string;
  action: "approve" | "decline";
  token: string;
}) {
  const { data, error } = await supabase.functions.invoke("respond-booking", {
    body: payload,
  });
  if (error) throw error;
  return data as {
    ok: boolean;
    status?: string;
    message?: string;
    emailSent?: boolean;
  };
}

export async function listMyBookings() {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BookingRequest[];
}

export async function respondBookingAuth(bookingId: string, action: "approve" | "decline") {
  const { data, error } = await supabase.functions.invoke("respond-booking-auth", {
    body: { bookingId, action },
  });
  if (error) throw error;
  return data;
}

export async function cancelBookingAuth(bookingId: string) {
  const { data, error } = await supabase.functions.invoke("cancel-booking-auth", {
    body: { bookingId },
  });
  if (error) throw error;
  return data;
}

export async function fetchOutreachRows(params: {
  status?: string;
  role?: "all" | "sent" | "received";
}) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Not authenticated");

  let q = supabase
    .from("booking_requests")
    .select(
      "id,title,starts_at,ends_at,timezone,location,status,created_at,responded_at,organizer_user_id,speaker_user_id,organization_name_snapshot,speaker_name_snapshot"
    )
    .order("created_at", { ascending: false });

  if (params.status && params.status !== "all") {
    q = q.eq("status", params.status);
  }

  if (params.role === "sent") {
    q = q.eq("organizer_user_id", userId);
  } else if (params.role === "received") {
    q = q.eq("speaker_user_id", userId);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as BookingRequest[];
}
