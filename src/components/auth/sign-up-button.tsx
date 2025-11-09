'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import toast from 'react-hot-toast'

export function SignUpButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleSignUp = async () => {
    if (user) {
      router.push('/dashboard')
      return
    }

    setLoading(true)
    // For now, redirect to a simple auth page
    router.push('/auth/signup')
    toast.success('Redirecting to sign up...')
    setLoading(false)
  }

  return (
    <button
      onClick={handleSignUp}
      disabled={loading}
      className={`neo-button px-6 py-3 flex items-center space-x-2 disabled:opacity-50 ${className}`}
    >
      <UserPlus className="h-4 w-4" />
      <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
    </button>
  )
}