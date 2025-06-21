const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ POST /reports — Create a report
router.post('/', async (req, res) => {
  const { disaster_id, user_id, content, image_url, verification_status } = req.body;

  if (!disaster_id || !user_id || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('reports')
    .insert([{
      disaster_id,
      user_id,
      content,
      image_url: image_url || null,
      verification_status: verification_status || 'pending'
    }])
    .select();

  if (error) {
    console.error('Insert Error:', error.message);
    return res.status(500).json({ error: 'Failed to create report' });
  }

  res.json(data[0]);
});

// ✅ GET /reports — Fetch all reports
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch All Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch all reports' });
  }

  res.json(data);
});


// ✅ GET /reports/:disaster_id — Fetch reports for a disaster
router.get('/:disaster_id', async (req, res) => {
  const { disaster_id } = req.params;

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('disaster_id', disaster_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }

  res.json(data);
});

// ✅ PUT /reports/:id — Update verification status or content
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content, verification_status } = req.body;

  const updateData = {};
  if (content !== undefined) updateData.content = content;
  if (verification_status !== undefined) updateData.verification_status = verification_status;

  const { data, error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Update Error:', error.message);
    return res.status(500).json({ error: 'Failed to update report' });
  }

  res.json(data[0]);
});

// ✅ DELETE /reports/:id — Delete a report
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete Error:', error.message);
    return res.status(500).json({ error: 'Failed to delete report' });
  }

  res.json({ message: 'Report deleted', data });
});

module.exports = router;
