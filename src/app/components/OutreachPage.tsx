import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Loader2, Inbox, CalendarPlus } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fetchOutreachRows, respondBookingAuth, cancelBookingAuth, type BookingRequest, type BookingStatus } from '@/utils/booking';
import { supabase } from '@/lib/supabaseClient';

const SPEAKER_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Declined', value: 'declined' },
  { label: 'Expired', value: 'expired' },
];

const ORGANIZER_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Declined', value: 'declined' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Expired', value: 'expired' },
];

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  pending: { bg: '#717182', text: '#ffffff' },
  accepted: { bg: '#0B3B2E', text: '#ffffff' },
  declined: { bg: '#d4183d', text: '#ffffff' },
  cancelled: { bg: '#e9ebef', text: '#717182' },
  expired: { bg: '#e9ebef', text: '#717182' },
};

interface OutreachPageProps {
  userType: 'organizer' | 'speaker';
}

export default function OutreachPage({ userType }: OutreachPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const statusFilter = searchParams.get('status') || 'all';
  const roleFilter = userType === 'organizer' ? 'sent' : 'received' as 'sent' | 'received';
  const statusOptions = userType === 'organizer' ? ORGANIZER_STATUS_OPTIONS : SPEAKER_STATUS_OPTIONS;

  const [rows, setRows] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOutreachRows({ status: statusFilter, role: roleFilter });
      setRows(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load outreach data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, userType]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const handleRespond = async (bookingId: string, action: 'approve' | 'decline') => {
    setRespondingId(bookingId);
    try {
      await respondBookingAuth(bookingId, action);
      toast.success(action === 'approve' ? 'Booking approved' : 'Booking declined');
      loadRows();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to respond');
    } finally {
      setRespondingId(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    setRespondingId(bookingId);
    try {
      await cancelBookingAuth(bookingId);
      toast.success('Booking cancelled');
      loadRows();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel');
    } finally {
      setRespondingId(null);
    }
  };

  const isSentByMe = (row: BookingRequest) => row.organizer_user_id === currentUserId;

  const getContactLabel = (row: BookingRequest) => {
    if (isSentByMe(row)) {
      return `To: ${row.speaker_name_snapshot || 'Speaker'}`;
    }
    return `From: ${row.organization_name_snapshot || 'Organization'}`;
  };

  const handleAddToCalendar = (row: BookingRequest) => {
    const start = new Date(row.starts_at);
    const end = row.ends_at ? new Date(row.ends_at) : new Date(start.getTime() + 60 * 60 * 1000);
    const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = row.title;
    const details = row.organization_name_snapshot
      ? `Organized by ${row.organization_name_snapshot}`
      : '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCal(start)}/${formatGCal(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(row.location || '')}&sf=true&output=xml`;
    window.open(url, '_blank');
  };

  const formatEventDate = (iso: string) => {
    try {
      return format(new Date(iso), 'MMM dd, yyyy');
    } catch {
      return iso;
    }
  };

  const formatEventTime = (iso: string) => {
    try {
      return format(new Date(iso), 'h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f5]">
      {/* Header */}
      <div className="bg-white border-b border-[#e9ebef]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[#717182] hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
            Outreach
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white border border-[#e9ebef] rounded-lg p-4">
          <label
            className="block mb-1.5 text-[#717182]"
            style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
          >
            Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateFilter('status', opt.value)}
                className="px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  borderColor: statusFilter === opt.value ? '#0B3B2E' : '#e9ebef',
                  backgroundColor: statusFilter === opt.value ? '#0B3B2E' : 'white',
                  color: statusFilter === opt.value ? 'white' : '#717182',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#717182]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white border border-[#e9ebef] rounded-lg p-12 text-center">
            <Inbox className="w-10 h-10 text-[#717182] mx-auto mb-3" />
            <p className="text-[#717182]" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              No booking requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="bg-white border border-[#e9ebef] rounded-lg p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Main info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title + status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className="truncate"
                        style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '15px' }}
                      >
                        {row.title}
                      </h3>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs shrink-0"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          backgroundColor: STATUS_COLORS[row.status]?.bg ?? '#e9ebef',
                          color: STATUS_COLORS[row.status]?.text ?? '#717182',
                        }}
                      >
                        {row.status}
                      </span>
                    </div>

                    {/* Contact */}
                    <p
                      className="text-[#717182]"
                      style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                    >
                      {getContactLabel(row)}
                    </p>

                    {/* Date / time / location */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#717182]" style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatEventDate(row.starts_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatEventTime(row.starts_at)}
                        {row.ends_at && ` – ${formatEventTime(row.ends_at)}`}
                      </span>
                      {row.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {row.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Speaker received a pending request → can approve/decline */}
                    {!isSentByMe(row) && row.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          disabled={respondingId === row.id}
                          onClick={() => handleRespond(row.id, 'approve')}
                          className="bg-[#0B3B2E] text-white hover:bg-black"
                          style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
                        >
                          {respondingId === row.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Approve'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={respondingId === row.id}
                          onClick={() => handleRespond(row.id, 'decline')}
                          className="border-[#d4183d] text-[#d4183d] hover:bg-red-50"
                          style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
                        >
                          Decline
                        </Button>
                      </>
                    )}

                    {/* Speaker accepted → add to calendar */}
                    {!isSentByMe(row) && row.status === 'accepted' && (
                      <Button
                        size="sm"
                        onClick={() => handleAddToCalendar(row)}
                        className="bg-[#0B3B2E] text-white hover:bg-black"
                        style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
                      >
                        <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
                        Add to Calendar
                      </Button>
                    )}

                    {/* Organizer sent a pending request → can cancel */}
                    {isSentByMe(row) && row.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={respondingId === row.id}
                        onClick={() => handleCancel(row.id)}
                        className="border-[#e9ebef] text-[#717182] hover:bg-[#f3f3f5]"
                        style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
                      >
                        {respondingId === row.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Cancel'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
