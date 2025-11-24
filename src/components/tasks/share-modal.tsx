'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Copy, 
  Link, 
  Mail, 
  UserPlus, 
  Eye, 
  MessageSquare, 
  Edit, 
  Settings,
  Check,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskTitle: string
  currentShareLink?: string
}

interface ShareLink {
  id?: string
  token: string
  name?: string
  permission_type: 'view' | 'comment' | 'edit'
  is_active: boolean
  current_uses?: number
  max_uses?: number
}

export function ShareModal({ isOpen, onClose, taskId, taskTitle, currentShareLink }: ShareModalProps) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([
    {
      token: currentShareLink || 'gen-token-1',
      name: 'View Only',
      permission_type: 'view',
      is_active: true,
      current_uses: 0
    }
  ])
  const [showNewLinkForm, setShowNewLinkForm] = useState(false)
  const [newLinkName, setNewLinkName] = useState('')
  const [newLinkPermission, setNewLinkPermission] = useState<'view' | 'comment' | 'edit'>('view')
  const [activeTab, setActiveTab] = useState<'links' | 'collaborators'>('links')

  const generateShareToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const createShareLink = () => {
    const newLink: ShareLink = {
      token: generateShareToken(),
      name: newLinkName.trim() || 'Custom Link',
      permission_type: newLinkPermission,
      is_active: true,
      current_uses: 0
    }
    
    setShareLinks(prev => [...prev, newLink])
    setNewLinkName('')
    setShowNewLinkForm(false)
    toast.success('Share link created successfully!')
  }

  const copyToClipboard = (text: string, label: string) => {
    const fullUrl = `${window.location.origin}/shared/${text}`
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.success(`${label} copied to clipboard!`)
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  const toggleLinkStatus = (index: number) => {
    setShareLinks(prev => 
      prev.map((link, i) => 
        i === index ? { ...link, is_active: !link.is_active } : link
      )
    )
    toast.success('Link status updated!')
  }

  const deleteLink = (index: number) => {
    setShareLinks(prev => prev.filter((_, i) => i !== index))
    toast.success('Link deleted!')
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'view': return <Eye className="h-4 w-4" />
      case 'comment': return <MessageSquare className="h-4 w-4" />
      case 'edit': return <Edit className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'view': return 'text-blue-500'
      case 'comment': return 'text-green-500'
      case 'edit': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Share Task</h2>
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {taskTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('links')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'links'
                    ? 'text-foreground border-b-2 border-blue-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Link className="h-4 w-4 inline mr-2" />
                Share Links
              </button>
              <button
                onClick={() => setActiveTab('collaborators')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'collaborators'
                    ? 'text-foreground border-b-2 border-blue-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                Collaborators
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'links' ? (
                <div className="space-y-4">
                  {/* Existing Links */}
                  <div className="space-y-3">
                    {shareLinks.map((link, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getPermissionIcon(link.permission_type)}
                              <span className="font-medium text-foreground">{link.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-full bg-muted ${getPermissionColor(link.permission_type)}`}>
                                {link.permission_type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {link.current_uses || 0} uses • {link.is_active ? 'Active' : 'Inactive'}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                                {window.location.origin}/shared/{link.token}
                              </code>
                              <button
                                onClick={() => copyToClipboard(link.token, 'Link')}
                                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center space-x-1"
                              >
                                <Copy className="h-4 w-4" />
                                <span>Copy</span>
                              </button>
                              <button
                                onClick={() => copyToClipboard(link.token, 'URL')}
                                className="px-3 py-2 border border-border rounded hover:bg-accent transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleLinkStatus(index)}
                              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                link.is_active
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}
                            >
                              {link.is_active ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => deleteLink(index)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Link */}
                  {showNewLinkForm ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border border-border rounded-lg p-4 bg-muted/20"
                    >
                      <h3 className="font-medium text-foreground mb-3">Create New Share Link</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Link Name
                          </label>
                          <input
                            type="text"
                            value={newLinkName}
                            onChange={(e) => setNewLinkName(e.target.value)}
                            placeholder="e.g., Client View, Team Edit"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Permission Level
                          </label>
                          <select
                            value={newLinkPermission}
                            onChange={(e) => setNewLinkPermission(e.target.value as 'view' | 'comment' | 'edit')}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                          >
                            <option value="view">View Only - Can see task details</option>
                            <option value="comment">Comment - Can view and comment</option>
                            <option value="edit">Edit - Can view, comment, and edit</option>
                          </select>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={createShareLink}
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Create Link
                          </button>
                          <button
                            onClick={() => {
                              setShowNewLinkForm(false)
                              setNewLinkName('')
                              setNewLinkPermission('view')
                            }}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowNewLinkForm(true)}
                      className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-muted-foreground hover:text-blue-500"
                    >
                      <Link className="h-5 w-5 mx-auto mb-2" />
                      Create New Share Link
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Invite Collaborators</h3>
                  <p className="text-muted-foreground mb-4">
                    Invite specific users to collaborate on this task
                  </p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Invite User
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}