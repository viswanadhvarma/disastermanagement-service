const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


/// ✅ POST /official-updates — Create a new official update
router.post('/', async (req, res) => {
  const { disaster_id, message } = req.body;

  if (!disaster_id || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('official_updates')
    .insert([{ disaster_id, message }])
    .select();

  if (error) {
    console.error('Insert Error:', error);
    return res.status(500).json({ error: 'Failed to insert update' });
  }

  res.status(201).json(data[0]);
});


/// ✅ GET /official-updates — Fetch all official updates
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('official_updates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ error: 'Failed to fetch updates' });
  }

  res.json(data);
});


/// ✅ GET /official-updates/:disaster_id — Get updates for a specific disaster
router.get('/:disaster_id', async (req, res) => {
  const { disaster_id } = req.params;

  const { data, error } = await supabase
    .from('official_updates')
    .select('*')
    .eq('disaster_id', disaster_id);

  if (error) {
    console.error('Fetch by Disaster ID Error:', error);
    return res.status(500).json({ error: 'Failed to fetch updates for disaster' });
  }

  res.json(data);
});


/// ✅ PUT /official-updates/:id — Update an official update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const { data, error } = await supabase
    .from('official_updates')
    .update({ message })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Update Error:', error);
    return res.status(500).json({ error: 'Failed to update message' });
  }

  res.json(data[0]);
});


/// ✅ DELETE /official-updates/:id — Delete an update
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('official_updates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ error: 'Failed to delete message' });
  }

  res.json({ message: 'Official update deleted', data });
});

module.exports = router;
