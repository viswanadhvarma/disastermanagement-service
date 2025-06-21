// const express = require('express');
// const router = express.Router();
// require('dotenv').config();
// const axios = require('axios');

// // Function to build prompt for Gemini
// const createGeminiPrompt = (desc) => {
//   return `Extract the location name from this disaster description: "${desc}". Only return the location name, nothing else.`;
// };

// //Main route
// router.post('/', async (req, res) => {
//   const { description } = req.body;

//   if (!description) return res.status(400).json({ error: 'Description required' });

//   try {
//     // Step 1: Send description to Gemini
//     const prompt = createGeminiPrompt(description);

//     const geminiRes = await axios.post(
//    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//   {
//     contents: [
//       {
//         parts: [
//           {
//             text: `Extract location from: ${description}`,
//           },
//         ],
//       },
//     ],
//   }
// );


//     const location_name = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

//     if (!location_name) return res.status(500).json({ error: 'No location extracted from Gemini' });

//     // Step 2: Send location to Google Maps for lat/lng
//     const mapsRes = await axios.get(
//       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location_name)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
//     );

//     const coords = mapsRes.data.results?.[0]?.geometry?.location;

//     if (!coords) return res.status(500).json({ error: 'No coordinates found for location' });

//     res.json({
//       location_name,
//       lat: coords.lat,
//       lng: coords.lng
//     });

//   } catch (err) {
//     console.error('Geocode error:', err.message);
//     res.status(500).json({ error: 'Failed to extract or geocode location' });
//   }
// });


// // router.post('/', async (req, res) => {
// //   const { description } = req.body;

// //   if (!description) {
// //     return res.status(400).json({ error: 'Description is required' });
// //   }

// //   // You can optionally log incoming data for debugging
// //   console.log('Mock Geocode input:', description);

// //   // Mock response simulating successful geocoding
// //   res.json({
// //     location_name: "Kakinada, Andhra Pradesh",
// //     lat: 16.9891,
// //     lng: 82.2475
// //   });
// // });
// module.exports = router;




const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// POST /geocode
router.post('/', async (req, res) => {
  const { location_name } = req.body;

  if (!location_name) {
    return res.status(400).json({ error: 'Missing location_name in request body' });
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: location_name,
        key: process.env.GOOGLE_MAPS_API_KEY,
      }
    });

    // ✅ Log the full API response to debug
    console.log('🌐 Google Maps API Response:', response.data);

    if (response.data.status !== 'OK') {
      console.error('❌ Geocode failure:', response.data.status);
      return res.status(500).json({ error: 'Failed to geocode location' });
    }

    const location = response.data.results[0].geometry.location;

    res.json({
      location_name,
      latitude: location.lat,
      longitude: location.lng
    });

  } catch (error) {
    console.error('🌐 Geocode error:', error.message);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

module.exports = router;
