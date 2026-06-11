import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          API.get(`/auth/user/${userId}`),
          API.get(`/posts/user/${userId}`)
        ]);
        setProfileUser(userRes.data.user);
        setIsFollowing(userRes.data.user.isFollowing);
        setPosts(postsRes.data.posts);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await API.post(`/auth/follow/${userId}`);
      setIsFollowing(res.data.isFollowing);
      setProfileUser(prev => ({
        ...prev,
        followersCount: res.data.followersCount
      }));
    } catch (error) {
      console.error('Error following:', error);
    }
    setFollowLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="profile-page">
      <div className="page-container">
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            {profileUser?.username?.[0]?.toUpperCase()}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{profileUser?.username}</h2>
            <p className="profile-email">{profileUser?.email}</p>
            {profileUser?.bio && <p className="profile-bio">{profileUser.bio}</p>}
            <div className="profile-stats-row">
              <span className="stat-item"><strong>{posts.length}</strong> posts</span>
              <span className="stat-item"><strong>{profileUser?.followers?.length || 0}</strong> followers</span>
              <span className="stat-item"><strong>{profileUser?.following?.length || 0}</strong> following</span>
            </div>
          </div>
          {!isOwnProfile && (
            <button
              className={`follow-btn-lg ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <div className="profile-posts-label">Posts</div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <p>{isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
