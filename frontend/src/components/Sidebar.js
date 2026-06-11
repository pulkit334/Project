import React, { useState } from 'react';
import API from '../utils/api';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('posts');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [followingState, setFollowingState] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      if (searchType === 'posts') {
        const res = await API.get(`/posts/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.posts.map(p => ({ type: 'post', data: p })));
      } else {
        const res = await API.get(`/auth/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.users.map(u => ({ type: 'user', data: u })));
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearching(false);
  };

  const handleFollow = async (userId) => {
    try {
      const res = await API.post(`/auth/follow/${userId}`);
      setFollowingState(prev => ({
        ...prev,
        [userId]: res.data.isFollowing
      }));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Search</h3>
        <div className="search-toggle">
          <button
            className={`toggle-btn ${searchType === 'posts' ? 'active' : ''}`}
            onClick={() => { setSearchType('posts'); setSearchResults([]); }}
          >
            Posts
          </button>
          <button
            className={`toggle-btn ${searchType === 'users' ? 'active' : ''}`}
            onClick={() => { setSearchType('users'); setSearchResults([]); }}
          >
            Users
          </button>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder={searchType === 'posts' ? 'Search posts...' : 'Search users...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" disabled={searching}>
            {searching ? '...' : '🔍'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results">
            <button className="clear-search" onClick={clearSearch}>Clear</button>
            {searchResults.map((result, idx) => {
              if (result.type === 'post') {
                const p = result.data;
                return (
                  <div key={p._id || idx} className="search-result-item">
                    <div className="result-avatar">{p.username?.[0]?.toUpperCase()}</div>
                    <div className="result-info">
                      <span className="result-name">{p.username}</span>
                      <span className="result-text">{p.text?.substring(0, 60)}{p.text?.length > 60 ? '...' : ''}</span>
                      <span className="result-meta">👍 {p.likes?.length || 0} · 💬 {p.comments?.length || 0}</span>
                    </div>
                  </div>
                );
              } else {
                const u = result.data;
                const isFollowing = followingState[u.id] !== undefined
                  ? followingState[u.id]
                  : u.isFollowing;
                return (
                  <div key={u.id || idx} className="search-result-item">
                    <Link to={`/profile/${u.id}`} className="result-avatar">{u.username?.[0]?.toUpperCase()}</Link>
                    <div className="result-info">
                      <Link to={`/profile/${u.id}`} className="result-name">{u.username}</Link>
                      <span className="result-meta">{u.followersCount} followers</span>
                    </div>
                    <button
                      className={`follow-btn-sm ${isFollowing ? 'following' : ''}`}
                      onClick={() => handleFollow(u.id)}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
