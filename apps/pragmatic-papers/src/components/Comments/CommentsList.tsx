import React from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  content: string
  authorName?: string
  author?: { name: string }
  createdAt: string
}

interface CommentsListProps {
  comments: Comment[]
}

export const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="comments-empty">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="comments-list">
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <strong className="comment-author">
              {comment.author?.name || comment.authorName || 'Anonymous'}
            </strong>
            <span className="comment-date">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="comment-content">{comment.content}</div>
        </div>
      ))}
    </div>
  )
}
