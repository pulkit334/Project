import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import FilterBar from '../components/FilterBar';
import Sidebar from '../components/Sidebar';
import './Feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState('newest');

  const fetchPosts = useCallback(async (pageNum = 1, sort = 'newest', replace = true) => {
    try {
      const res = await API.get(`/posts/feed?page=${pageNum}&limit=10&sort=${sort}`);
      if (replace) {
        setPosts(res.data.posts);
      } else {
        setPosts((prev) => [...prev, ...res.data.posts]);
      }
      setPages(res.data.pages);
      setPage(res.data.page);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    fetchPosts(1, activeFilter, true);
  }, [fetchPosts, activeFilter]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleFilterChange = (filter) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
  };

  const loadMore = () => {
    if (page < pages) {
      setLoadingMore(true);
      fetchPosts(page + 1, activeFilter, false);
    }
  };

  return (
    <div className="feed-page">
      <Sidebar />
      <div className="feed-content">
        <div className="page-container">
          <CreatePost onPostCreated={handlePostCreated} />
          <FilterBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />

          {loading ? (
            <div className="loading-posts">
              <div className="spinner"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            <>
              <div className="posts-list">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {page < pages && (
                <button
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
