import { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from '@/types/dashboard';
import { conversationAPI } from '@/api';
import { supabase } from '@/lib/supabaseClient';
import { useConversationRealtime } from '@/hooks/useConversationRealtime';
import { toast } from 'sonner';

export function useDashboardChat(userType: string) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string | undefined>(undefined);

  // Load unread count on mount
  useEffect(() => {
    conversationAPI.loadUnreadCount()
      .then(count => setTotalUnread(count))
      .catch(err => console.error('Failed to load unread count:', err));
  }, []);

  // Realtime listener for new messages
  useConversationRealtime(activeConversation, (newMsg) => {
    const currentUserId = currentUserIdRef.current;
    if (newMsg.sender_id === currentUserId) return;

    const mapped: Message = {
      id: newMsg.id,
      sender: newMsg.sender_id === currentUserId ? 'user' : 'speaker',
      content: newMsg.body,
      timestamp: new Date(newMsg.created_at).toLocaleTimeString(),
    };

    setConversations(prev => prev.map(c => {
      if (c.conversationId !== newMsg.conversation_id) return c;
      if (c.messages.some(m => m.id === newMsg.id)) return c;
      return {
        ...c,
        messages: [...c.messages, mapped],
        lastMessage: mapped.content,
        timestamp: mapped.timestamp,
      };
    }));

    conversationAPI.markRead(newMsg.conversation_id)
      .then(() => conversationAPI.loadUnreadCount())
      .then(count => setTotalUnread(count))
      .catch(() => {});
  });

  // Auto-scroll to bottom
  const activeConvData = conversations.find(c => c.conversationId === activeConversation);
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvData?.messages]);

  // Load messages when conversation is opened
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const currentUserId = auth.user?.id;
        currentUserIdRef.current = currentUserId;

        const msgs = await conversationAPI.loadMessages(activeConversation);
        const otherMsg = msgs.find((m: any) => m.sender_id !== currentUserId);
        const sender = Array.isArray(otherMsg?.sender) ? otherMsg.sender[0] : otherMsg?.sender;
        const otherName = sender?.display_name || null;

        const mapped: Message[] = msgs.map((m: any) => ({
          id: m.id,
          sender: m.sender_id === currentUserId ? 'user' as const : 'speaker' as const,
          content: m.body,
          timestamp: new Date(m.created_at).toLocaleTimeString(),
        }));

        setConversations(prev => prev.map(c => {
          if (c.conversationId === activeConversation) {
            return {
              ...c,
              speakerName: otherName || c.speakerName,
              messages: mapped,
              lastMessage: mapped.length > 0 ? mapped[mapped.length - 1].content : c.lastMessage,
            };
          }
          return c;
        }));
      } catch (error) {
        console.error('Failed to load messages:', error);
      }

      try { await conversationAPI.markRead(activeConversation); } catch {}
      try {
        const count = await conversationAPI.loadUnreadCount();
        setTotalUnread(count);
      } catch {}
    };

    fetchMessages();
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const text = messageInput;
    setMessageInput('');

    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setConversations(prev => prev.map(conversation => {
      if (conversation.conversationId === activeConversation) {
        return {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          lastMessage: newMessage.content,
          timestamp: newMessage.timestamp,
        };
      }
      return conversation;
    }));

    try {
      await conversationAPI.sendMessage(activeConversation, text);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const openConversation = async (targetId: string, name: string, topic: string) => {
    try {
      const conv = userType === 'speaker'
        ? await conversationAPI.getOrCreateConversationOrganizer(targetId)
        : await conversationAPI.getOrCreateConversation(targetId);
      const conversationId = conv.id ?? conv.conversation_id;

      const existingConv = conversations.find(c => c.conversationId === conversationId);
      if (!existingConv) {
        setConversations(prev => [...prev, {
          conversationId,
          speakerId: targetId,
          speakerName: name,
          speakerTopic: topic,
          lastMessage: '',
          timestamp: 'Now',
          unread: 0,
          messages: [],
        }]);
      }

      setActiveConversation(conversationId);
      setIsChatOpen(true);
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setActiveConversation(null);
  };

  return {
    isChatOpen,
    activeConversation,
    messageInput,
    setMessageInput,
    totalUnread,
    conversations,
    chatMessagesEndRef,
    activeConvData,
    handleSendMessage,
    openConversation,
    closeChat,
  };
}
