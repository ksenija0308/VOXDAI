import { supabase } from '@/lib/supabaseClient';
import { authAPI } from './auth';

// Conversation API
export const conversationAPI = {
  getOrCreateConversation: async (matchId: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const accessToken = await authAPI.getAccessToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/get-or-create-conversation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ speaker_profile_id: matchId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get or create conversation: ${response.status}`);
    }

    return response.json();
  },

  getOrCreateConversationOrganizer: async (organizerProfileId: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const accessToken = await authAPI.getAccessToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/get-or-create-conversation-organizer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organization_profile_id: organizerProfileId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get or create conversation: ${response.status}`);
    }

    return response.json();
  },

  sendMessage: async (conversationId: string, text: string) => {
    const content = text.trim();
    if (!content) return;

    const { error } = await supabase.functions.invoke('send-message', {
      body: { conversationId, content },
    });
    if (error) throw error;
  },

  loadMessages: async (conversationId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, body, created_at, sender_id,
        sender:profiles!messages_sender_id_fkey (display_name, avatar_url, role)
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).reverse();
  },

  loadMyConversations: async () => {
    const { data: auth } = await supabase.auth.getUser();
    const currentUserId = auth.user?.id;
    if (!currentUserId) throw new Error('Not authenticated');

    // Get my conversation IDs
    const { data: myRows, error: myErr } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', currentUserId);

    if (myErr) throw myErr;
    if (!myRows?.length) return [];

    const convIds = myRows.map(r => r.conversation_id);

    // Get other participants with display names (bypasses RLS via SECURITY DEFINER)
    const { data: otherParticipants, error: partErr } = await supabase
      .rpc('get_other_participants', {
        p_conversation_ids: convIds,
        p_current_user_id: currentUserId,
      });

    if (partErr) throw partErr;

    const otherUserMap = new Map<string, { id: string; name: string | null }>();
    (otherParticipants ?? []).forEach((p: any) => {
      otherUserMap.set(p.conversation_id, {
        id: p.other_user_id,
        name: p.display_name ?? null,
      });
    });

    return myRows.map(r => ({
      conversation_id: r.conversation_id,
      last_read_at: r.last_read_at,
      other_user_id: otherUserMap.get(r.conversation_id)?.id ?? null,
      other_user_name: otherUserMap.get(r.conversation_id)?.name ?? null,
    }));
  },

  loadUnreadCount: async () => {
    const { data, error } = await supabase.rpc('my_total_unread_messages');
    if (error) throw error;
    return Number(data ?? 0);
  },

  markRead: async (conversationId: string) => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: now })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .select('conversation_id,user_id,last_read_at');

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error('markRead updated 0 rows. Participant row not found or blocked by RLS.');
    }
  },
};
