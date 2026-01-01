"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { toast } from "react-toastify"
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Download,
  Loader2,
  ChevronUp,
} from "lucide-react"
import Image from "next/image"

interface Message {
  id: string
  order_id: string
  sender_id: string
  is_admin: boolean
  message_text: string | null
  attachments: Array<{
    url: string
    type: string
    name: string
    size: number
  }>
  read_by_user: boolean
  read_by_admin: boolean
  created_at: string
  sender?: {
    id: string
    email: string
  }
}

interface OrderDetails {
  id: string
  service_type: string | null
  amount: number
  status: string
  company_id: string | null
  metadata: any
  created_at: string
}

interface MessagePanelProps {
  orderId: string
}

// Cache key for messages
const getCacheKey = (orderId: string) => `messages_${orderId}`
const getOrderCacheKey = (orderId: string) => `order_${orderId}`
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function MessagePanel({ orderId }: MessagePanelProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [attachments, setAttachments] = useState<
    Array<{ url: string; type: string; name: string; size: number }>
  >([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesStartRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const LIMIT = 20

  // Load cached data and fetch fresh data on mount
  useEffect(() => {
    if (!orderId) return
    loadFromCacheAndFetch()
    fetchOrderDetails()
  }, [orderId])

  // Load from cache first, then fetch fresh data
  const loadFromCacheAndFetch = () => {
    // Try to load from cache first
    const cached = loadFromCache()
    if (cached) {
      setMessages(cached.messages)
      setOffset(cached.messages.length)
      setLoading(false)
      // Still fetch fresh data in background
      fetchMessages(0, true)
    } else {
      fetchMessages(0, false)
    }
  }

  // Load messages from localStorage cache
  const loadFromCache = () => {
    try {
      const cacheKey = getCacheKey(orderId)
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()

      // Check if cache is still valid
      if (now - timestamp < CACHE_DURATION) {
        return data
      }

      // Cache expired, remove it
      localStorage.removeItem(cacheKey)
      return null
    } catch (error) {
      console.error("Error loading from cache:", error)
      return null
    }
  }

  // Save messages to localStorage cache
  const saveToCache = (messagesToCache: Message[]) => {
    try {
      const cacheKey = getCacheKey(orderId)
      const cacheData = {
        data: { messages: messagesToCache },
        timestamp: Date.now(),
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error("Error saving to cache:", error)
    }
  }

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      // Check cache first
      const orderCacheKey = getOrderCacheKey(orderId)
      const cached = localStorage.getItem(orderCacheKey)

      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION) {
          setOrderDetails(data)
          return
        }
      }

      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()

      if (response.ok && data.order) {
        setOrderDetails(data.order)
        // Cache the order details
        localStorage.setItem(
          orderCacheKey,
          JSON.stringify({ data: data.order, timestamp: Date.now() })
        )
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!orderId) return

    const supabase = createClient()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log("New message received:", payload)
          const newMessage = payload.new as Message
          setMessages((prev) => {
            const updated = [...prev, newMessage]
            saveToCache(updated) // Update cache
            return updated
          })
          scrollToBottom()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log("Message updated:", payload)
          const updatedMessage = payload.new as Message
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark messages as read when panel is opened
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead()
    }
  }, [messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async (currentOffset: number = 0, isBackground: boolean = false) => {
    try {
      if (!isBackground) {
        if (currentOffset === 0) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }
      }

      // Fetch latest 20 messages (descending order to get latest first)
      const response = await fetch(
        `/api/messages/${orderId}?order=desc&limit=${LIMIT}&offset=${currentOffset}`
      )
      const data = await response.json()

      if (response.ok) {
        const newMessages = data.messages || []

        // Since we fetch in descending order but display in ascending,
        // we need to reverse the fetched messages
        const reversedMessages = [...newMessages].reverse()

        if (currentOffset === 0) {
          // Initial load - set messages and save to cache
          setMessages(reversedMessages)
          saveToCache(reversedMessages)
          setOffset(reversedMessages.length)
        } else {
          // Loading more - prepend to existing messages
          setMessages((prev) => [...reversedMessages, ...prev])
          setOffset((prev) => prev + reversedMessages.length)
        }

        // Check if there are more messages
        setHasMore(data.pagination?.hasMore || false)
      } else {
        if (!isBackground) {
          toast.error(data.error || "Failed to load messages")
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      if (!isBackground) {
        toast.error("Failed to load messages")
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more messages when scrolling up
  const loadMoreMessages = useCallback(() => {
    if (loadingMore || !hasMore) return
    fetchMessages(offset, false)
  }, [offset, loadingMore, hasMore])

  const markAsRead = async () => {
    try {
      await fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("orderId", orderId)

      const response = await fetch("/api/messages/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setAttachments((prev) => [...prev, data.attachment])
        toast.success("File uploaded successfully")
      } else {
        toast.error(data.error || "Failed to upload file")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async () => {
    if (!messageText.trim() && attachments.length === 0) {
      toast.error("Please enter a message or attach a file")
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          messageText: messageText.trim() || null,
          attachments,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessageText("")
        setAttachments([])
        // Message will be added via realtime subscription
      } else {
        toast.error(data.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Order Details */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">Order Messages</h3>
        {orderDetails ? (
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            {/* Parse and display company name from items */}
            {(() => {
              try {
                const items = orderDetails.metadata?.items ? JSON.parse(orderDetails.metadata.items) : null
                const companyName = items && items.length > 0 ? items[0].companyName : orderDetails.metadata?.companyName
                const companyNumber = items && items.length > 0 ? items[0].companyNumber : null

                return companyName ? (
                  <p>
                    <span className="font-medium">Company:</span>{" "}
                    {companyName}
                    {companyNumber && <span className="text-gray-500 ml-1">({companyNumber})</span>}
                  </p>
                ) : null
              } catch {
                return orderDetails.metadata?.companyName ? (
                  <p>
                    <span className="font-medium">Company:</span>{" "}
                    {orderDetails.metadata.companyName}
                  </p>
                ) : null
              }
            })()}

            {/* Show all services from items */}
            {(() => {
              try {
                const items = orderDetails.metadata?.items ? JSON.parse(orderDetails.metadata.items) : null

                if (items && items.length > 0) {
                  return (
                    <div>
                      <span className="font-medium">Services:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {items.map((item: any, index: number) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-xs"
                          >
                            {item.name} {item.quantity > 1 ? `(×${item.quantity})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                }

                // Fallback to service_type if no items in metadata
                if (orderDetails.service_type) {
                  return (
                    <p>
                      <span className="font-medium">Service:</span>{" "}
                      <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-xs">
                        {orderDetails.service_type}
                      </span>
                    </p>
                  )
                }

                return null
              } catch {
                // If parsing fails, use service_type as fallback
                return orderDetails.service_type ? (
                  <p>
                    <span className="font-medium">Service:</span>{" "}
                    <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-xs">
                      {orderDetails.service_type}
                    </span>
                  </p>
                ) : null
              }
            })()}

            <p>
              <span className="font-medium">Amount:</span> £
              {(orderDetails.amount / 100).toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Order Status:</span>{" "}
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  orderDetails.status === "completed"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : orderDetails.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : orderDetails.status === "processing"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : orderDetails.status === "cancelled" || orderDetails.status === "failed"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : orderDetails.status === "refunded"
                    ? "bg-gray-100 text-gray-800 border border-gray-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              >
                {orderDetails.status}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mt-1">
            Chat with our support team about this order
          </p>
        )}
      </div>

      {/* Messages List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {/* Load More Button */}
        {hasMore && messages.length > 0 && (
          <div className="flex justify-center pb-4">
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Load older messages
                </>
              )}
            </button>
          </div>
        )}

        <div ref={messagesStartRef} />

        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            // Admin messages always show on left side, user's own messages on right
            const isOwn = !message.is_admin && message.sender_id === user?.id
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {/* Sender info */}
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1">
                      {message.is_admin ? "Support Team" : message.sender?.email}
                    </p>
                  )}

                  {/* Message text */}
                  {message.message_text && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message_text}
                    </p>
                  )}

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index}>
                          {attachment.type.startsWith("image/") ? (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block cursor-pointer"
                            >
                              <Image
                                src={attachment.url}
                                alt={attachment.name}
                                width={200}
                                height={200}
                                className="rounded max-w-full h-auto hover:opacity-90 transition"
                              />
                            </a>
                          ) : (
                            <a
                              href={attachment.url}
                              download={attachment.name}
                              className={`flex items-center gap-2 p-2 rounded ${
                                isOwn
                                  ? "bg-teal-700 hover:bg-teal-800"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              {getFileIcon(attachment.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs opacity-75">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-teal-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-700 mb-2">Attachments:</p>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded"
              >
                {getFileIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2">
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
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            title="Attach file"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={sending || uploading || (!messageText.trim() && attachments.length === 0)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Supported files: Images, PDF, Word, Excel, Text (Max 10MB)
        </p>
      </div>
    </div>
  )
}
