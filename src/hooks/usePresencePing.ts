import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Pings the presence-ping edge function every 30s while the app is open.
 * The backend uses this to skip email notifications for active users.
 */
export function usePresencePing() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    async function ping(activeConversationId: string | null) {
      await supabase.functions.invoke('presence-ping', {
        body: { activeConversationId },
      });
    }

    // call immediately then every 30s
    ping(null);
    timer = setInterval(() => ping(null), 30_000);

    return () => clearInterval(timer);
  }, []);
}

/**
 * Pings presence with the active conversation ID so the backend knows
 * the user is currently viewing this conversation (no need to email).
 */
export function useConversationPresence(conversationId: string | null) {
  useEffect(() => {
    if (!conversationId) return;

    supabase.functions.invoke('presence-ping', {
      body: { activeConversationId: conversationId },
    });

    return () => {
      // user left this conversation
      supabase.functions.invoke('presence-ping', {
        body: { activeConversationId: null },
      });
    };
  }, [conversationId]);
}
