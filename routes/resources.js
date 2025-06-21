const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = (io) => {
  const router = express.Router();

  // ✅ GET all resources
  router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('resources').select('*');
    if (error) return res.status(500).json({ error });
    res.json(data);
  });

  // ✅ POST new resource
  router.post('/', async (req, res) => {
    const { disaster_id, name, type, location_name, latitude, longitude } = req.body;
    if (!disaster_id || !name || !type || !latitude || !longitude)
      return res.status(400).json({ error: 'Missing required fields' });

    const point = `POINT(${longitude} ${latitude})`;

    const { data, error } = await supabase
      .from('resources')
      .insert([{ disaster_id, name, type, location_name, location: point }])
      .select();

    if (error) return res.status(500).json({ error });

    io.emit('resources_updated', data[0]); // 🔁 emit event
    res.json(data[0]);
  });

  // ✅ PUT update resource
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location_name, location, type } = req.body;

    const { data, error } = await supabase
      .from('resources')
      .update({ name, location_name, location, type })
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ error });

    io.emit('resources_updated', data[0]); // 🔁 emit event
    res.json(data[0]);
  });

  // ✅ DELETE resource
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error });

    io.emit('resources_updated', { id, deleted: true }); // 🔁 emit event
    res.json({ message: 'Deleted successfully', data });
  });

  return router;
};
