const Operation = require('../models/Operation');
const Product = require('../models/Product');
const Stock = require('../models/Stock');

// @desc    Create a new Operation (Receipt/Delivery)
// @route   POST /api/operations
exports.createOperation = async (req, res) => {
  try {
    const { type, items, sourceLocation, destinationLocation, scheduleDate, contact, status } = req.body;

    // 1. GENERATE REFERENCE (WH/IN/0001 or WH/OUT/0001)
    const lastOp = await Operation.findOne({ type }).sort({ createdAt: -1 });
    
    let nextId = '0001';
    if (lastOp && lastOp.reference) {
      const parts = lastOp.reference.split('/'); 
      const lastNum = parseInt(parts[parts.length - 1]);
      nextId = (lastNum + 1).toString().padStart(4, '0');
    }

    let prefix = 'WH/OPS';
    if (type === 'RECEIPT') prefix = 'WH/IN';
    else if (type === 'DELIVERY') prefix = 'WH/OUT';
    else if (type === 'ADJUSTMENT') prefix = 'WH/ADJ';

    const reference = `${prefix}/${nextId}`;

    // 2. HANDLE STATUS LOGIC
    let finalStatus = status || 'DRAFT';

    // Optional: Auto-set to WAITING if stock is low for Deliveries
    if (type === 'DELIVERY' && finalStatus !== 'DRAFT') {
        for (const item of items) {
            const stock = await Stock.findOne({ product: item.product, location: sourceLocation });
            // If stock record doesn't exist OR quantity is less than requested
            if (!stock || stock.quantity < item.quantity) {
                finalStatus = 'WAITING'; 
            }
        }
    }

    // 3. CREATE OPERATION
    const operation = await Operation.create({
      reference,
      type,
      status: finalStatus,
      sourceLocation,
      destinationLocation,
      scheduleDate: scheduleDate || Date.now(),
      contact,
      items,
      responsible: 'Admin' // In a real app with auth middleware, use req.user.name
    });

    res.status(201).json(operation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Operations (List View)
// @route   GET /api/operations
exports.getOperations = async (req, res) => {
  try {
    const { type, status, search, _id } = req.query;
    let query = {};

    // Allow fetching single by query param if needed (though route param is better)
    if (_id) query._id = _id; 
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Search Logic
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }

    const operations = await Operation.find(query)
      .populate('items.product', 'name sku')
      .populate('sourceLocation', 'name')
      .populate('destinationLocation', 'name')
      .sort({ createdAt: -1 });

    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Operation by ID (For Edit Form)
// @route   GET /api/operations/:id
exports.getOperationById = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id)
      .populate('items.product', 'name sku')
      .populate('sourceLocation', 'name')
      .populate('destinationLocation', 'name');

    if (operation) {
      res.json(operation);
    } else {
      res.status(404).json({ message: 'Operation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Operation (Edit Draft)
// @route   PUT /api/operations/:id
exports.updateOperation = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id);

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    if (operation.status === 'DONE') {
      return res.status(400).json({ message: 'Cannot edit a DONE operation' });
    }

    // Update fields from request body
    operation.contact = req.body.contact || operation.contact;
    operation.scheduleDate = req.body.scheduleDate || operation.scheduleDate;
    operation.sourceLocation = req.body.sourceLocation || operation.sourceLocation;
    operation.destinationLocation = req.body.destinationLocation || operation.destinationLocation;
    operation.items = req.body.items || operation.items;
    
    // Allow updating status (e.g. Draft -> Ready)
    if (req.body.status) {
        operation.status = req.body.status;
    }

    const updatedOperation = await operation.save();
    res.json(updatedOperation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate Operation (The "DONE" Button)
// @route   PUT /api/operations/:id/validate
exports.validateOperation = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id);

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    if (operation.status === 'DONE') {
      return res.status(400).json({ message: 'Operation is already Validated' });
    }

    // 1. UPDATE STOCK LEVELS
    for (const item of operation.items) {
      let targetLocation = null;
      let quantityChange = 0;

      // LOGIC: Receipt adds to Dest, Delivery removes from Source
      if (operation.type === 'RECEIPT') {
        targetLocation = operation.destinationLocation;
        quantityChange = item.quantity;
      } else if (operation.type === 'DELIVERY') {
        targetLocation = operation.sourceLocation;
        quantityChange = -item.quantity;
      }

      if (targetLocation) {
        // Find existing stock record or create one
        let stock = await Stock.findOne({ 
          product: item.product, 
          location: targetLocation 
        });

        if (!stock) {
            stock = new Stock({ 
                product: item.product, 
                location: targetLocation, 
                quantity: 0 
            });
        }

        // Check for negative stock (Prevent shipping what you don't have)
        if (stock.quantity + quantityChange < 0) {
            return res.status(400).json({ 
                message: `Insufficient stock for product ID: ${item.product}` 
            });
        }

        stock.quantity += quantityChange;
        await stock.save();
        
        // Also update the global "On Hand" cache in Product model
        const product = await Product.findById(item.product);
        if(product) {
            product.totalStock = (product.totalStock || 0) + quantityChange;
            await product.save();
        }
      }
    }

    // 2. UPDATE STATUS
    operation.status = 'DONE';
    await operation.save();

    res.json({ message: 'Operation Validated & Stock Updated', operation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};