import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import { Send, Bot, UserCircle, Signal, SignalZero, Sparkles } from 'lucide-react'
import { format } from 'date-fns'

interface ChatRoomProps {
  username: string
}

export default function ChatRoom({ username }: ChatRoomProps) {
  const { messages, sendMessage, connectionStatus } = useChat(username)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      sendMessage(inputValue)
      setInputValue('')
    }
  }

  const isConnected = connectionStatus === 'Connected'

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="flex-none bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Radius Chat</h1>
              <p className="text-xs font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
                {isConnected ? <Signal className="w-3 h-3" /> : <SignalZero className="w-3 h-3 text-red-400" />}
                {connectionStatus}
              </p>
            </div>
          </div>
          <div className="flex items-center bg-neutral-800/50 px-3 py-1.5 rounded-full border border-neutral-700/50">
            <UserCircle className="w-5 h-5 text-neutral-400 mr-2" />
            <span className="text-sm font-medium text-neutral-200">{username}</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-neutral-500">
              <Sparkles className="w-8 h-8 mb-3 opacity-20" />
              <p>No messages yet. Be the first to say hi!</p>
              <p className="text-sm mt-1 opacity-70">Try mentioning <span className="text-emerald-400 font-mono">@ai</span> to get an automated response.</p>
            </div>
          ) : null}

          {messages.map((msg, idx) => {
            const isMe = msg.user === username
            const isSystem = msg.user === 'System' || msg.user === 'System AI'
            
            return (
              <div 
                key={`${msg.id}-${idx}`} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {!isMe && !isSystem && (
                  <span className="text-xs font-medium text-neutral-400 mb-1 ml-1 pl-10">{msg.user}</span>
                )}
                <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center mt-1 
                    ${isSystem ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/20' : 
                      isMe ? 'hidden' : 'bg-neutral-800 border border-neutral-700'}`}>
                    {isSystem ? <Bot className="w-4 h-4 text-white" /> : 
                     !isMe ? <span className="text-xs font-bold text-neutral-300">{msg.user.charAt(0).toUpperCase()}</span> : null}
                  </div>

                  {/* Bubble */}
                  <div className={`relative px-5 py-3 rounded-2xl group
                    ${isSystem 
                      ? 'bg-neutral-800 border border-purple-500/30 text-neutral-100 rounded-tl-sm' 
                      : isMe 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/10 rounded-tr-sm' 
                        : 'bg-neutral-800 border border-neutral-700/50 text-neutral-100 rounded-tl-sm'}`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    <span className={`text-[10px] mt-1.5 block opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 ${isMe ? 'right-0 text-emerald-500' : 'left-0 text-neutral-500'}`}>
                      {format(new Date(msg.timestamp), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-800 p-4 pb-8 sm:pb-4">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-neutral-950 border border-neutral-700 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50 transition-all shadow-inner"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message... (mention @ai to talk to bot)"
              className="w-full bg-transparent px-5 py-4 pl-5 pr-14 text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
              autoFocus
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || !isConnected}
              className={`absolute right-2 p-2 rounded-xl transition-all duration-200 
                ${inputValue.trim() && isConnected 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25' 
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
            >
              <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  )
}
