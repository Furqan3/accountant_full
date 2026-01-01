"use client"

import { X } from "lucide-react"
import MessagePanel from "./message-panel"

interface MessageModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
}

export default function MessageModal({
  orderId,
  isOpen,
  onClose,
}: MessageModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Message Panel */}
        <MessagePanel orderId={orderId} />
      </div>
    </div>
  )
}
