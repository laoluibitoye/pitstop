import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PitStop - Collaborative Task Manager',
  description: 'A modern, real-time collaborative task management application with premium UI/UX design.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-blue-50 dark:from-dark-bg dark:to-primary-900">
          {children}
        </div>
      </body>
    </html>
  )
}