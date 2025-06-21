// routes/social.js
const express = require('express');
const router = express.Router();

let mockSocialPosts = []; // in-memory store (or later from DB)

module.exports = (io) => {
  // GET /social - get all social updates
  router.get('/', (req, res) => {
    res.json(mockSocialPosts);
  });

  // POST /social - simulate adding a social media update
  router.post('/', (req, res) => {
    const { content, user, disaster_id } = req.body;
    const newPost = {
      id: Date.now().toString(),
      content,
      user,
      disaster_id,
      timestamp: new Date().toISOString(),
      status: 'unverified',
    };

    mockSocialPosts.push(newPost);
    io.emit('social_media_updated', newPost);
    res.json(newPost);
  });

  // PUT /social/:id - verify or flag
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const post = mockSocialPosts.find(p => p.id === id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.status = status;
    io.emit('social_media_updated', post);
    res.json(post);
  });

  return router;
};
