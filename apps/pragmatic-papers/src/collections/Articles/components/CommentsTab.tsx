'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import './CommentsTab.scss'

interface Comment {
  id: string
  content: string
  authorName?: string
  author?: { name: string }
  status: 'approved' | 'pending' | 'rejected'
  createdAt: string
}

const CommentsTab: React.FC = () => {
  const { id } = useDocumentInfo()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = React.useCallback(async () => {
    try {
      const response = await fetch(
        `/api/comments?where[article][equals]=${id}&limit=100&sort=-createdAt`,
      )
      const data = await response.json()
      setComments(data.docs)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    if (id) {
      fetchComments()
    }
  }, [id, fetchComments])

  const updateCommentStatus = async (commentId: string, status: string) => {
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      fetchComments()
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }

  const deleteComment = async (commentId: string) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      fetchComments()
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  if (loading) {
    return <div className="comments-tab">Loading comments...</div>
  }

  return (
    <div className="comments-tab">
      <h3>Comments ({comments.length})</h3>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className={`comment-item comment-${comment.status}`}>
              <div className="comment-header">
                <strong>{comment.author?.name || comment.authorName || 'Anonymous'}</strong>
                <span className={`comment-status status-${comment.status}`}>{comment.status}</span>
                <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-actions">
                {comment.status !== 'approved' && (
                  <button onClick={() => updateCommentStatus(comment.id, 'approved')}>
                    Approve
                  </button>
                )}
                {comment.status !== 'rejected' && (
                  <button onClick={() => updateCommentStatus(comment.id, 'rejected')}>
                    Reject
                  </button>
                )}
                <button onClick={() => deleteComment(comment.id)} className="delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentsTab
