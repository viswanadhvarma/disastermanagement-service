// routes/extract-location.js
const express = require('express');
const router = express.Router();
const { analyzeText, analyzeImage } = require('../helpers/gemini');

// ✅ POST /extract-location
router.post('/', async (req, res) => {
  const { content, image_url } = req.body;

  if (!content && !image_url) {
    return res.status(400).json({ error: 'Please provide either content or image_url' });
  }

  try {
    const analysis = content
      ? await analyzeText(content)
      : await analyzeImage(image_url);

    res.json({ analysis });
  } catch (err) {
    console.error('Gemini Analysis Error:', err.message);
    res.status(500).json({ error: 'Gemini analysis failed' });
  }
});

module.exports = router;
