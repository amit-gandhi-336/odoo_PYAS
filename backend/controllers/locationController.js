const Location = require('../models/Location');

// @desc    Get All Locations
// @route   GET /api/locations
exports.getLocations = async (req, res) => {
  try {
    // Supports filtering by Type (e.g. ?type=WAREHOUSE)
    const { type } = req.query;
    const query = type ? { type } : {};
    
    const locations = await Location.find(query)
      .populate('parentLocation', 'name') // Show parent name if it's a shelf
      .sort({ createdAt: -1 });

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a Location
// @route   POST /api/locations
exports.createLocation = async (req, res) => {
  try {
    const { name, shortCode, type, address, parentLocation } = req.body;

    const location = await Location.create({
      name,
      shortCode,
      type,
      address,
      parentLocation: parentLocation || null
    });

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Location
// @route   PUT /api/locations/:id
exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (location) {
      location.name = req.body.name || location.name;
      location.address = req.body.address || location.address;
      
      const updatedLocation = await location.save();
      res.json(updatedLocation);
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};