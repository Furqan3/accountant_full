"use client"

import type React from "react"
import Image from "next/image"
import { Search, ChevronDown } from "lucide-react"

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  isActive?: boolean
}

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  messageCount?: number
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  messageCount = 12,
}) => {
  return (
    <div className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col ">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <button className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          Messages
          <ChevronDown className="w-4 h-4" />
          <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">{messageCount}</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition ${
              activeId === conv.id ? "bg-gray-100" : ""
            }`}
          >
            <Image
              src={conv.avatar || "/placeholder.svg"}
              alt={conv.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 truncate">{conv.name}</span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{conv.time}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ConversationList
