'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const result = await signUp(email, password, username)
      
      if (result.user && !result.session) {
        // User was created but needs email confirmation
        toast.success('🎉 Account created successfully! Please check your email and click the confirmation link before signing in.')
        // Clear form fields
        setEmail('')
        setUsername('')
        setPassword('')
        setConfirmPassword('')
        // Redirect to sign-in page after 2 seconds
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else if (result.session) {
        // User was created and is automatically signed in (email confirmation disabled)
        toast.success('Account created successfully!')
        router.push('/dashboard')
      } else {
        // Fallback case
        toast.success('Account created! Please check your email for confirmation.')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-blue-50 dark:from-dark-bg dark:via-primary-900 dark:to-dark-bg px-4">
      <div className="neo-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-dark-text mb-2">Create Account</h1>
          <p className="text-primary-600 dark:text-primary-300">Join thousands of teams using PitStop</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neo-input w-full"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="neo-input w-full"
              placeholder="Choose a unique username"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">This will be visible to other users</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neo-input w-full pr-10"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="neo-input w-full pr-10"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neo-button w-full py-3 flex items-center justify-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-primary-600 dark:text-primary-300">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-accent-blue-600 hover:text-accent-blue-700 font-semibold"
            >
              Sign in
            </button>
          </p>

          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center space-x-2 text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-dark-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  )
}