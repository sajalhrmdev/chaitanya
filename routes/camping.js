const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============ CAMPING EVENTS ============

// GET all campings
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM campings ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE camping
router.post('/', async (req, res) => {
  try {
    const { camping_name, location, start_date, end_date, organizer_name, contact_details, participants_count, remarks, doctors } = req.body;
    const [result] = await db.execute(
      `INSERT INTO campings (camping_name, location, start_date, end_date, organizer_name, contact_details, participants_count, remarks, doctors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [camping_name, location || '', start_date, end_date, organizer_name, contact_details, participants_count || 0, remarks || '', doctors || '']
    );
    res.status(201).json({ id: result.insertId, message: 'Camping created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE camping
router.put('/:id', async (req, res) => {
  try {
    const { camping_name, location, start_date, end_date, organizer_name, contact_details, participants_count, remarks, doctors } = req.body;
    const [result] = await db.execute(
      `UPDATE campings SET camping_name=?, location=?, start_date=?, end_date=?, organizer_name=?, contact_details=?, participants_count=?, remarks=?, doctors=? WHERE id=?`,
      [camping_name, location || '', start_date, end_date, organizer_name, contact_details, participants_count || 0, remarks || '', doctors || '', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE camping
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM camping_leads WHERE camping_id = ?', [req.params.id]);
    const [result] = await db.execute('DELETE FROM campings WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ LEADS ============

// GET all leads (optional filter by camping_id)
router.get('/leads', async (req, res) => {
  try {
    const { camping_id } = req.query;
    let query = `SELECT cl.*, c.camping_name FROM camping_leads cl LEFT JOIN campings c ON cl.camping_id = c.id`;
    let params = [];

    if (camping_id) {
      query += ' WHERE cl.camping_id = ?';
      params.push(camping_id);
    }

    query += ' ORDER BY cl.id DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE lead
router.post('/leads', async (req, res) => {
  try {
    const { camping_id, patient_name, phone, email, age, interest, source, date } = req.body;
    const [result] = await db.execute(
      `INSERT INTO camping_leads (camping_id, patient_name, phone, email, age, interest, source, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [camping_id, patient_name, phone || '', email || '', age || '', interest || '', source || '', date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ id: result.insertId, message: 'Lead created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE lead
router.put('/leads/:id', async (req, res) => {
  try {
    const { camping_id, patient_name, phone, email, age, interest, source, date } = req.body;
    const [result] = await db.execute(
      `UPDATE camping_leads SET camping_id=?, patient_name=?, phone=?, email=?, age=?, interest=?, source=?, date=? WHERE id=?`,
      [camping_id, patient_name, phone || '', email || '', age || '', interest || '', source || '', date || '', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE lead
router.delete('/leads/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM camping_leads WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
