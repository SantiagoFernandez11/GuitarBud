import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Signup from './Signup'

const mockSignUp = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signUp: mockSignUp,
  }),
}))

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  )
}

describe('Signup', () => {
  beforeEach(() => {
    mockSignUp.mockReset()
  })

  it('renders all form fields and the submit button', () => {
    renderSignup()
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders a link back to the login page', () => {
    renderSignup()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows an error when passwords do not match', async () => {
    renderSignup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows an error when password is too short', async () => {
    renderSignup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'abc')
    await user.type(screen.getByLabelText(/confirm password/i), 'abc')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('calls signUp with email and password when form is valid', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    renderSignup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('shows success screen after successful signup', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    renderSignup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument()
    })
  })

  it('shows an error message when signUp fails', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Email already registered' } })
    renderSignup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^email/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })

  it('disables the button and shows loading text while submitting', async () => {
    mockSignUp.mockReturnValue(new Promise(() => {}))
    renderSignup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    const button = screen.getByRole('button', { name: /creating account/i })
    expect(button).toBeDisabled()
  })
})
