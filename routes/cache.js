const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ GET /cache/:key — fetch from cache
router.get('/:key', async (req, res) => {
  const { key } = req.params;

  const { data, error } = await supabase
    .from('cache')
    .select('*')
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Cache GET error:', error);
    return res.status(500).json({ error: 'Cache lookup failed' });
  }

  // Check expiration
  const now = new Date();
  if (data && data.expires_at && new Date(data.expires_at) > now) {
    return res.json(data.value); // return cached data
  }

  res.status(404).json({ message: 'Cache miss or expired' });
});

// ✅ POST /cache — insert/update a cache value
router.post('/', async (req, res) => {
  const { key, value, ttl_seconds } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'Missing key or value' });
  }

  const expires_at = new Date(Date.now() + (ttl_seconds || 3600) * 1000); // default 1 hour

  const { data, error } = await supabase
    .from('cache')
    .upsert([{ key, value, expires_at }])
    .select();

  if (error) {
    console.error('Cache POST error:', error);
    return res.status(500).json({ error: 'Failed to write to cache' });
  }

  res.json({ message: 'Cached successfully', data });
});

// ✅ DELETE /cache/:key — remove from cache
router.delete('/:key', async (req, res) => {
  const { key } = req.params;

  const { data, error } = await supabase
    .from('cache')
    .delete()
    .eq('key', key);

  if (error) {
    console.error('Cache DELETE error:', error);
    return res.status(500).json({ error: 'Failed to delete cache' });
  }

  res.json({ message: 'Cache deleted', data });
});

module.exports = router;
