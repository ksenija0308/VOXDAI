import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Shared state so the 30s interval ping includes the current conversation
let currentConversationId: string | null = null;

function ping() {
  supabase.functions.invoke('presence-ping', {
    body: { activeConversationId: currentConversationId },
  });
}

/**
 * Pings the presence-ping edge function every 30s while the app is open.
 * The backend uses this to skip email notifications for active users.
 */
export function usePresencePing() {
  useEffect(() => {
    ping();
    const timer = setInterval(ping, 30_000);
    return () => clearInterval(timer);
  }, []);
}

/**
 * Sets the active conversation so every ping (including the 30s interval)
 * tells the backend which conversation the user is currently viewing.
 */
export function useConversationPresence(conversationId: string | null) {
  useEffect(() => {
    if (!conversationId) return;

    currentConversationId = conversationId;
    ping(); // notify immediately

    return () => {
      currentConversationId = null;
      ping(); // clear on leave
    };
  }, [conversationId]);
}
