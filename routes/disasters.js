const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ GET /disasters or /disasters?tag=flood
router.get('/', async (req, res) => {
  const { tag } = req.query;

  try {
    let query = supabase.from('disasters').select('*');

    if (tag) {
      query = query.contains('tags', [tag]); // filter by tag if provided
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch disasters' });
    }

    res.json(data);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error while fetching disasters' });
  }
});


// ✅ POST /disasters — Create a disaster and emit event
router.post('/', async (req, res) => {
  const { title, location_name, description, tags, owner_id } = req.body;

  const { data, error } = await supabase
    .from('disasters')
    .insert([{
      title,
      location_name,
      description,
      tags,
      owner_id,
      audit_trail: [{
        action: 'create',
        user_id: owner_id,
        timestamp: new Date().toISOString()
      }]
    }])
    .select();

  if (error) {
    console.error('Insert Error:', error);
    return res.status(500).json({ error });
  }

  // Emit event to all connected clients
  const io = req.app.get('io');
  io.emit('disaster_created', data[0]);

  res.json(data[0]);
});


// ✅ PUT /disasters/:id — Update and emit event
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, owner_id } = req.body;

  const { data, error } = await supabase
    .from('disasters')
    .update({
      title,
      description,
      tags,
      audit_trail: [{
        action: 'update',
        user_id: owner_id,
        timestamp: new Date().toISOString()
      }]
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Update error:', error);
    return res.status(500).json({ error });
  }

  // Emit event
  const io = req.app.get('io');
  io.emit('disaster_updated', data[0]);

  res.json(data[0]);
});


// ✅ DELETE /disasters/:id — Delete and emit event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('disasters')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error });
  }

  // Emit event
  const io = req.app.get('io');
  io.emit('disaster_deleted', id);

  res.json({ message: 'Disaster deleted', data });
});

module.exports = router;
