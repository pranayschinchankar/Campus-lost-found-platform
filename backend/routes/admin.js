const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// all admin routes require both auth and admin role
router.use(authMiddleware, adminMiddleware);

// dashboard summary - quick stats for the admin overview
router.get('/stats', async (req, res) => {
  try {
    const [users, items, claims, resolved] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE role != $1', ['admin']),
      pool.query("SELECT COUNT(*) FROM items WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) FROM claim_requests WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM items WHERE status = 'resolved'")
    ]);

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      activeItems: parseInt(items.rows[0].count),
      pendingClaims: parseInt(claims.rows[0].count),
      resolvedItems: parseInt(resolved.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load stats' });
  }
});

// list all users (excluding other admins)
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, department, contact, role, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Could not load users' });
  }
});

// remove a user from the platform
router.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete user' });
  }
});

// get all items for admin review
router.get('/items', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as poster_name, u.email as poster_email
       FROM items i
       JOIN users u ON i.user_id = u.id
       ORDER BY i.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Could not load items' });
  }
});

// remove an inappropriate or duplicate item post
router.delete('/items/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete item' });
  }
});

// promote a user to admin (careful with this one)
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Could not update role' });
  }
});

module.exports = router;
