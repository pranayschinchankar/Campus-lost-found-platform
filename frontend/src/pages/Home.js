import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ItemCard from '../components/ItemCard';
import './Home.css';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, resolved: 0 });

  useEffect(() => {
    // grab the 6 most recent posts for the homepage preview
    api.get('/items?limit=6').then(res => {
      setRecentItems(res.data.items || []);
    }).catch(() => {});

    // fetch some quick stats to show on the hero section
    Promise.all([
      api.get('/items?type=lost&limit=1'),
      api.get('/items?type=found&limit=1'),
    ]).then(([lostRes, foundRes]) => {
      setStats({
        lost: lostRes.data.total || 0,
        found: foundRes.data.total || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="home">
      {/* hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob b1" />
          <div className="hero-blob b2" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">🎓 Campus Lost & Found</div>
          <h1 className="hero-title">
            Lost something?<br />
            <span className="accent">We'll help you find it.</span>
          </h1>
          <p className="hero-sub">
            The easiest way to report lost items and reunite them with their owners on campus. 
            Post in seconds, find in minutes.
          </p>
          <div className="hero-actions">
            <Link to="/post-item" className="btn btn-primary btn-lg">Report an Item</Link>
            <Link to="/browse" className="btn btn-outline btn-lg">Browse Posts</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">{stats.lost}</span><span className="stat-label">Lost Reports</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">{stats.found}</span><span className="stat-label">Found Items</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">Fast</span><span className="stat-label">Response Time</span></div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps grid-3">
            <div className="step">
              <div className="step-icon">📝</div>
              <h3>Post Your Item</h3>
              <p>Fill in a quick description, add a photo, and mark it as lost or found. Takes less than a minute.</p>
            </div>
            <div className="step">
              <div className="step-icon">🔍</div>
              <h3>Browse & Search</h3>
              <p>Search through all active posts by keyword or category to find what you're looking for.</p>
            </div>
            <div className="step">
              <div className="step-icon">🤝</div>
              <h3>Connect & Claim</h3>
              <p>Send a claim request to the poster and get your item back. Simple, safe, and straightforward.</p>
            </div>
          </div>
        </div>
      </section>

      {/* recent posts */}
      {recentItems.length > 0 && (
        <section className="recent-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Recent Posts</h2>
              <Link to="/browse" className="btn btn-ghost">View all →</Link>
            </div>
            <div className="grid-3">
              {recentItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* cta */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to get started?</h2>
            <p>Join your campus community and help reunite lost items with their owners.</p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
              <Link to="/browse" className="btn btn-outline btn-lg">Browse Items</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
