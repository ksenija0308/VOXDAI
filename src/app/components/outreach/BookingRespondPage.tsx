import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { respondBooking } from "@/utils/booking";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function BookingRespondPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");
  const action = params.get("action") as "approve" | "decline" | null;

  useEffect(() => {
    const bookingId = params.get("bookingId");
    const token = params.get("token");

    (async () => {
      try {
        if (!bookingId || !action || !token)
          throw new Error("Invalid or incomplete link.");
        if (action !== "approve" && action !== "decline")
          throw new Error("Invalid action.");

        const res = await respondBooking({ bookingId, action, token });
        setState("ok");
        setMessage(
          res.message ??
            (action === "approve"
              ? "Booking has been approved."
              : "Booking has been declined.")
        );
      } catch (e: any) {
        setState("error");
        setMessage(e.message ?? "Something went wrong.");
      }
    })();
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f3f3f5]">
      <div className="w-full max-w-md bg-white border border-[#e9ebef] rounded-xl shadow-lg p-6">
        <h1
          className="text-lg mb-4"
          style={{ fontFamily: "Helvetica, Arial, sans-serif", fontWeight: "bold" }}
        >
          Booking Response
        </h1>

        {state === "loading" && (
          <div className="flex items-center gap-3 text-[#717182]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
              Processing your response...
            </span>
          </div>
        )}

        {state === "ok" && (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#0B3B2E] mt-0.5 shrink-0" />
            <span
              className="text-[#0B3B2E]"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
            >
              {message}
            </span>
          </div>
        )}

        {state === "error" && (
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <span
              className="text-red-600"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
            >
              {message}
            </span>
          </div>
        )}

        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-[#e9ebef] hover:border-[#0B3B2E] hover:bg-[#f3f3f5] transition-colors"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
