// helpers/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ✅ Analyze text (e.g., extract location from text)
async function analyzeText(prompt) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// ✅ Analyze image (e.g., describe or verify the image)
async function analyzeImage(imageUrl) {
  const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await visionModel.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: await fetchImageAsBase64(imageUrl),
      }
    },
    "Describe what’s happening in this image"
  ]);

  const response = await result.response;
  return response.text();
}

// Helper: Download and encode image as base64
async function fetchImageAsBase64(imageUrl) {
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

module.exports = { analyzeText, analyzeImage };
