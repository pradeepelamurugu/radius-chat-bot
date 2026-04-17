import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'
import { vi, describe, it, expect } from 'vitest'

// Mock the whole useChat hook
vi.mock('./hooks/useChat', () => ({
  useChat: () => ({
    messages: [
      { id: 1, user: 'System', text: 'Welcome to chat!', timestamp: new Date().toISOString(), read_by: [] }
    ],
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
    connectionStatus: 'Connected'
  })
}))

describe('App Component', () => {
  it('renders login screen initially, then chat room after entering name', async () => {
    render(<App />)
    
    // Should show Name prompt
    expect(screen.getByText(/Join Radius Chat/i)).toBeInTheDocument()
    
    // Type name
    const input = screen.getByPlaceholderText(/Enter your name/i)
    fireEvent.change(input, { target: { value: 'John' } })
    
    // Click join
    const button = screen.getByRole('button', { name: /Join/i })
    fireEvent.click(button)
    
    // Now should show Chat Room
    await waitFor(() => {
      expect(screen.getByText(/Radius Chat/i)).toBeInTheDocument()
    })
    
    // Verify our mocked message appears
    expect(screen.getByText(/Welcome to chat!/i)).toBeInTheDocument()
  })
})
