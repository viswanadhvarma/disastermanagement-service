const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/:id/verify-image', async (req, res) => {
  const { id } = req.params;
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      A disaster report image was uploaded with the following URL:
      ${image_url}
      
      Please analyze this image and briefly describe what kind of disaster it depicts
      (like flood, fire, building collapse, road damage, etc.).
      
      Only describe the visible content of the image.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Store in Supabase (optional, can log or return only)
    const { data, error } = await supabase
      .from('cache')
      .upsert({
        key: `verification:${id}`,
        value: { analysis: text, image_url },
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour cache
      });

    if (error) {
      console.error('Supabase error:', error.message);
    }

    res.json({ analysis: text });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: 'Failed to verify image with Gemini' });
  }
});

module.exports = router;
