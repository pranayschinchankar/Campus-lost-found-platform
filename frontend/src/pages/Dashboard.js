import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/items/user/my-posts'),
      api.get('/claims/my-claims')
    ]).then(([postsRes, claimsRes]) => {
      setMyPosts(postsRes.data);
      setMyClaims(claimsRes.data);
    }).catch(() => {
      toast.error('Could not load dashboard data');
    }).finally(() => setLoading(false));
  }, []);

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/items/${id}`);
      setMyPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Could not delete post');
    }
  };

  const lostCount = myPosts.filter(p => p.type === 'lost').length;
  const foundCount = myPosts.filter(p => p.type === 'found').length;
  const resolvedCount = myPosts.filter(p => p.status === 'resolved').length;
  const pendingClaims = myClaims.filter(c => c.status === 'pending').length;

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* profile header */}
        <div className="dash-profile">
          <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            {user?.department && <span className="dept-tag">{user.department}</span>}
          </div>
          <Link to="/post-item" className="btn btn-primary">+ New Post</Link>
        </div>

        {/* stats */}
        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat-num">{myPosts.length}</span>
            <span className="dash-stat-label">Total Posts</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num lost">{lostCount}</span>
            <span className="dash-stat-label">Lost Reports</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num found">{foundCount}</span>
            <span className="dash-stat-label">Found Reports</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num resolved">{resolvedCount}</span>
            <span className="dash-stat-label">Resolved</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num">{pendingClaims}</span>
            <span className="dash-stat-label">Pending Claims</span>
          </div>
        </div>

        {/* tabs */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${tab === 'posts' ? 'active' : ''}`}
            onClick={() => setTab('posts')}
          >My Posts ({myPosts.length})</button>
          <button
            className={`dash-tab ${tab === 'claims' ? 'active' : ''}`}
            onClick={() => setTab('claims')}
          >My Claims ({myClaims.length})</button>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : tab === 'posts' ? (
          myPosts.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <h3>No posts yet</h3>
              <p>When you report a lost or found item, it'll show up here.</p>
              <Link to="/post-item" className="btn btn-primary" style={{ marginTop: 16 }}>Post your first item</Link>
            </div>
          ) : (
            <div className="grid-3">
              {myPosts.map(item => (
                <ItemCard key={item.id} item={item} onDelete={handleDeletePost} showActions />
              ))}
            </div>
          )
        ) : (
          myClaims.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🙋</div>
              <h3>No claim requests yet</h3>
              <p>Items you've requested to claim will appear here.</p>
            </div>
          ) : (
            <div className="claims-table">
              {myClaims.map(claim => (
                <div key={claim.id} className="claim-row">
                  <div className="claim-item-thumb">
                    {claim.image_url ? (
                      <img src={`http://localhost:5000${claim.image_url}`} alt={claim.item_title} />
                    ) : (
                      <span>{claim.item_type === 'lost' ? '😔' : '🎉'}</span>
                    )}
                  </div>
                  <div className="claim-row-info">
                    <Link to={`/items/${claim.item_id}`} className="claim-item-title">
                      {claim.item_title}
                    </Link>
                    <span className={`badge badge-${claim.item_type}`}>{claim.item_type}</span>
                  </div>
                  <div className="claim-row-date">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </div>
                  <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
