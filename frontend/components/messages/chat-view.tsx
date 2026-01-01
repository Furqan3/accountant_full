"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Paperclip, Send } from "lucide-react"

interface OrderItem {
  name: string
  price: number
}

interface Message {
  id: string
  text: string
  isOwn: boolean
  avatar?: string
}

interface ChatViewProps {
  contactName: string
  contactAvatar: string
  isOnline?: boolean
  order?: {
    id: string
    items: OrderItem[]
    status: "Pending" | "Completed"
    isPaid: boolean
  }
  messages: Message[]
  onSendMessage: (text: string) => void
}

const ChatView: React.FC<ChatViewProps> = ({
  contactName,
  contactAvatar,
  isOnline = true,
  order,
  messages,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState("")

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white ">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <Image
          src={contactAvatar || "/placeholder.svg"}
          alt={contactName}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{contactName}</h3>
          {isOnline && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-500">Online</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Order card */}
        {order && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Order {order.id}</h4>
              <div className="flex gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    order.status === "Pending"
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {order.status}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    order.isPaid
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="text-gray-900">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.isOwn ? "justify-end" : "justify-start"}`}>
            {!msg.isOwn && msg.avatar && (
              <Image
                src={msg.avatar || "/placeholder.svg"}
                alt="Contact"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            )}
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.isOwn ? "bg-teal-700 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
            {msg.isOwn && msg.avatar && (
              <Image
                src={msg.avatar || "/placeholder.svg"}
                alt="You"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button onClick={handleSend} className="p-2 text-teal-700 hover:text-teal-800 transition">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatView
