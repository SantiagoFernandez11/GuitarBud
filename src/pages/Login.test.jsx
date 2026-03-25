import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Login from './Login'

// Mock the AuthContext so we don't need a real Supabase connection
const mockSignIn = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signIn: mockSignIn,
  }),
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    mockSignIn.mockReset()
  })

  it('renders the form fields and submit button', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders a link to the signup page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /create one/i })).toBeInTheDocument()
  })

  it('calls signIn with email and password on submit', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'secret123')
  })

  it('shows an error message when signIn fails', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('disables the button and shows loading text while submitting', async () => {
    // Never resolves so we can inspect the loading state
    mockSignIn.mockReturnValue(new Promise(() => {}))
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    const button = screen.getByRole('button', { name: /signing in/i })
    expect(button).toBeDisabled()
  })
})
