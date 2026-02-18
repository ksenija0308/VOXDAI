import { supabase } from "@/lib/supabaseClient";

export type BookingRequest = {
  id: string;
  organizer_id: string;
  speaker_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location?: string;
  notes?: string;
  status: "pending" | "approved" | "declined";
  created_at: string;
  updated_at: string;
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
