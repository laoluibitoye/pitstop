'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, Calendar, Tag } from 'lucide-react'

type TaskStatus = 'ongoing' | 'completed' | 'delayed' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface TaskFilters {
  status: TaskStatus[]
  priority: TaskPriority[]
  category_id: string
}

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  onSearch: (query: string) => void
}

export function TaskFilters({ filters, onFiltersChange, onSearch }: TaskFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const toggleFilter = (type: 'status' | 'priority', value: string) => {
    const currentValues = (filters[type] as string[]) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onFiltersChange({
      ...filters,
      [type]: newValues
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      category_id: '',
    })
    setSearchQuery('')
    onSearch('')
  }

  const hasActiveFilters = (filters.status?.length || 0) > 0 || (filters.priority?.length || 0) > 0 || searchQuery

  return (
    <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-dark-text flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-accent-blue-600 hover:text-accent-blue-800 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="neo-input pl-10 w-full"
        />
      </div>

      {/* Status Filter */}
      <div>
        <h4 className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Status
        </h4>
        <div className="space-y-2">
          {(['ongoing', 'completed', 'delayed', 'cancelled'] as TaskStatus[]).map(status => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={(filters.status || []).includes(status)}
                onChange={() => toggleFilter('status', status)}
                className="rounded border-primary-300 text-accent-blue-600 focus:ring-accent-blue-500"
              />
              <span className="ml-2 text-sm text-primary-600 dark:text-primary-300 capitalize">
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <h4 className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-3 flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          Priority
        </h4>
        <div className="space-y-2">
          {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(priority => (
            <label key={priority} className="flex items-center">
              <input
                type="checkbox"
                checked={(filters.priority || []).includes(priority)}
                onChange={() => toggleFilter('priority', priority)}
                className="rounded border-primary-300 text-accent-blue-600 focus:ring-accent-blue-500"
              />
              <span className="ml-2 text-sm text-primary-600 dark:text-primary-300 capitalize">
                {priority}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-4 border-t border-primary-200 dark:border-primary-700">
        <h4 className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
          Quick Actions
        </h4>
        <div className="space-y-2 text-sm">
          <button className="w-full text-left text-accent-blue-600 hover:text-accent-blue-800">
            My Tasks
          </button>
          <button className="w-full text-left text-accent-blue-600 hover:text-accent-blue-800">
            Due Today
          </button>
          <button className="w-full text-left text-accent-blue-600 hover:text-accent-blue-800">
            High Priority
          </button>
        </div>
      </div>
    </div>
  )
}