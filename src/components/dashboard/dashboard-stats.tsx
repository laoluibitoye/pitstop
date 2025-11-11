'use client'

import { CheckCircle, Clock, Flag } from 'lucide-react'
import { Task } from '@/types'

interface DashboardStatsProps {
  tasks: Task[]
}

export function DashboardStats({ tasks }: DashboardStatsProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const ongoingTasks = tasks.filter(task => task.status === 'ongoing').length
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false
    return new Date(task.due_date) < new Date() && task.status !== 'completed'
  }).length

  

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'In Progress',
      value: ongoingTasks,
      icon: Clock,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: Flag,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.title} className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-300 font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-dark-text">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}