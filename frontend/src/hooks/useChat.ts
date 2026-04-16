import { useState, useEffect, useCallback, useRef } from 'react'

export interface Message {
  id: number
  user: string
  text: string
  timestamp: string
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
        setMessages(data)
      })
      .catch(err => console.error("Could not fetch history", err))

    // Determine WS URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    // We use relative path but proxy handles it in dev.
    // In prod, it connects to same host.
    const wsUrl = `${protocol}//${window.location.host}/api/chat/ws`
    
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      setConnectionStatus('Connected')
    }

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        setMessages(prev => [...prev, message])
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
      ws.current.send(JSON.stringify({ user: username, text }))
    }
  }, [username])

  return { messages, sendMessage, connectionStatus }
}
