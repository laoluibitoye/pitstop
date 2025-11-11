'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Calendar, Flag, ChevronDown, Check } from 'lucide-react'

type TaskStatus = 'ongoing' | 'completed' | 'delayed' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface TaskFilters {
  status: TaskStatus[]
  priority: TaskPriority[]
  category_id: string
  created_date_from?: string
  created_date_to?: string
  updated_date_from?: string
  updated_date_to?: string
}

interface TaskFilterRowProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  onSearch: (query: string) => void
}

export function TaskFilterRow({ filters, onFiltersChange, onSearch }: TaskFilterRowProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDateFilters, setShowDateFilters] = useState(false)
  const [showStatusFilters, setShowStatusFilters] = useState(false)
  const [showPriorityFilters, setShowPriorityFilters] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const toggleFilter = (type: 'status' | 'priority', value: string, add: boolean = true) => {
    const currentValues = (filters[type] as string[]) || []
    const newValues = add
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value)
    
    onFiltersChange({
      ...filters,
      [type]: newValues
    })
  }

  const handleDateFilterChange = (field: string, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      category_id: '',
      created_date_from: '',
      created_date_to: '',
      updated_date_from: '',
      updated_date_to: '',
    })
    setSearchQuery('')
    onSearch('')
  }

  const hasActiveFilters = (filters.status?.length || 0) > 0 || 
                          (filters.priority?.length || 0) > 0 || 
                          searchQuery ||
                          filters.created_date_from || 
                          filters.created_date_to ||
                          filters.updated_date_from || 
                          filters.updated_date_to

  const hasDateFilters = filters.created_date_from || 
                        filters.created_date_to ||
                        filters.updated_date_from || 
                        filters.updated_date_to

  const statusOptions: TaskStatus[] = ['ongoing', 'completed', 'delayed', 'cancelled']
  const priorityOptions: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'delayed': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  return (
    <div className="neo-card p-4 bg-white/50 dark:bg-dark-card/50 space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Status Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusFilters(!showStatusFilters)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center space-x-2 ${
              (filters.status || []).length > 0 
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            <Flag className="h-4 w-4" />
            <span>Status {(filters.status || []).length > 0 ? `(${filters.status.length})` : ''}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showStatusFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {showStatusFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 z-10 w-48 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg p-2"
            >
              <div className="space-y-1">
                {statusOptions.map((status) => {
                  const isSelected = (filters.status || []).includes(status)
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        if (isSelected) {
                          toggleFilter('status', status, false)
                        } else {
                          toggleFilter('status', status, true)
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        isSelected
                          ? getStatusColor(status)
                          : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Priority Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPriorityFilters(!showPriorityFilters)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center space-x-2 ${
              (filters.priority || []).length > 0 
                ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            <Flag className="h-4 w-4" />
            <span>Priority {(filters.priority || []).length > 0 ? `(${filters.priority.length})` : ''}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showPriorityFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {showPriorityFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 z-10 w-48 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg p-2"
            >
              <div className="space-y-1">
                {priorityOptions.map((priority) => {
                  const isSelected = (filters.priority || []).includes(priority)
                  return (
                    <button
                      key={priority}
                      onClick={() => {
                        if (isSelected) {
                          toggleFilter('priority', priority, false)
                        } else {
                          toggleFilter('priority', priority, true)
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        isSelected
                          ? getPriorityColor(priority)
                          : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{priority}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Date Filter Toggle & Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDateFilters(!showDateFilters)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center space-x-2 ${
              hasDateFilters 
                ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Date Filters</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showDateFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expandable Date Filters */}
      <AnimatePresence>
        {showDateFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
              {/* Created Date Range */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Created From
                </label>
                <input
                  type="date"
                  value={filters.created_date_from || ''}
                  onChange={(e) => handleDateFilterChange('created_date_from', e.target.value)}
                  className="neo-input w-full text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Created To
                </label>
                <input
                  type="date"
                  value={filters.created_date_to || ''}
                  onChange={(e) => handleDateFilterChange('created_date_to', e.target.value)}
                  className="neo-input w-full text-xs"
                />
              </div>

              {/* Modified Date Range */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Modified From
                </label>
                <input
                  type="date"
                  value={filters.updated_date_from || ''}
                  onChange={(e) => handleDateFilterChange('updated_date_from', e.target.value)}
                  className="neo-input w-full text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Modified To
                </label>
                <input
                  type="date"
                  value={filters.updated_date_to || ''}
                  onChange={(e) => handleDateFilterChange('updated_date_to', e.target.value)}
                  className="neo-input w-full text-xs"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.status?.map(status => (
            <span key={`status-${status}`} className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
              {status}
            </span>
          ))}
          {filters.priority?.map(priority => (
            <span key={`priority-${priority}`} className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(priority)}`}>
              {priority}
            </span>
          ))}
          {searchQuery && (
            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
              Search: "{searchQuery}"
            </span>
          )}
          {(filters.created_date_from || filters.created_date_to) && (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
              Created Date
            </span>
          )}
          {(filters.updated_date_from || filters.updated_date_to) && (
            <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800">
              Modified Date
            </span>
          )}
        </div>
      )}
    </div>
  )
}