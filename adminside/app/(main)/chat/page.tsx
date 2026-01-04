"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/contexts/socket-context";
import ChatSidebar, { ChatConversation } from "@/components/chat/chat-sidebar";
import ChatMessages, { Message } from "@/components/chat/chat-messages";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const selectedConversationIdRef = useRef<string>("");
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      // Always fetch messages when switching conversations to get any missed messages
      fetchMessages(selectedConversationId);
      // Mark messages as read when conversation is opened
      markMessagesAsRead(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Set up Socket.io real-time subscriptions
  const { socket } = useSocket();
  const [prevConversationId, setPrevConversationId] = useState<string>("");

  // Set up socket listeners ONCE (not dependent on selectedConversationId)
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages from ALL conversations
    const handleNewMessage = (data: any) => {
      console.log("Admin received new message via Socket.io:", data.message);
      const newMessage = data.message;

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

      // If message is in the current conversation, add it to messages
      const currentConvId = selectedConversationIdRef.current;
      setMessages((prev) => {
        if (data.orderId === currentConvId) {
          const existingMessages = prev[currentConvId] || [];
          // Check if message already exists to prevent duplicates
          if (existingMessages.some(msg => msg.id === formattedMessage.id)) {
            console.log("Message already exists, skipping duplicate:", formattedMessage.id);
            return prev;
          }
          return {
            ...prev,
            [currentConvId]: [
              ...existingMessages,
              formattedMessage,
            ],
          };
        }
        return prev;
      });

      // Update conversation's last message and unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.orderId
            ? {
                ...conv,
                lastMessage: newMessage.message_text || 'Attachment',
                timestamp: new Date(newMessage.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                // Increment unread count if message is from client and not current conversation
                unread: !newMessage.is_admin && data.orderId !== currentConvId
                  ? (conv.unread || 0) + 1
                  : conv.unread || 0,
              }
            : conv
        )
      );

      // Show notification if message is from client and not in current conversation
      // Note: This must happen AFTER state updates to avoid "setState in render" errors
      if (!newMessage.is_admin && data.orderId !== currentConvId) {
        const conversation = conversations.find(c => c.id === data.orderId);
        const senderName = conversation?.name || 'A customer';
        toast.info(`New message from ${senderName}`, {
          position: "top-right",
          autoClose: 4000,
        });
      }
    };

    // Listen for message updates
    const handleMessageUpdate = (data: any) => {
      console.log("Admin received message update via Socket.io:", data.message);
      const updatedMessage = data.message;

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

      const currentConvId = selectedConversationIdRef.current;
      setMessages((prev) => {
        if (data.orderId === currentConvId) {
          return {
            ...prev,
            [currentConvId]:
              prev[currentConvId]?.map((msg) =>
                msg.id === formattedMessage.id ? formattedMessage : msg
              ) || [],
          };
        }
        return prev;
      });
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-updated", handleMessageUpdate);

    // Cleanup on unmount only
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-updated", handleMessageUpdate);
    };
  }, [socket]); // Only depend on socket, not selectedConversationId

  // Handle joining/leaving rooms when conversation changes
  useEffect(() => {
    if (!socket || !selectedConversationId) return;

    // Leave previous room when switching conversations
    if (prevConversationId && prevConversationId !== selectedConversationId) {
      socket.emit("leave-order-room", prevConversationId);
      console.log(`Admin left room: order:${prevConversationId}`);
    }

    // Join the selected conversation's room
    socket.emit("join-order-room", selectedConversationId);
    console.log(`Admin joined room: order:${selectedConversationId}`);
    setPrevConversationId(selectedConversationId);
  }, [socket, selectedConversationId]);

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

  const markMessagesAsRead = async (orderId: string) => {
    try {
      const res = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (res.ok) {
        // Update the conversation's unread count to 0
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === orderId ? { ...conv, unread: 0 } : conv
          )
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

    const handleSendMessage = async (

      messageText: string,

      attachments: Array<{ url: string; type: string; name: string; size: number }> = []

    ) => {

      if (!selectedConversationId || !socket) {

        toast.error("Cannot send message: socket not connected or no conversation selected.");

        return;

      }

  

      try {

              const payload = {

                orderId: selectedConversationId,

                messageText: messageText || null,

                attachments,

                fromAdminApp: true,

              };

  

        socket.emit("send-message", payload, (ack: { success: boolean; error?: string }) => {

          if (!ack.success) {

            toast.error(ack.error || "Failed to send message.");

          }

          // Message will be added optimistically via the 'new-message' broadcast event.

          // UI updates will happen in the socket listeners.

        });

  

      } catch (error) {

        console.error("Error sending message via socket:", error);

        toast.error("An unexpected error occurred while sending the message.");

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
