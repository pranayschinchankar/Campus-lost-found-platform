import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import './Admin.css';

const Admin = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, itemsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/items')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      toast.error('Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Remove user "${name}"? This will also delete all their posts.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User removed');
    } catch {
      toast.error('Could not remove user');
    }
  };

  const deleteItem = async (id, title) => {
    if (!window.confirm(`Remove post "${title}"?`)) return;
    try {
      await api.delete(`/admin/items/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Post removed');
    } catch {
      toast.error('Could not remove post');
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success('Role updated');
    } catch {
      toast.error('Could not update role');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1>🛡️ Admin Panel</h1>
          <p>Manage users, posts, and platform activity</p>
        </div>

        {/* tabs */}
        <div className="admin-tabs">
          {['overview', 'users', 'posts'].map(t => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : tab === 'overview' ? (
          <div className="admin-overview">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">👥</div>
                <div className="admin-stat-val">{stats.totalUsers}</div>
                <div className="admin-stat-label">Registered Students</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">📋</div>
                <div className="admin-stat-val">{stats.activeItems}</div>
                <div className="admin-stat-label">Active Posts</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">🙋</div>
                <div className="admin-stat-val">{stats.pendingClaims}</div>
                <div className="admin-stat-label">Pending Claims</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">✅</div>
                <div className="admin-stat-val">{stats.resolvedItems}</div>
                <div className="admin-stat-label">Items Resolved</div>
              </div>
            </div>

            <div className="admin-quick">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="quick-btn" onClick={() => setTab('users')}>Manage Users →</button>
                <button className="quick-btn" onClick={() => setTab('posts')}>Review Posts →</button>
              </div>
            </div>
          </div>
        ) : tab === 'users' ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td className="muted">{u.email}</td>
                    <td className="muted">{u.department || '—'}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-approved' : 'badge-pending'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => toggleRole(u)}>
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => deleteUser(u.id, u.name)}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Posted By</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td><span className={`badge badge-${item.type}`}>{item.type}</span></td>
                    <td className="muted">{item.category || '—'}</td>
                    <td className="muted">{item.poster_name}</td>
                    <td>
                      <span className={`badge badge-${item.status === 'active' ? 'found' : 'resolved'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="muted">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => deleteItem(item.id, item.title)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
