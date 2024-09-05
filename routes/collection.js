
const express = require('express');
const router = express.Router();
const {
  getSpectacles,
  getSpectacleById,
  addSpectacle,
  updateSpectacle,
  deleteSpectacle
} = require('../controllers/collection');

// Get all spectacles with filters
router.get('/spectacles', getSpectacles);

// Get a specific spectacle by ID
router.get('/spectacles/:id', getSpectacleById);

// Add a new spectacle
router.post('/spectacles', addSpectacle);

// Update a spectacle by ID
router.put('/spectacles/:id', updateSpectacle);

// Delete a spectacle by ID
router.delete('/spectacles/:id', deleteSpectacle);

module.exports = router;
