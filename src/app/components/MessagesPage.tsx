import { Mail, Send, X as XIcon, LogOut, User, ArrowLeft } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { conversationAPI, authAPI } from '@/utils/api';
import { useLogoContext } from '@/context/LogoContext';
import { useConversationPresence } from '@/hooks/usePresencePing';
import { useConversationRealtime } from '@/hooks/useConversationRealtime';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { FormData } from '@/types/formData';

interface MessagesPageProps {
  formData: FormData;
  onLogout?: () => void;
}

interface Message {
  id: number;
  sender: 'user' | 'speaker';
  content: string;
  timestamp: string;
}

interface Conversation {
  conversationId: string;
  speakerId: string;
  speakerName: string;
  speakerTopic: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export default function MessagesPage({ formData, onLogout }: MessagesPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logoUrl } = useLogoContext();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string | undefined>();

  // Tell backend which conversation the user is viewing (skips email notifications)
  useConversationPresence(activeConversation);

  // Realtime listener for new messages
  useConversationRealtime(activeConversation, (newMsg) => {
    const currentUserId = currentUserIdRef.current;

    // Skip own messages — already added optimistically in handleSendMessage
    if (newMsg.sender_id === currentUserId) return;

    const mapped: Message = {
      id: newMsg.id,
      sender: newMsg.sender_id === currentUserId ? 'user' as const : 'speaker' as const,
      content: newMsg.body,
      timestamp: new Date(newMsg.created_at).toLocaleTimeString(),
    };

    setConversations(prev => prev.map(c => {
      if (c.conversationId !== newMsg.conversation_id) return c;
      // Avoid duplicate if sender also receives own event
      if (c.messages.some(m => m.id === newMsg.id)) return c;
      return {
        ...c,
        messages: [...c.messages, mapped],
        lastMessage: mapped.content,
        timestamp: mapped.timestamp,
      };
    }));

    // Mark as read immediately since the chat is open, then refresh count
    conversationAPI.markRead(newMsg.conversation_id)
      .then(() => conversationAPI.loadUnreadCount())
      .then(count => setTotalUnread(count))
      .catch(() => {});
  });

  // Auto-scroll to bottom when messages change
  const activeConv = conversations.find(c => c.conversationId === activeConversation);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Load unread count on mount
  useEffect(() => {
    conversationAPI.loadUnreadCount()
      .then(count => setTotalUnread(count))
      .catch(err => console.error('Failed to load unread count:', err));
  }, []);

  // Load conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const currentUserId = auth.user?.id;
        if (!currentUserId) return;

        const rows = await conversationAPI.loadMyConversations();
        if (rows.length === 0) {
          setIsLoading(false);
          return;
        }

