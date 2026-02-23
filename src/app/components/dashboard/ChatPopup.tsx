import { X as XIcon, Send } from 'lucide-react';
import { Conversation } from '@/types/dashboard';
import { RefObject } from 'react';

interface ChatPopupProps {
  activeConversation: string;
  conversations: Conversation[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onClose: () => void;
  chatMessagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatPopup({
  activeConversation,
  conversations,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onClose,
  chatMessagesEndRef,
}: ChatPopupProps) {
  const activeConvData = conversations.find(c => c.conversationId === activeConversation);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end">
      <div className="bg-white w-full md:w-[500px] h-[600px] md:rounded-tl-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-[#e9ebef] p-4">
          <div className="flex items-center gap-3">
            <button className="text-[#717182] hover:text-black" onClick={onClose}>
              <XIcon className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white">
              {activeConvData?.speakerName.charAt(0)}
            </div>
            <div>
              <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                {activeConvData?.speakerName}
              </h4>
              <p className="text-[#717182]" style={{ fontSize: '13px' }}>
                {activeConvData?.speakerTopic}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConvData?.messages.map(message => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user' ? 'bg-[#0B3B2E] text-white' : 'bg-[#f3f3f5]'}`}>
                <p style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>{message.content}</p>
                <p
                  className={`mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-[#717182]'}`}
                  style={{ fontSize: '11px' }}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatMessagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#e9ebef] p-4">
          <div className="flex items-end gap-2">
            <textarea
              value={messageInput}
              onChange={(e) => onMessageInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 p-3 border-2 border-[#e9ebef] rounded-lg resize-none focus:outline-none focus:border-[#0B3B2E] transition-colors"
              rows={2}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
            />
            <button
              onClick={onSendMessage}
              disabled={!messageInput.trim()}
              className="p-3 bg-[#0B3B2E] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
