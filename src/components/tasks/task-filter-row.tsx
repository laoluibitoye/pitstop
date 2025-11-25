'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Calendar, Grid, List } from 'lucide-react'

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
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
}

export function TaskFilterRow({
  filters,
  onFiltersChange,
  onSearch,
  viewMode,
  onViewModeChange
}: TaskFilterRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localSearch, setLocalSearch] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value)
    onSearch(e.target.value)
  }

  const toggleStatus = (status: TaskStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    onFiltersChange({ ...filters, status: newStatus })
  }

  const togglePriority = (priority: TaskPriority) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority]
    onFiltersChange({ ...filters, priority: newPriority })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      category_id: '',
      created_date_from: '',
      created_date_to: '',
      updated_date_from: '',
      updated_date_to: ''
    })
    setLocalSearch('')
    onSearch('')
  }

  const activeFilterCount = filters.status.length + filters.priority.length +
    (filters.created_date_from ? 1 : 0) + (filters.created_date_to ? 1 : 0) +
    (filters.updated_date_from ? 1 : 0) + (filters.updated_date_to ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Main Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-lg p-2">
        {/* Search */}
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('')
                onSearch('')
              }}
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items - center space - x - 2 px - 3 py - 2 rounded - md text - sm font - medium transition - colors ${isExpanded || activeFilterCount > 0
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              } `}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Toggle */}
          {viewMode && onViewModeChange && (
            <>
              <div className="w-px h-6 bg-border mx-2"></div>
              <div className="flex items-center bg-accent/50 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p - 1.5 rounded - md transition - all ${viewMode === 'grid'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    } `}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`p - 1.5 rounded - md transition - all ${viewMode === 'list'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    } `}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-lg p-4 space-y-6">
              {/* Status Filters */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['ongoing', 'completed', 'delayed', 'cancelled'] as TaskStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px - 3 py - 1.5 rounded - full text - sm font - medium transition - all ${filters.status.includes(status)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                        } `}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Filters */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => togglePriority(priority)}
                      className={`px - 3 py - 1.5 rounded - full text - sm font - medium transition - all ${filters.priority.includes(priority)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                        } `}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created Date</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={filters.created_date_from || ''}
                        onChange={(e) => onFiltersChange({ ...filters, created_date_from: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-md text-sm"
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={filters.created_date_to || ''}
                        onChange={(e) => onFiltersChange({ ...filters, created_date_to: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Updated Date</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={filters.updated_date_from || ''}
                        onChange={(e) => onFiltersChange({ ...filters, updated_date_from: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-md text-sm"
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={filters.updated_date_to || ''}
                        onChange={(e) => onFiltersChange({ ...filters, updated_date_to: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}