        const convIds = rows.map((r: any) => r.conversation_id);
        const { data: allMessages } = await supabase
          .from('messages')
          .select(`
            conversation_id, body, created_at, sender_id,
            sender:profiles!messages_sender_id_fkey (display_name)
          `)
          .in('conversation_id', convIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        const convDataMap = new Map<string, { lastMsg: any; otherName: string }>();
        (allMessages ?? []).forEach((m: any) => {
          const cid = m.conversation_id;
          const existing = convDataMap.get(cid);

          if (!existing) {
            convDataMap.set(cid, { lastMsg: m, otherName: '' });
          }

          if (m.sender_id !== currentUserId && m.sender?.display_name) {
            const entry = convDataMap.get(cid)!;
            if (!entry.otherName) {
              entry.otherName = m.sender.display_name;
            }
          }
        });

        // Count unread messages per conversation
        const unreadCountMap = new Map<string, number>();
        rows.forEach((r: any) => {
          const lastReadAt = r.last_read_at ? new Date(r.last_read_at).getTime() : 0;
          const count = (allMessages ?? []).filter(
            (m: any) => m.conversation_id === r.conversation_id && m.sender_id !== currentUserId && new Date(m.created_at).getTime() > lastReadAt
          ).length;
          unreadCountMap.set(r.conversation_id, count);
        });

        const mapped: Conversation[] = rows.map((r: any) => {
          const convData = convDataMap.get(r.conversation_id);

          return {
            conversationId: r.conversation_id,
            speakerId: r.other_user_id ?? '',
            speakerName: convData?.otherName || r.other_user_name || 'Unknown',
            speakerTopic: '',
            lastMessage: convData?.lastMsg?.body || '',
            timestamp: convData?.lastMsg ? new Date(convData.lastMsg.created_at).toLocaleTimeString() : '',
            unread: unreadCountMap.get(r.conversation_id) ?? 0,
            messages: [],
          };
        });

        setConversations(mapped);

        // Auto-select conversation from URL query param
        const convIdFromUrl = searchParams.get('conversationId');
        if (convIdFromUrl) {
          const exists = mapped.find(c => c.conversationId === convIdFromUrl);
          if (exists) {
            setActiveConversation(convIdFromUrl);
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [formData.userType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load messages when a conversation is opened
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const currentUserId = auth.user?.id;
        currentUserIdRef.current = currentUserId;

        const msgs = await conversationAPI.loadMessages(activeConversation);

        const otherMsg = msgs.find((m: any) => m.sender_id !== currentUserId);
        const otherName = otherMsg?.sender?.display_name || null;

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

      try {
        await conversationAPI.markRead(activeConversation);
        // Reset unread count for this conversation in the sidebar
        setConversations(prev => prev.map(c =>
          c.conversationId === activeConversation ? { ...c, unread: 0 } : c
        ));
      } catch (error) {
        console.error('markRead failed:', error);
      }
      try {
        const count = await conversationAPI.loadUnreadCount();
        setTotalUnread(count);
      } catch (error) {
        console.error('Failed to refresh unread count:', error);
      }
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
      timestamp: new Date().toLocaleTimeString()
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

  const selectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    setSearchParams({ conversationId });
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#e9ebef]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2
            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            VOXD
          </h2>
          <div className="flex items-center gap-4">
            <button className="text-[#0B3B2E] relative">
              <Mail className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>
            <NotificationBell />
            <div className="relative user-menu-container">
              <button
                className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors overflow-hidden"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  formData.organisationName?.charAt(0)?.toUpperCase() || formData.full_name?.charAt(0)?.toUpperCase() || formData.firstName?.charAt(0)?.toUpperCase() || 'U'
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#e9ebef] rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors flex items-center gap-3"
                  >
                    <User className="w-4 h-4 text-[#717182]" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                      Profile
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      if (onLogout) {
                        try {
                          await authAPI.signOut();
                          onLogout();
                        } catch (error: any) {
                          console.error('Logout error:', error);
                          toast.error(`Failed to logout: ${error.message}`);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4 text-[#717182]" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full min-h-0">
        {/* Conversation List - Sidebar */}
        <div className={`w-full md:w-[360px] border-r border-[#e9ebef] flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#e9ebef] flex items-center gap-3">
            <button
              className="text-[#717182] hover:text-black"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500', fontSize: '18px' }}>
              Messages
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-[#717182]" style={{ fontSize: '14px' }}>
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-[#717182]" style={{ fontSize: '14px' }}>
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => {
                const hasUnread = conversation.unread > 0;
                return (
                <button
                  key={conversation.conversationId}
                  className={`w-full p-4 border-b border-[#e9ebef] hover:bg-[#f3f3f5] transition-colors text-left ${
                    activeConversation === conversation.conversationId ? 'bg-[#f3f3f5]' : ''
                  } ${hasUnread && activeConversation !== conversation.conversationId ? 'bg-[#f0faf6]' : ''}`}
                  onClick={() => selectConversation(conversation.conversationId)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white">
                        {conversation.speakerName.charAt(0)}
                      </div>
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0B3B2E] rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: hasUnread ? '700' : '500' }}>
                          {conversation.speakerName}
                        </h4>
                        <span className={hasUnread ? 'text-[#0B3B2E]' : 'text-[#717182]'} style={{ fontSize: '12px', fontWeight: hasUnread ? '600' : '400' }}>
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p className="text-[#717182] mb-1" style={{ fontSize: '13px' }}>
                        {conversation.speakerTopic}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className={`truncate ${hasUnread ? 'text-[#1a1a2e]' : 'text-[#717182]'}`} style={{ fontSize: '14px', fontWeight: hasUnread ? '600' : '400' }}>
                          {conversation.lastMessage}
                        </p>
                        {hasUnread && (
                          <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-[#0B3B2E] rounded-full text-white text-xs flex items-center justify-center shrink-0" style={{ fontWeight: '600' }}>
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                );
              })
            )}
          </div>
        </div>

        {/* Active Chat Panel */}
        <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-[#717182]">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="border-b border-[#e9ebef] p-4">
                <div className="flex items-center gap-3">
                  <button
                    className="text-[#717182] hover:text-black md:hidden"
                    onClick={() => {
                      setActiveConversation(null);
                      setSearchParams({});
                    }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white">
                    {activeConv?.speakerName.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                      {activeConv?.speakerName}
                    </h4>
                    {activeConv?.speakerTopic && (
                      <p className="text-[#717182]" style={{ fontSize: '13px' }}>
                        {activeConv.speakerTopic}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConv?.messages.map(message => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user' ? 'bg-[#0B3B2E] text-white' : 'bg-[#f3f3f5]'}`}>
                      <p style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                        {message.content}
                      </p>
                      <p className={`mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-[#717182]'}`} style={{ fontSize: '11px' }}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-[#e9ebef] p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 p-3 border-2 border-[#e9ebef] rounded-lg resize-none focus:outline-none focus:border-[#0B3B2E] transition-colors"
                    rows={2}
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-[#0B3B2E] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
