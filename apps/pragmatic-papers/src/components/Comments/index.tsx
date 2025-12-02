'use client'
import React, { useState } from 'react'
import { CommentsList } from './CommentsList'
import { CommentForm } from './CommentForm'
import './Comments.scss'

interface CommentsProps {
  articleId: string
  isAuthenticated: boolean
}

export const Comments: React.FC<CommentsProps> = ({ articleId, isAuthenticated }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchComments = React.useCallback(async () => {
    try {
      const response = await fetch(
        `/api/comments?where[article][equals]=${articleId}&where[status][equals]=approved&limit=100&sort=-createdAt`,
      )
      const data = await response.json()
      setComments(data.docs)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }, [articleId])

  React.useEffect(() => {
    fetchComments()
  }, [articleId, fetchComments])

  return (
    <div className="comments-section">
      <h2>Comments</h2>
      {loading ? (
        <p>Loading comments...</p>
      ) : (
        <>
          <CommentsList comments={comments} />
          <CommentForm
            articleId={articleId}
            isAuthenticated={isAuthenticated}
            onCommentSubmitted={fetchComments}
          />
        </>
      )}
    </div>
  )
}
