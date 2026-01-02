"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "client";
  timestamp: string;
};

type OrderDetails = {
  orderId: string;
  amount: number;
  status: string;
  companyName?: string;
  companyNumber?: string;
  services?: Array<{ name: string; quantity: number }>;
  created_at?: string;
};

type User = {
  name: string;
  email: string;
};

type ChatMessagesProps = {
  conversationName: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  orderDetails?: OrderDetails;
  user?: User | null;
};

export default function ChatMessages({
  conversationName,
  messages,
  onSendMessage,
  isLoading = false,
  orderDetails,
  user,
}: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header with Order Details */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-primary">
              {conversationName}
              {orderDetails?.companyName && (
                <span className="text-base font-normal text-gray-600 ml-2">
                  - {orderDetails.companyName}
                </span>
              )}
            </h2>
            {user && (
              <p className="text-sm text-gray-600 mt-0.5">
                {user.email}
              </p>
            )}
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
            Active
          </span>
        </div>

        {orderDetails && (
          <div className="mt-3 text-sm space-y-2 bg-white/70 rounded-lg p-4 border border-gray-200 shadow-sm">
            {/* Order ID and Date */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                <p className="font-mono font-semibold text-gray-900">#{orderDetails.orderId.slice(0, 8).toUpperCase()}</p>
              </div>
              {orderDetails.created_at && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-xs text-gray-700">{new Date(orderDetails.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Company Info */}
            {orderDetails.companyName && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Company</p>
                <p className="text-gray-900 font-medium">
                  {orderDetails.companyName}
                  {orderDetails.companyNumber && (
                    <span className="text-gray-500 ml-2 font-normal">({orderDetails.companyNumber})</span>
                  )}
                </p>
              </div>
            )}

            {/* Services */}
            {orderDetails.services && orderDetails.services.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Services Ordered</p>
                <div className="flex flex-wrap gap-1.5">
                  {orderDetails.services.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20"
                    >
                      {service.name} {service.quantity > 1 ? `×${service.quantity}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amount and Status */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">£{(orderDetails.amount / 100).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-md text-xs font-semibold capitalize ${
                    orderDetails.status === 'completed'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : orderDetails.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : orderDetails.status === 'processing'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {orderDetails.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 text-black">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSend}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
