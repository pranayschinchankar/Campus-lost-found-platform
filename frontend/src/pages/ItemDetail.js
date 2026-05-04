import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './ItemDetail.css';

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [claimMsg, setClaimMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);

  useEffect(() => {
    api.get(`/items/${id}`)
      .then(res => setItem(res.data))
      .catch(() => toast.error('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // load claims only if the current user owns this item
  useEffect(() => {
    if (item && user && item.user_id === user.id) {
      api.get(`/claims/item/${id}`)
        .then(res => setClaims(res.data))
        .catch(() => {});
    }
  }, [item, user, id]);

  const handleClaim = async (e) => {
    e.preventDefault();
    setClaimLoading(true);
    try {
      await api.post(`/claims/${id}`, { message: claimMsg });
      toast.success('Claim request sent! The poster will review it shortly.');
      setShowClaimForm(false);
      setClaimMsg('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send claim');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleClaimAction = async (claimId, status) => {
    try {
      await api.patch(`/claims/${claimId}`, { status });
      toast.success(`Claim ${status}!`);
      // refresh claims list and item status
      const [claimsRes, itemRes] = await Promise.all([
        api.get(`/claims/item/${id}`),
        api.get(`/items/${id}`)
      ]);
      setClaims(claimsRes.data);
      setItem(itemRes.data);
    } catch (err) {
      toast.error('Could not update claim status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/items/${id}`);
      toast.success('Post deleted');
      navigate('/browse');
    } catch {
      toast.error('Could not delete post');
    }
  };

  if (loading) return <div className="spinner" />;
  if (!item) return <div className="container"><p>Item not found.</p></div>;

  const isOwner = user && item.user_id === user.id;
  const isLoggedIn = !!user;
  const imgSrc = item.image_url ? `http://localhost:5000${item.image_url}` : null;

  return (
    <div className="detail-page">
      <div className="container">
        <div className="detail-back">
          <Link to="/browse" className="btn btn-ghost">← Back to Browse</Link>
        </div>

        <div className="detail-layout">
          {/* left: image */}
          <div className="detail-image-col">
            {imgSrc ? (
              <img src={imgSrc} alt={item.title} className="detail-image" />
            ) : (
              <div className="detail-no-image">
                <span>{item.type === 'lost' ? '😔' : '🎉'}</span>
              </div>
            )}
          </div>

          {/* right: details */}
          <div className="detail-info-col">
            <div className="detail-badges">
              <span className={`badge badge-${item.type}`}>
                {item.type === 'lost' ? '● Lost' : '● Found'}
              </span>
              {item.status === 'resolved' && (
                <span className="badge badge-resolved">Resolved</span>
              )}
              {item.category && (
                <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                  {item.category}
                </span>
              )}
            </div>

            <h1 className="detail-title">{item.title}</h1>

            {item.description && (
              <p className="detail-desc">{item.description}</p>
            )}

            <div className="detail-meta">
              {item.location && (
                <div className="meta-row"><span className="meta-icon">📍</span><span>{item.location}</span></div>
              )}
              <div className="meta-row">
                <span className="meta-icon">👤</span>
                <span>Posted by {item.poster_name} {item.department && `· ${item.department}`}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">🕐</span>
                <span>{new Date(item.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
              </div>
            </div>

            {/* action buttons */}
            <div className="detail-actions">
              {isOwner ? (
                <button className="btn btn-danger" onClick={handleDelete}>Delete Post</button>
              ) : isLoggedIn && item.status === 'active' ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowClaimForm(!showClaimForm)}
                >
                  {showClaimForm ? 'Cancel' : '🙋 Request to Claim'}
                </button>
              ) : !isLoggedIn ? (
                <Link to="/login" className="btn btn-primary">Login to Claim</Link>
              ) : null}
            </div>

            {/* claim form */}
            {showClaimForm && (
              <form onSubmit={handleClaim} className="claim-form">
                <h3>Send Claim Request</h3>
                <p>Describe why this item belongs to you so the poster can verify.</p>
                <div className="form-group">
                  <label>Your message</label>
                  <textarea
                    placeholder="E.g. I lost my blue Hydro Flask near the library on Monday. It has a sticker on it…"
                    value={claimMsg}
                    onChange={e => setClaimMsg(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={claimLoading}>
                  {claimLoading ? 'Sending…' : 'Send Claim Request'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* claim requests - only visible to item owner */}
        {isOwner && claims.length > 0 && (
          <div className="claims-section">
            <h2>Claim Requests ({claims.length})</h2>
            <div className="claims-list">
              {claims.map(claim => (
                <div key={claim.id} className="claim-card">
                  <div className="claim-header">
                    <div className="claim-user">
                      <div className="claim-avatar">{claim.claimant_name?.charAt(0)}</div>
                      <div>
                        <strong>{claim.claimant_name}</strong>
                        <span>{claim.claimant_email}</span>
                        {claim.claimant_department && <span>{claim.claimant_department}</span>}
                        {claim.claimant_contact && <span>📞 {claim.claimant_contact}</span>}
                      </div>
                    </div>
                    <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                  </div>

                  {claim.message && (
                    <p className="claim-message">"{claim.message}"</p>
                  )}

                  {claim.status === 'pending' && (
                    <div className="claim-btns">
                      <button
                        className="btn btn-success"
                        onClick={() => handleClaimAction(claim.id, 'approved')}
                      >✓ Approve</button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleClaimAction(claim.id, 'rejected')}
                      >✗ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
