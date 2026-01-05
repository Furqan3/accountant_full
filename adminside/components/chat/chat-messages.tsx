"use client";

import { Send, X, Paperclip, Loader2, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import AttachmentDisplay from "@/components/shared/attachment-display";
import ImageLightbox from "@/components/shared/image-lightbox";
import { toast } from "react-toastify";

export type Message = {
  id: string;
  text: string | null;
  sender: "user" | "client";
  timestamp: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
    size: number;
  }>;
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
  conversationId: string;
  messages: Message[];
  onSendMessage: (
    message: string,
    attachments?: Array<{ url: string; type: string; name: string; size: number }>
  ) => void;
  isLoading?: boolean;
  orderDetails?: OrderDetails;
  user?: User | null;
};

export default function ChatMessages({
  conversationName,
  conversationId,
  messages,
  onSendMessage,
  isLoading = false,
  orderDetails,
  user,
}: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<
    Array<{ url: string; type: string; name: string; size: number }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<{ url: string; name: string }>>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed: images, PDF, Word, Excel, text files");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", conversationId);

      const response = await fetch("/api/messages/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setPendingAttachments((prev) => [...prev, data.attachment]);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() || pendingAttachments.length > 0) {
      onSendMessage(newMessage.trim() || "", pendingAttachments);
      setNewMessage("");
      setPendingAttachments([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {conversationName}
            </h2>
            {user && (
              <p className="text-sm text-gray-500">
                {user.email}
              </p>
            )}
            {orderDetails && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  Order #{orderDetails.orderId.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    orderDetails.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : orderDetails.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : orderDetails.status === "processing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {orderDetails.status}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-medium text-gray-700">
                  £{(orderDetails.amount / 100).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {orderDetails && (
              <button
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                title="Order details"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
              Active
            </span>
          </div>
        </div>

        {showOrderDetails && orderDetails && (
          <div className="mt-3 text-sm space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200 animate-in slide-in-from-top duration-200">
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
                {message.text && <p className="text-sm">{message.text}</p>}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-">
                    <AttachmentDisplay
                      attachments={message.attachments}
                      variant={message.sender === "client" ? "admin" : "user"}
                      onImageClick={(images, index) => {
                        setLightboxImages(images);
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                    />
                  </div>
                )}
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

      {/* Pending Attachments Preview */}
      {pendingAttachments.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600 font-medium">
              Attachments ({pendingAttachments.length}):
            </p>
            <button
              onClick={() => setPendingAttachments([])}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
          <AttachmentDisplay attachments={pendingAttachments} variant="user" />
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 text-black">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !uploading && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={uploading}
          />
          <button
            onClick={handleSend}
            disabled={uploading || (!newMessage.trim() && pendingAttachments.length === 0)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={lightboxIndex}
      />
    </div>
  );
}
