'use client'

import { useState } from 'react'
import { X, Plus, Calendar, Flag, Globe, Lock, Hash, XCircle, File as FileIcon, Trash2 } from 'lucide-react'
import { Task } from '@/types'
import { FileUploader } from '@/components/common/file-uploader'

interface CreateTaskModalProps {
  onClose: () => void
  onCreateTask: (taskData: any) => void
  isGuestMode?: boolean
}

export function CreateTaskModal({ onClose, onCreateTask, isGuestMode }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const handleFileSelect = async (file: File) => {
    setFiles(prev => [...prev, file])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const taskData: any = {
      title: title.trim(),
      description: description.trim(),
      priority,
      visibility,
      tags: tags.length > 0 ? tags : null,
      files: files.length > 0 ? files : null,
    }

    if (dueDate) {
      taskData.due_date = dueDate
    }

    onCreateTask(taskData)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setVisibility('private')
    setTags([])
    setNewTag('')
    setFiles([])
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="neo-card bg-white/90 dark:bg-dark-card/90 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-900 dark:text-dark-text">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1 text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-dark-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="neo-input w-full"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neo-input w-full"
              placeholder="Provide details about this task..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
                <Flag className="h-4 w-4 inline mr-1" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="neo-input w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="neo-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              Visibility
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${visibility === 'private'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'border-border hover:bg-accent'
                  }`}
              >
                <Lock className="h-4 w-4" />
                <span>Private</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${visibility === 'public'
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                  : 'border-border hover:bg-accent'
                  }`}
              >
                <Globe className="h-4 w-4" />
                <span>Public</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {visibility === 'private'
                ? 'Only you and invited collaborators can see this task'
                : 'Visible to the entire community - others can discover and collaborate'
              }
            </p>
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              <Hash className="h-4 w-4 inline mr-1" />
              Tags (Optional)
            </label>
            <div className="space-y-3">
              {/* Tag Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1 neo-input"
                  placeholder="Add a tag (max 10)"
                  maxLength={30}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.length >= 10}
                  className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Tag Count */}
              <div className="text-xs text-muted-foreground">
                {tags.length}/10 tags
              </div>

              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      <Hash className="h-3 w-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Tags help others discover your task in the community. Separate multiple words with hyphens or underscores.
              </p>
            </div>
          </div>


          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              <FileIcon className="h-4 w-4 inline mr-1" />
              Attachments
            </label>

            <div className="space-y-4">
              <FileUploader
                onUpload={handleFileSelect}
                className="bg-white dark:bg-dark-card"
              />

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent/10 rounded-lg border border-border">
                      <div className="flex items-center space-x-2 truncate">
                        <FileIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {
            isGuestMode && (
              <div className="neo-card p-3 bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Guest Mode: You can create up to 1 task and 3 comments.
                  Sign up for unlimited features.
                </p>
              </div>
            )
          }

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-dark-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 neo-button flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}