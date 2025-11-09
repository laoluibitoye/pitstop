'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface PasswordValidatorProps {
  password: string
  onValidationChange?: (isValid: boolean) => void
  showRequirements?: boolean
}

interface PasswordRequirement {
  id: string
  label: string
  test: (password: string) => boolean
  met: boolean
}

export function PasswordValidator({ 
  password, 
  onValidationChange,
  showRequirements = true 
}: PasswordValidatorProps) {
  const [showPassword, setShowPassword] = useState(false)

  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password)
    },
    {
      id: 'number',
      label: 'Contains a number',
      test: (pwd) => /\d/.test(pwd),
      met: /\d/.test(password)
    },
    {
      id: 'special',
      label: 'Contains a special character (!@#$%^&*(),.?":{}|<>)',
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    },
    {
      id: 'common',
      label: 'No common passwords or patterns',
      test: (pwd) => !/password|123456|qwerty|admin|test|letmein/i.test(pwd),
      met: !/password|123456|qwerty|admin|test|letmein/i.test(password)
    }
  ]

  const isPasswordValid = requirements.every(req => req.met)
  const strength = calculatePasswordStrength(password, requirements)

  // Notify parent component of validation state
  if (onValidationChange) {
    onValidationChange(isPasswordValid)
  }

  return (
    <div className="space-y-3">
      {/* Password Input with Show/Hide Toggle */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          placeholder="Enter a strong password"
          className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-dark-bg text-primary-900 dark:text-dark-text placeholder-primary-400 focus:outline-none focus:ring-2 transition-colors ${
            password.length === 0
              ? 'border-primary-300 dark:border-primary-600 focus:ring-accent-blue-500'
              : isPasswordValid
              ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
              : 'border-red-300 dark:border-red-600 focus:ring-red-500'
          }`}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-500 hover:text-primary-700"
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary-600 dark:text-primary-400">
              Password Strength
            </span>
            <div className="flex items-center space-x-1">
              {strength.label === 'Very Strong' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {strength.label === 'Strong' && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
              {strength.label === 'Medium' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
              {strength.label === 'Weak' && <XCircle className="h-4 w-4 text-red-500" />}
              <span className={`text-xs font-medium text-${strength.color}`}>
                {strength.label}
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 bg-gradient-to-r ${
                strength.color === 'green' ? 'from-green-400 to-green-600' :
                strength.color === 'blue' ? 'from-blue-400 to-blue-600' :
                strength.color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
                'from-red-400 to-red-600'
              }`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Password Requirements */}
      {showRequirements && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-primary-700 dark:text-primary-300">
            Password Requirements
          </h4>
          <div className="grid grid-cols-1 gap-1">
            {requirements.map((requirement) => (
              <div
                key={requirement.id}
                className={`flex items-center space-x-2 text-xs ${
                  requirement.met
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-primary-500 dark:text-primary-500'
                }`}
              >
                {requirement.met ? (
                  <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                )}
                <span className={requirement.met ? 'line-through' : ''}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to calculate password strength
function calculatePasswordStrength(password: string, requirements: PasswordRequirement[]): {
  score: number
  label: string
  color: string
} {
  const metRequirements = requirements.filter(req => req.met).length
  const totalRequirements = requirements.length
  
  // Base score from requirements
  const baseScore = (metRequirements / totalRequirements) * 70
  
  // Bonus for longer passwords
  let bonusScore = 0
  if (password.length >= 12) bonusScore += 15
  else if (password.length >= 10) bonusScore += 10
  else if (password.length >= 8) bonusScore += 5
  
  // Bonus for mixed character types
  const charTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  ].filter(Boolean).length
  
  if (charTypes >= 4) bonusScore += 15
  else if (charTypes >= 3) bonusScore += 10
  
  const totalScore = Math.min(baseScore + bonusScore, 100)
  
  if (totalScore >= 90) return { score: totalScore, label: 'Very Strong', color: 'green' }
  if (totalScore >= 70) return { score: totalScore, label: 'Strong', color: 'blue' }
  if (totalScore >= 50) return { score: totalScore, label: 'Medium', color: 'yellow' }
  return { score: totalScore, label: 'Weak', color: 'red' }
}

// Hook for password validation
export function usePasswordValidation() {
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validatePassword = (password: string): boolean => {
    const validationErrors: string[] = []
    
    if (password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      validationErrors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      validationErrors.push('Password must contain at least one lowercase letter')
    }
    if (!/\d/.test(password)) {
      validationErrors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      validationErrors.push('Password must contain at least one special character')
    }
    if (/password|123456|qwerty|admin|test|letmein/i.test(password)) {
      validationErrors.push('Password cannot contain common patterns')
    }
    
    setErrors(validationErrors)
    const valid = validationErrors.length === 0
    setIsValid(valid)
    return valid
  }

  return {
    isValid,
    errors,
    validatePassword,
    setIsValid,
    setErrors
  }
}