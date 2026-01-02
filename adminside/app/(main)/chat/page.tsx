"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ChatSidebar, { ChatConversation } from "@/components/chat/chat-sidebar";
import ChatMessages, { Message } from "@/components/chat/chat-messages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId && !messages[selectedConversationId]) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!selectedConversationId) return;

    // Subscribe to new messages for the selected conversation
    const channel = supabase
      .channel(`admin-messages:${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as any;

          const formattedMessage: Message = {
            id: newMessage.id,
            text: newMessage.message_text || '',
            sender: newMessage.is_admin ? 'user' : 'client',
            timestamp: new Date(newMessage.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            attachments: newMessage.attachments || [],
          };

          setMessages((prev) => ({
            ...prev,
            [selectedConversationId]: [
              ...(prev[selectedConversationId] || []),
              formattedMessage,
            ],
          }));

          // Update conversation's last message
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === selectedConversationId
                ? {
                    ...conv,
                    lastMessage: newMessage.message_text || 'Attachment',
                    timestamp: new Date(newMessage.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }),
                  }
                : conv
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMessage = payload.new as any;

          const formattedMessage: Message = {
            id: updatedMessage.id,
            text: updatedMessage.message_text || '',
            sender: updatedMessage.is_admin ? 'user' : 'client',
            timestamp: new Date(updatedMessage.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            attachments: updatedMessage.attachments || [],
          };

          setMessages((prev) => ({
            ...prev,
            [selectedConversationId]:
              prev[selectedConversationId]?.map((msg) =>
                msg.id === formattedMessage.id ? formattedMessage : msg
              ) || [],
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId]);

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();

      if (res.ok && data.conversations) {
        setConversations(data.conversations);
        // Auto-select first conversation
        if (data.conversations.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data.conversations[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (orderId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await fetch(`/api/messages/${orderId}`);
      const data = await res.json();

      if (res.ok && data.messages) {
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.message_text || '',
          sender: msg.is_admin ? 'user' : 'client',
          timestamp: new Date(msg.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          attachments: msg.attachments || [],
        }));

        setMessages((prev) => ({
          ...prev,
          [orderId]: formattedMessages,
        }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (
    messageText: string,
    attachments: Array<{ url: string; type: string; name: string; size: number }> = []
  ) => {
    if (!selectedConversationId) return;

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedConversationId,
          messageText: messageText || null,
          attachments,
        }),
      });

      if (!res.ok) {
        console.error('Failed to send message');
      }
      // Message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  if (isLoadingConversations) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-2xl ">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-2xl ">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-2">Messages will appear here when customers contact you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden bg-white rounded-2xl ">
      {/* Chat Sub-Sidebar */}
      <ChatSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />

      {/* Chat Messages Area */}
      {selectedConversation && (
        <ChatMessages
          conversationName={selectedConversation.name}
          conversationId={selectedConversationId}
          messages={messages[selectedConversationId] || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoadingMessages}
          orderDetails={selectedConversation.orderDetails}
          user={selectedConversation.user}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
