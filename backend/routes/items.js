const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// store uploaded images in the uploads folder with unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB per image
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, webp) are allowed'));
    }
  }
});

// get all items - supports filtering by type, category, and keyword search
router.get('/', async (req, res) => {
  const { type, category, search, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  let conditions = ["i.status = 'active'"];
  let params = [];
  let paramIndex = 1;

  if (type && (type === 'lost' || type === 'found')) {
    conditions.push(`i.type = $${paramIndex++}`);
    params.push(type);
  }

  if (category) {
    conditions.push(`i.category = $${paramIndex++}`);
    params.push(category);
  }

  if (search) {
    conditions.push(`(i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM items i ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT i.*, u.name as poster_name, u.department
       FROM items i
       JOIN users u ON i.user_id = u.id
       ${where}
       ORDER BY i.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      items: result.rows,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Fetch items error:', err.message);
    res.status(500).json({ message: 'Could not load items' });
  }
});

// get a single item by id with claim request count
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as poster_name, u.department, u.contact as poster_contact
       FROM items i
       JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch item details' });
  }
});

// post a new lost or found item
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, description, category, location, type } = req.body;

  if (!title || !type) {
    return res.status(400).json({ message: 'Title and type (lost/found) are required' });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO items (user_id, title, description, category, location, type, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title, description, category, location, type, imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create item error:', err.message);
    res.status(500).json({ message: 'Could not save the item' });
  }
});

// update an existing post - only the owner can do this
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, description, category, location, type, status } = req.body;

  try {
    const check = await pool.query('SELECT user_id FROM items WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

    if (check.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const result = await pool.query(
      `UPDATE items SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        location = COALESCE($4, location),
        type = COALESCE($5, type),
        status = COALESCE($6, status),
        image_url = COALESCE($7, image_url)
       WHERE id = $8 RETURNING *`,
      [title, description, category, location, type, status, imageUrl, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Could not update item' });
  }
});

// delete a post - owner or admin only
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const check = await pool.query('SELECT user_id FROM items WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

    if (check.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete item' });
  }
});

// get all items posted by the logged-in user
router.get('/user/my-posts', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch your posts' });
  }
});

module.exports = router;
