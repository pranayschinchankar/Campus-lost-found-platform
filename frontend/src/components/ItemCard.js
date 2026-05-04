import React from 'react';
import { Link } from 'react-router-dom';
import './ItemCard.css';

// format how long ago something was posted - keeps things friendly
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const ItemCard = ({ item, onDelete, showActions }) => {
  const imgSrc = item.image_url
    ? `http://localhost:5000${item.image_url}`
    : null;

  return (
    <div className="item-card card">
      <Link to={`/items/${item.id}`} className="item-image-wrap">
        {imgSrc ? (
          <img src={imgSrc} alt={item.title} className="item-image" />
        ) : (
          <div className="item-no-image">
            <span>{item.type === 'lost' ? '😔' : '🎉'}</span>
          </div>
        )}
        <span className={`badge badge-${item.type} item-type-badge`}>
          {item.type === 'lost' ? '● Lost' : '● Found'}
        </span>
        {item.status === 'resolved' && (
          <span className="badge badge-resolved item-resolved-badge">Resolved</span>
        )}
      </Link>

      <div className="item-body">
        <h3 className="item-title">
          <Link to={`/items/${item.id}`}>{item.title}</Link>
        </h3>

        {item.category && (
          <span className="item-category">{item.category}</span>
        )}

        {item.description && (
          <p className="item-desc">{item.description.slice(0, 100)}{item.description.length > 100 ? '…' : ''}</p>
        )}

        <div className="item-meta">
          {item.location && (
            <span className="meta-chip">📍 {item.location}</span>
          )}
          <span className="meta-chip">🕐 {timeAgo(item.created_at)}</span>
        </div>

        {item.poster_name && (
          <p className="item-poster">By {item.poster_name}</p>
        )}

        {showActions && onDelete && (
          <div className="item-actions">
            <button
              onClick={() => onDelete(item.id)}
              className="btn btn-danger"
              style={{ fontSize: 13, padding: '6px 14px' }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
