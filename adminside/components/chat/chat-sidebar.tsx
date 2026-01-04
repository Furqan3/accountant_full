"use client";

import { MessageSquare, Search } from "lucide-react";

export type ChatConversation = {
  id: string;
  name: string;
  companyName?: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  orderDetails?: {
    orderId: string;
    amount: number;
    status: string;
    companyName?: string;
    companyNumber?: string;
    services?: Array<{ name: string; quantity: number }>;
    created_at?: string;
  };
  user?: {
    name: string;
    email: string;
  } | null;
};

type ChatSidebarProps = {
  conversations: ChatConversation[];
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
};

export default function ChatSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ChatSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-primary mb-4">Messages</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
              selectedConversationId === conversation.id ? "bg-primary/20" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {conversation.timestamp}
                  </span>
                </div>

                {/* Company Name */}
                {conversation.companyName && (
                  <p className="text-xs text-gray-600 mb-1 truncate">
                    {conversation.companyName}
                  </p>
                )}

                {/* Order Details */}
                {conversation.orderDetails && (
                  <div className="mb-1.5 space-y-0.5">
                    <p className="text-xs text-gray-500">
                      Order #{conversation.orderDetails.orderId.slice(0, 8)}... • £{(conversation.orderDetails.amount / 100).toFixed(2)}
                    </p>
                    {conversation.orderDetails.services && conversation.orderDetails.services.length > 0 && (
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.orderDetails.services.map(s => s.name).join(', ')}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread && conversation.unread > 0 ? (
                    <span className="ml-2 w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0"></span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
