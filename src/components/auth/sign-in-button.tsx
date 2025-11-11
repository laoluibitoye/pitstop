'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import toast from 'react-hot-toast'

export function SignInButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleSignIn = async () => {
    if (user) {
      router.push('/dashboard')
      return
    }

    setLoading(true)
    // For now, redirect to a simple auth page
    router.push('/auth/signin')
    toast.success('Redirecting to sign in...')
    setLoading(false)
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className={`neo-button px-6 py-3 flex items-center space-x-2 disabled:opacity-50 ${className}`}
    >
      <LogIn className="h-4 w-4" />
      <span>{loading ? 'Signing In...' : 'Sign In'}</span>
    </button>
  )
}