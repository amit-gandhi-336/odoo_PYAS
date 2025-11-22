const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // <--- Importing bcrypt

// Import Models
const User = require('./models/User');
const Location = require('./models/Location');
const Product = require('./models/Product');
const Stock = require('./models/Stock');
const Operation = require('./models/Operation');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌱 MongoDB Connected...');

    // 1. CLEAR OLD DATA
    await User.deleteMany({});
    await Location.deleteMany({});
    await Product.deleteMany({});
    await Stock.deleteMany({});
    await Operation.deleteMany({});
    console.log('🧹 Old data cleared.');

    // 2. CREATE USERS (With Hashed Password)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password@123", salt); // <--- HASHING HERE

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@stockmaster.com",
      password: hashedPassword, // <--- Storing the Hash
      loginId: "admin123",
      role: "MANAGER"
    });
    console.log('👤 User created: admin123 / Password@123');

    // 3. CREATE LOCATIONS
    const mainWarehouse = await Location.create({
      name: "Main Warehouse",
      shortCode: "WH",
      type: "WAREHOUSE",
      address: "123 Stock St, Mumbai"
    });

    const vendor = await Location.create({
      name: "Azure Interior",
      shortCode: "VND",
      type: "VENDOR",
      address: "Industrial Estate"
    });

    const customer = await Location.create({
      name: "Local Client",
      shortCode: "CUST",
      type: "CUSTOMER",
      address: "Downtown"
    });
    console.log('KV Locations created.');

    // 4. CREATE PRODUCTS
    const desk = await Product.create({
      name: "Office Desk",
      sku: "DESK001",
      category: "Furniture",
      price: 3000,
      minStock: 5,
      unit: "pcs"
    });

    const chair = await Product.create({
      name: "Ergo Chair",
      sku: "CHR001",
      category: "Furniture",
      price: 1500,
      minStock: 10,
      unit: "pcs"
    });
    console.log('📦 Products created.');

    // 5. CREATE INITIAL STOCK
    await Stock.create({
      product: desk._id,
      location: mainWarehouse._id,
      quantity: 50
    });
    
    desk.totalStock = 50;
    await desk.save();
    console.log('📊 Initial Stock set.');

    // 6. CREATE HISTORY
    await Operation.create({
      reference: "WH/IN/0001",
      type: "RECEIPT",
      status: "DONE",
      scheduleDate: new Date(),
      sourceLocation: vendor._id,
      destinationLocation: mainWarehouse._id,
      contact: vendor.name,
      responsible: adminUser.name,
      items: [{ product: desk._id, quantity: 50 }]
    });
    console.log('📜 History seeded.');

    console.log('✅ SEEDING COMPLETE!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();