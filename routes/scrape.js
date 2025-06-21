const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Example scraping NDMA press releases
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://ndma.gov.in/en/');
    const $ = cheerio.load(response.data);

    const updates = [];

    // Adjust selectors based on real HTML
    $('a').each((i, el) => {
      const title = $(el).text().trim();
      const url = $(el).attr('href');
      if (title && url && url.includes('.pdf')) {
        updates.push({ title, url });
      }
    });

    res.json({ updates });
  } catch (err) {
    console.error('Scrape error:', err.message);
    res.status(500).json({ error: 'Scrape error: ' + err.message });
  }
});

module.exports = router;
