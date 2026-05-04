import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import './PostItem.css';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Accessories', 'Keys', 'Bags', 'ID/Cards', 'Sports', 'Other'];

const PostItem = () => {
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', type: 'lost'
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append('image', image);

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Item posted successfully!');
      navigate(`/items/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-page">
      <div className="container">
        <div className="page-header">
          <h1>Post an Item</h1>
          <p>Fill in the details below to report a lost or found item</p>
        </div>

        <div className="post-layout">
          <form onSubmit={handleSubmit} className="post-form">
            {/* lost or found toggle */}
            <div className="type-toggle">
              <button
                type="button"
                className={`toggle-btn ${form.type === 'lost' ? 'active-lost' : ''}`}
                onClick={() => setForm({ ...form, type: 'lost' })}
              >😔 I Lost Something</button>
              <button
                type="button"
                className={`toggle-btn ${form.type === 'found' ? 'active-found' : ''}`}
                onClick={() => setForm({ ...form, type: 'found' })}
              >🎉 I Found Something</button>
            </div>

            <div className="form-group">
              <label>Item Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Blue Water Bottle, iPhone 13, Student ID"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe the item - color, size, brand, any identifying marks..."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Library, Cafeteria, Block B"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* image upload */}
            <div className="form-group">
              <label>Upload Photo (optional)</label>
              <div className="image-upload-area" onClick={() => document.getElementById('img-input').click()}>
                {preview ? (
                  <img src={preview} alt="preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>Click to upload an image</span>
                    <span className="upload-hint">JPG, PNG or WEBP — max 5MB</span>
                  </div>
                )}
              </div>
              <input
                id="img-input"
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ display: 'none' }}
              />
              {preview && (
                <button type="button" className="btn btn-ghost" style={{ marginTop: 8, fontSize: 13 }}
                  onClick={() => { setImage(null); setPreview(null); }}>
                  Remove image
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary post-submit" disabled={loading}>
              {loading ? 'Posting…' : `Post ${form.type === 'lost' ? 'Lost' : 'Found'} Item`}
            </button>
          </form>

          {/* tips panel */}
          <aside className="post-tips">
            <h3>📌 Tips for a good post</h3>
            <ul>
              <li>Be specific about the item's color, brand, and size</li>
              <li>Mention exactly where it was lost or found</li>
              <li>Upload a clear photo if you have one</li>
              <li>Include your contact info in your profile</li>
              <li>Check back often - claimants can message you</li>
            </ul>

            <div className="tips-note">
              <strong>Privacy reminder:</strong> Your contact details are only shared when you approve a claim request.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
