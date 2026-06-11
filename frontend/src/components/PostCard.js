import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './PostCard.css';

const PostCard = ({ post, onPostUpdate }) => {
  const { user: currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes || []);
  const [likeUsernames, setLikeUsernames] = useState(post.likeUsernames || []);
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?.id));
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnPost = post.user?._id === currentUser?.id || post.user === currentUser?.id;

  const handleLike = async () => {
    try {
      const res = await API.post(`/posts/${post._id}/like`);
      setLikes(res.data.likes);
      setLikeUsernames(res.data.likeUsernames);
      setLiked(res.data.liked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const res = await API.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(res.data.comments);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await API.post(`/auth/follow/${post.user?._id}`);
      setIsFollowing(res.data.isFollowing);
    } catch (error) {
      console.error('Error following:', error);
    }
    setFollowLoading(false);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.user?._id}`} className="post-user">
          <div className="avatar">{post.username?.[0]?.toUpperCase()}</div>
          <div>
            <div className="post-username">{post.username}</div>
            <div className="post-time">{formatDate(post.createdAt)}</div>
          </div>
        </Link>
        {!isOwnPost && (
          <button
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={handleFollow}
            disabled={followLoading}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {post.text && <div className="post-text">{post.text}</div>}

      {post.image && (
        <div className="post-image-container">
          <img src={post.image} alt="Post content" className="post-image" />
        </div>
      )}

      <div className="post-stats">
        {likes.length > 0 && (
          <span className="likes-count">
            <span className="like-icon">👍</span> {likes.length}
          </span>
        )}
        {comments.length > 0 && (
          <span className="comments-count" onClick={() => setShowComments(!showComments)}>
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? '👍 Liked' : '👍 Like'}
        </button>
        <button
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comment
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {comments.length > 0 && (
            <div className="comments-list">
              {comments.map((comment, idx) => (
                <div key={comment._id || idx} className="comment">
                  <div className="comment-avatar">{comment.username?.[0]?.toUpperCase()}</div>
                  <div className="comment-body">
                    <Link to={`/profile/${comment.user}`} className="comment-user">
                      {comment.username}
                    </Link>
                    <div className="comment-text">{comment.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button
              type="submit"
              className="comment-submit"
              disabled={loading || !commentText.trim()}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
