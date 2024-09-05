const Spectacle = require('../models/collection');

// Get all spectacles with optional filters
const getSpectacles = async (req, res) => {
  try {
    const { gender, price, category } = req.query;

    const filters = {};

    if (gender) filters.gender = gender;
    if (category) filters.category = category;

    if (price) {
      const priceRange = price.split('-');
      filters.price = {
        $gte: parseInt(priceRange[0]),
        $lte: priceRange[1] === '+' ? Number.MAX_SAFE_INTEGER : parseInt(priceRange[1]),
      };
    }

    const spectacles = await Spectacle.find(filters);

    res.status(200).json(spectacles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific spectacle by ID
const getSpectacleById = async (req, res) => {
  try {
    const { id } = req.params;
    const spectacle = await Spectacle.findById(id);

    if (!spectacle) return res.status(404).json({ message: 'Spectacle not found' });

    res.status(200).json(spectacle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new spectacle
const addSpectacle = async (req, res) => {
  try {
    // Destructure the data from the request body
    const {gender, price, category, image, description, stock } = req.body;

    // Validate required fields
    if (!gender || !price || !category || !image) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create a new spectacle instance
    const newSpectacle = new Spectacle({
   
      gender,
      price,
      category,
      image,
      description,
      stock,
    });

    // Save the new spectacle to the database
    await newSpectacle.save();

    // Send response with the newly created spectacle
    res.status(201).json(newSpectacle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a spectacle by ID
const updateSpectacle = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSpectacle = await Spectacle.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedSpectacle) return res.status(404).json({ message: 'Spectacle not found' });

    res.status(200).json(updatedSpectacle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a spectacle by ID
const deleteSpectacle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSpectacle = await Spectacle.findByIdAndDelete(id);

    if (!deletedSpectacle) return res.status(404).json({ message: 'Spectacle not found' });

    res.status(200).json({ message: 'Spectacle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSpectacles,
  getSpectacleById,
  addSpectacle,
  updateSpectacle,
  deleteSpectacle,
};
