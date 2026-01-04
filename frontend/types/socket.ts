export interface Message {
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
}

export interface SendMessagePayload {
  orderId: string
  messageText: string | null
  attachments?: Array<{
    url: string
    type: string
    name: string
    size: number
  }>
}

export interface ServerToClientEvents {
  'new-message': (data: { orderId: string; message: Message }) => void
  'message-updated': (data: { orderId: string; message: Message }) => void
  error: (data: { message: string }) => void
}

export interface ClientToServerEvents {
  'join-order-room': (orderId: string) => void
  'leave-order-room': (orderId: string) => void
  'send-message': (payload: SendMessagePayload) => void
}
