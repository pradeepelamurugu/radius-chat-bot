import { useState, useEffect, useCallback, useRef } from 'react'

export interface Message {
  id: number
  sender: string
  receiver: string
  text: string
  timestamp: string
  read_by: string[]
}

export function useChat(currentUser: string, recipient: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!currentUser || !recipient) return

    // Fetch history
    fetch(`/api/chat/history?user1=${currentUser}&user2=${recipient}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.map((m: any) => ({ ...m, read_by: m.read_by || [] })))
      })
      .catch(err => console.error("Could not fetch history", err))

    // Determine WS URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/chat/ws/${currentUser}`
    
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      setConnectionStatus('Connected')
    }

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'message_updated') {
            setMessages(prev => prev.map(m => m.id === payload.id ? { ...m, read_by: payload.read_by } : m))
        } else {
            const newMsg = { ...payload, read_by: payload.read_by || [] }
            // Only add if it belongs to this conversation
            if ((newMsg.sender === currentUser && newMsg.receiver === recipient) || 
                (newMsg.sender === recipient && newMsg.receiver === currentUser) ||
                (newMsg.sender === 'System AI' && newMsg.conversation_with === recipient)) {
                setMessages(prev => [...prev, newMsg])
            }
        }
      } catch (e) {
        console.error("Failed to parse message", e)
      }
    }

    ws.current.onclose = () => {
      setConnectionStatus('Disconnected')
    }

    return () => {
      ws.current?.close()
    }
  }, [currentUser, recipient])

  const sendMessage = useCallback((text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'chat', receiver: recipient, text }))
    }
  }, [recipient])

  const markAsRead = useCallback((messageId: number) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'read', message_id: messageId }))
      }
  }, [])

  return { messages, sendMessage, connectionStatus, markAsRead }
}
