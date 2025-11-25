'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploaderProps {
    onUpload: (file: File) => Promise<void>
    accept?: string
    maxSizeMB?: number
    className?: string
}

export function FileUploader({
    onUpload,
    accept = 'image/*,.pdf,.doc,.docx,.txt',
    maxSizeMB = 5,
    className = ''
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const validateFile = (file: File): boolean => {
        setError(null)

        // Check size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeMB}MB`)
            return false
        }

        // Check type (basic check)
        // Ideally we'd check against the 'accept' prop more rigorously
        return true
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            await processFile(files[0])
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            await processFile(files[0])
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const processFile = async (file: File) => {
        if (!validateFile(file)) return

        setIsUploading(true)
        try {
            await onUpload(file)
        } catch (err: any) {
            setError(err.message || 'Failed to upload file')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={`w-full ${className}`}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={accept}
                    className="hidden"
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                        <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}

                    <div className="text-sm">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Images, PDF, DOC up to {maxSizeMB}MB
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-destructive flex items-center"
                    >
                        <X className="h-4 w-4 mr-1" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
