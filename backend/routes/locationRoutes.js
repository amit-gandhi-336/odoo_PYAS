const express = require('express');
const router = express.Router();
const { 
  getLocations, 
  createLocation, 
  updateLocation 
} = require('../controllers/locationController');

router.route('/')
  .get(getLocations)
  .post(createLocation);

router.route('/:id')
  .put(updateLocation);

module.exports = router;