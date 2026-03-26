require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const pool    = require('./Db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /notes — return all notes, newest first
app.get('/notes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, content, created_at AS "createdAt" FROM notes ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /notes error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

// POST /notes — create a new note
app.post('/notes', async (req, res) => {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'Field "content" is required and must be a non-empty string.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO notes (content) VALUES ($1) RETURNING id, content, created_at AS "createdAt"',
      [content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /notes error:', err.message);
    res.status(500).json({ error: 'Failed to create note.' });
  }
});

// DELETE /notes/:id — delete a note by id
app.delete('/notes/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid note ID.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({ message: `Note ${id} deleted.` });
  } catch (err) {
    console.error('DELETE /notes/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Notes API running on http://localhost:${PORT}`);
});