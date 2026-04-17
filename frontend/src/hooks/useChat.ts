import { useState, useEffect, useCallback, useRef } from 'react'

export interface Message {
  id: number
  user: string
  text: string
  timestamp: string
  read_by: string[]
}

export function useChat(username: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!username) return

    // Fetch history
    fetch('/api/chat/history')
      .then(res => res.json())
      .then(data => {
        setMessages(data.map((m: any) => ({ ...m, read_by: m.read_by || [] })))
      })
      .catch(err => console.error("Could not fetch history", err))

    // Determine WS URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/chat/ws`
    
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
            setMessages(prev => [...prev, newMsg])
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
  }, [username])

  const sendMessage = useCallback((text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'chat', user: username, text }))
    }
  }, [username])

  const markAsRead = useCallback((messageId: number) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'read', user: username, message_id: messageId }))
      }
  }, [username])

  return { messages, sendMessage, connectionStatus, markAsRead }
}
