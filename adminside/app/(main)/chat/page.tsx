"use client";

import { useState } from "react";
import ChatSidebar, { ChatConversation } from "@/components/chat/chat-sidebar";
import ChatMessages, { Message } from "@/components/chat/chat-messages";

const conversationsData: ChatConversation[] = [
  {
    id: "1",
    name: "Tech Solutions Ltd.",
    lastMessage: "Thanks for the update on the confirmation statement",
    timestamp: "10:30 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Innovatech Corp.",
    lastMessage: "When can we schedule the filing?",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    name: "FutureSoft Inc.",
    lastMessage: "Payment has been processed",
    timestamp: "2 days ago",
  },
  {
    id: "4",
    name: "Alpha Systems Ltd.",
    lastMessage: "Please send the documents",
    timestamp: "3 days ago",
  },
];

const messagesData: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      text: "Hello, I need help with my confirmation statement.",
      sender: "client",
      timestamp: "10:00 AM",
    },
    {
      id: "2",
      text: "Hi! I'd be happy to help you with that. Can you provide your company registration number?",
      sender: "user",
      timestamp: "10:05 AM",
    },
    {
      id: "3",
      text: "Yes, it's 12345678",
      sender: "client",
      timestamp: "10:07 AM",
    },
    {
      id: "4",
      text: "Thank you. I've located your company. Your confirmation statement is due next month. Would you like me to proceed with the filing?",
      sender: "user",
      timestamp: "10:10 AM",
    },
    {
      id: "5",
      text: "Yes, please proceed. What documents do I need to provide?",
      sender: "client",
      timestamp: "10:15 AM",
    },
    {
      id: "6",
      text: "Hello, I need help with my confirmation statement.",
      sender: "client",
      timestamp: "10:00 AM",
    },
    {
      id: "7",
      text: "Hi! I'd be happy to help you with that. Can you provide your company registration number?",
      sender: "user",
      timestamp: "10:25 AM",
    },
    {
      id: "8",
      text: "Yes, it's 12345678",
      sender: "client",
      timestamp: "10:07 AM",
    },
    {
      id: "9",
      text: "Thank you. I've located your company. Your confirmation statement is due next month. Would you like me to proceed with the filing?",
      sender: "user",
      timestamp: "10:10 AM",
    },
    {
      id: "10",
      text: "Yes, please proceed. What documents do I need to provide?",
      sender: "client",
      timestamp: "10:15 AM",
    },
  ],
  "2": [
    {
      id: "1",
      text: "Good morning! I wanted to check on our filing schedule.",
      sender: "client",
      timestamp: "9:00 AM",
    },
    {
      id: "2",
      text: "Good morning! Let me pull up your account details.",
      sender: "user",
      timestamp: "9:05 AM",
    },
  ],
  "3": [
    {
      id: "1",
      text: "Payment confirmation received. Thank you!",
      sender: "client",
      timestamp: "2 days ago",
    },
  ],
  "4": [
    {
      id: "1",
      text: "I need to submit some additional documents for our registration.",
      sender: "client",
      timestamp: "3 days ago",
    },
  ],
};

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>("1");
  const [messages, setMessages] = useState<Record<string, Message[]>>(messagesData);

  const selectedConversation = conversationsData.find(
    (conv) => conv.id === selectedConversationId
  );

  const handleSendMessage = (messageText: string) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
    }));
  };

  return (
    <div className="h-full flex overflow-hidden bg-white rounded-2xl shadow-sm">
      {/* Chat Sub-Sidebar */}
      <ChatSidebar
        conversations={conversationsData}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />

      {/* Chat Messages Area */}
      {selectedConversation && (
        <ChatMessages
          conversationName={selectedConversation.name}
          messages={messages[selectedConversationId] || []}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
