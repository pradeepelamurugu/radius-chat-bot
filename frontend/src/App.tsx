import { useState } from 'react'
import ChatRoom from './components/ChatRoom'

function App() {
  const [username, setUsername] = useState('')
  const [isJoined, setIsJoined] = useState(false)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setIsJoined(true)
    }
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 text-white">
        <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-neutral-700">
          <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">Join Radius Chat</h1>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-1">Display Name</label>
              <input
                id="name"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors py-2 rounded-lg font-medium shadow-md"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <ChatRoom username={username} />
}

export default App
