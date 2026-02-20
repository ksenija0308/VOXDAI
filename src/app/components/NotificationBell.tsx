import { Bell } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '@/utils/api';
import { supabase } from '@/lib/supabaseClient';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  is_read: boolean;
  created_at: string;
  entity_type: string | null;
  entity_id: string | null;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const [items, count] = await Promise.all([
          notificationAPI.loadNotifications(),
          notificationAPI.getUnreadCount(),
        ]);
        setNotifications(items);
        setUnread(count);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    load();
  }, []);

  // Subscribe to realtime notifications
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      unsubscribe = notificationAPI.subscribeToNotifications(user.id, (n: Notification) => {
        setNotifications((prev) => [n, ...prev]);
        setUnread((u) => u + 1);
      });
    };

    setup();
    return () => unsubscribe?.();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = useCallback(async (n: Notification) => {
    if (!n.is_read) {
      try {
        await notificationAPI.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
        );
        setUnread((u) => Math.max(0, u - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    setOpen(false);
    if (n.href) navigate(n.href);
  }, [navigate]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  return (
    <div className="relative h-5" ref={containerRef}>
      <button
        className="text-[#717182] hover:text-black relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-[#e9ebef] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e9ebef] flex items-center justify-between">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600 }}>
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#717182] hover:text-black"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#717182]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors border-b border-[#e9ebef] last:border-b-0 ${
                    !n.is_read ? 'bg-[#f8f9fb]' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 bg-[#0B3B2E] rounded-full shrink-0" />
                    )}
                    <div className={!n.is_read ? '' : 'ml-4'}>
                      <p
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: n.is_read ? 400 : 600 }}
                        className="text-black leading-snug"
                      >
                        {n.title}
                      </p>
                      {n.body && (
                        <p
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                          className="text-[#717182] mt-0.5 line-clamp-2"
                        >
                          {n.body}
                        </p>
                      )}
                      <p
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px' }}
                        className="text-[#717182] mt-1"
                      >
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
