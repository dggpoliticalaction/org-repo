'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import './CommentForm.scss'

interface CommentFormProps {
  articleId: string
  isAuthenticated: boolean
  onCommentSubmitted: () => void
}

interface FormData {
  content: string
  authorName?: string
  authorEmail?: string
}

export const CommentForm: React.FC<CommentFormProps> = ({
  articleId,
  isAuthenticated,
  onCommentSubmitted,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: data.content,
          article: Number(articleId),
          ...(!isAuthenticated && {
            authorName: data.authorName,
            authorEmail: data.authorEmail,
          }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Failed to submit comment')
      }

      setSuccess(true)
      reset()
      onCommentSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="comment-form">
      <h3>Leave a Comment</h3>
      {success && <div className="comment-success">Comment submitted successfully!</div>}
      {error && <div className="comment-error">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        {!isAuthenticated && (
          <>
            <div className="form-field">
              <Label htmlFor="authorName">Name *</Label>
              <Input
                id="authorName"
                {...register('authorName', { required: 'Name is required' })}
                placeholder="Your name"
              />
              {errors.authorName && <span className="error">{errors.authorName.message}</span>}
            </div>
            <div className="form-field">
              <Label htmlFor="authorEmail">Email *</Label>
              <Input
                id="authorEmail"
                type="email"
                {...register('authorEmail', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                placeholder="your.email@example.com"
              />
              {errors.authorEmail && <span className="error">{errors.authorEmail.message}</span>}
            </div>
          </>
        )}
        <div className="form-field">
          <Label htmlFor="content">Comment *</Label>
          <Textarea
            id="content"
            {...register('content', {
              required: 'Comment is required',
              maxLength: {
                value: 2000,
                message: 'Comment must be less than 2000 characters',
              },
            })}
            placeholder="Share your thoughts..."
            rows={4}
          />
          {errors.content && <span className="error">{errors.content.message}</span>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Comment'}
        </Button>
      </form>
    </div>
  )
}
