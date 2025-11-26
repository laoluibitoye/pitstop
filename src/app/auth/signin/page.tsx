'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guestName, setGuestName] = useState('')
  const { signIn, loginAsGuest } = useAuth()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('Signed in successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-blue-50 dark:from-dark-bg dark:via-primary-900 dark:to-dark-bg px-4">
      <div className="neo-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-dark-text mb-2">Sign In</h1>
          <p className="text-primary-600 dark:text-primary-300">Welcome back to PitStop</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
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
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neo-input w-full pr-10"
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="neo-button w-full py-3 flex items-center justify-center space-x-2"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-primary-600 dark:text-primary-300">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-accent-blue-600 hover:text-accent-blue-700 font-semibold"
            >
              Sign up
            </button>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-dark-card px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="neo-input w-full"
              placeholder="Enter your name (optional)"
            />
            <button
              onClick={async () => {
                setLoading(true)
                try {
                  await loginAsGuest(guestName)
                  toast.success('Continued as guest!')
                  router.push('/dashboard')
                } catch (error) {
                  toast.error('Failed to continue as guest')
                } finally {
                  setLoading(false)
                }
              }}
              className="w-full py-3 border-2 border-primary-200 dark:border-primary-800 rounded-xl font-semibold text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-colors flex items-center justify-center space-x-2"
            >
              <EyeOff className="h-4 w-4" />
              <span>Continue as Guest</span>
            </button>
          </div>

          {/* Real implementation below */}


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