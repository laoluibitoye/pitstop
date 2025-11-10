'use client'

interface SharedFooterProps {
  showQuickStats?: boolean
  className?: string
}

export function SharedFooter({ showQuickStats = false, className = '' }: SharedFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`border-t border-border bg-muted/20 py-6 mt-12 ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
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
            © {currentYear} PitStop. All rights reserved.
          </div>
        </div>
        
        {showQuickStats && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">1,234</div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">890</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">234</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">110</div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}