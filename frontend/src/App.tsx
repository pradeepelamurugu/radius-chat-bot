import { useState, useEffect } from 'react'
import ChatRoom from './components/ChatRoom'
import Auth from './components/Auth'
import { MessageSquarePlus, LogOut, UserCircle } from 'lucide-react'

function App() {
  const [session, setSession] = useState<{ token: string, username: string } | null>(null)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [newContactUsername, setNewContactUsername] = useState('')
  const [contacts, setContacts] = useState<string[]>([])
  const [chatError, setChatError] = useState('')

  useEffect(() => {
    if (session) {
      fetch('/api/auth/users')
        .then(res => res.json())
        .then(data => {
            const users = data.map((u: any) => u.username).filter((u: string) => u !== session.username)
            setContacts(users)
        })
        .catch(console.error)
        
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/chat/ws/${session.username}`)
      
      ws.onmessage = (event) => {
        try {
           const payload = JSON.parse(event.data)
           if (payload.type === 'chat') {
              const otherUser = payload.sender === session.username ? payload.receiver : payload.sender;
              if (otherUser !== 'System AI' && otherUser !== 'System') {
                  setContacts(prev => {
                      if (!prev.includes(otherUser)) return [...prev, otherUser];
                      return prev;
                  });
              }
           }
        } catch (e) {}
      }
      return () => ws.close()
    }
  }, [session])

  const handleLogin = (token: string, username: string) => {
    setSession({ token, username })
  }

  const handleLogout = () => {
    setSession(null)
    setSelectedContact(null)
  }

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()
    setChatError('')
    if (newContactUsername.trim() && newContactUsername !== session?.username) {
      try {
          const res = await fetch('/api/auth/users');
          const data = await res.json();
          const users = data.map((u: any) => u.username);
          if (!users.includes(newContactUsername) && newContactUsername.toLowerCase() !== "system ai") {
              setChatError("User not found");
              return;
          }
          if (!contacts.includes(newContactUsername)) {
            setContacts([...contacts, newContactUsername])
          }
          setSelectedContact(newContactUsername)
          setNewContactUsername('')
      } catch (err) {
          setChatError("Failed to verify user");
      }
    }
  }

  if (!session) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-emerald-400" />
                <span className="font-bold">{session.username}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-red-400 transition">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
        <div className="p-4 border-b border-neutral-800">
            <form onSubmit={handleStartChat} className="relative">
                <input
                    type="text"
                    value={newContactUsername}
                    onChange={(e) => setNewContactUsername(e.target.value)}
                    placeholder="Chat with username..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="absolute right-2 top-2 text-emerald-500 hover:text-emerald-400">
                    <MessageSquarePlus className="w-5 h-5" />
                </button>
            </form>
            {chatError && <div className="text-red-500 text-xs mt-2 font-medium">{chatError}</div>}
        </div>
        <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
                <button
                    key={contact}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-neutral-800/50 transition-colors
                        ${selectedContact === contact ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'}`}
                >
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold">
                        {contact.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{contact}</span>
                </button>
            ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 bg-neutral-950 flex flex-col relative w-full h-full">
        {selectedContact ? (
            <ChatRoom key={selectedContact} currentUser={session.username} recipient={selectedContact} />
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                <MessageSquarePlus className="w-16 h-16 mb-4 opacity-20" />
                <h2 className="text-xl font-medium">Radius Chat</h2>
                <p className="mt-2">Select a contact or start a new conversation.</p>
            </div>
        )}
      </main>
    </div>
  )
}

export default App
