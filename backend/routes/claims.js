const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// submit a claim request for an item
router.post('/:itemId', authMiddleware, async (req, res) => {
  const { message } = req.body;
  const itemId = req.params.itemId;

  try {
    // make sure the item actually exists and is still active
    const item = await pool.query(
      `SELECT * FROM items WHERE id = $1 AND status = 'active'`,
      [itemId]
    );

    if (item.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found or no longer available' });
    }

    // you can't claim your own post - that would be silly
    if (item.rows[0].user_id === req.user.id) {
      return res.status(400).json({ message: "You can't claim your own item" });
    }

    // prevent spamming - one active claim per user per item
    const alreadyClaimed = await pool.query(
      `SELECT id FROM claim_requests WHERE item_id = $1 AND claimant_id = $2 AND status = 'pending'`,
      [itemId, req.user.id]
    );

    if (alreadyClaimed.rows.length > 0) {
      return res.status(409).json({ message: 'You already have a pending claim on this item' });
    }

    const result = await pool.query(
      `INSERT INTO claim_requests (item_id, claimant_id, message)
       VALUES ($1, $2, $3) RETURNING *`,
      [itemId, req.user.id, message || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Claim error:', err.message);
    res.status(500).json({ message: 'Could not submit claim request' });
  }
});

// get all claim requests for an item - only the item owner can see these
router.get('/item/:itemId', authMiddleware, async (req, res) => {
  try {
    const item = await pool.query('SELECT user_id FROM items WHERE id = $1', [req.params.itemId]);

    if (item.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the item owner can view claim requests' });
    }

    const result = await pool.query(
      `SELECT cr.*, u.name as claimant_name, u.email as claimant_email,
              u.department as claimant_department, u.contact as claimant_contact
       FROM claim_requests cr
       JOIN users u ON cr.claimant_id = u.id
       WHERE cr.item_id = $1
       ORDER BY cr.created_at DESC`,
      [req.params.itemId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Could not load claim requests' });
  }
});

// approve or reject a claim request - item owner only
router.patch('/:claimId', authMiddleware, async (req, res) => {
  const { status } = req.body; // should be 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    // check who owns this claim's item
    const claim = await pool.query(
      `SELECT cr.*, i.user_id as item_owner_id
       FROM claim_requests cr
       JOIN items i ON cr.item_id = i.id
       WHERE cr.id = $1`,
      [req.params.claimId]
    );

    if (claim.rows.length === 0) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    if (claim.rows[0].item_owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the item owner can approve or reject claims' });
    }

    // update the claim status
    const updated = await pool.query(
      `UPDATE claim_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.claimId]
    );

    // if approved, mark the item as resolved so others stop claiming it
    if (status === 'approved') {
      await pool.query(
        `UPDATE items SET status = 'resolved' WHERE id = $1`,
        [claim.rows[0].item_id]
      );
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Approve/reject error:', err.message);
    res.status(500).json({ message: 'Could not update claim status' });
  }
});

// see all claim requests made by the logged-in user
router.get('/my-claims', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.*, i.title as item_title, i.type as item_type, i.image_url
       FROM claim_requests cr
       JOIN items i ON cr.item_id = i.id
       WHERE cr.claimant_id = $1
       ORDER BY cr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch your claims' });
  }
});

module.exports = router;
