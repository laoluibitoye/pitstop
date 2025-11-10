import React from 'react'

export function SharedHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <a className="flex items-center space-x-2" href="/">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold">PitStop</span>
          </a>
        </div>
      </div>
    </header>
  )
}