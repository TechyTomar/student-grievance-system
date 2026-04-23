const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const authMiddleware = require('../middleware/auth');

// Protect ALL grievance routes
router.use(authMiddleware);

// ─────────────────────────────────────────────────────────
// GET /api/grievances/search?title=xyz
// IMPORTANT: must be declared BEFORE /:id
// ─────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { title } = req.query;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Search query "title" is required.' });
    }

    const grievances = await Grievance.find({
      student: req.studentId,
      title: { $regex: title.trim(), $options: 'i' },
    }).sort({ createdAt: -1 });

    res.json({ grievances });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/grievances  →  Submit a new grievance
// ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const grievance = new Grievance({
      title,
      description,
      category,
      student: req.studentId,
    });

    await grievance.save();

    res.status(201).json({ message: 'Grievance submitted successfully.', grievance });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/grievances  →  View all grievances (logged-in student)
// ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const grievances = await Grievance.find({ student: req.studentId }).sort({ createdAt: -1 });
    res.json({ grievances });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/grievances/:id  →  View single grievance by ID
// ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found.' });
    }
    if (grievance.student.toString() !== req.studentId) {
      return res.status(403).json({ message: 'Unauthorized. Access denied.' });
    }

    res.json({ grievance });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID.' });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/grievances/:id  →  Update grievance
// ─────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found.' });
    }
    if (grievance.student.toString() !== req.studentId) {
      return res.status(403).json({ message: 'Unauthorized. Access denied.' });
    }

    const { title, description, category, status } = req.body;

    if (title !== undefined)       grievance.title       = title;
    if (description !== undefined) grievance.description = description;
    if (category !== undefined)    grievance.category    = category;
    if (status !== undefined)      grievance.status      = status;

    await grievance.save();

    res.json({ message: 'Grievance updated successfully.', grievance });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID.' });
    }
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/grievances/:id  →  Delete grievance
// ─────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found.' });
    }
    if (grievance.student.toString() !== req.studentId) {
      return res.status(403).json({ message: 'Unauthorized. Access denied.' });
    }

    await grievance.deleteOne();

    res.json({ message: 'Grievance deleted successfully.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID.' });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
