import React from 'react'

export function SharedFooter() {
  return (
    <footer className="border-t bg-muted/20 py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-semibold">PitStop</span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              100% FREE
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2025 PitStop. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}