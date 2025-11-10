'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface DashboardContextType {
  isGuestMode: boolean
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    if (searchParams) {
      setIsGuestMode(searchParams.get('mode') === 'guest')
    }
  }, [searchParams])

  return (
    <DashboardContext.Provider value={{ isGuestMode }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}