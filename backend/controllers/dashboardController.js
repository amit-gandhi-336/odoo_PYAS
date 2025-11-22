const Product = require('../models/Product');
const Operation = require('../models/Operation');

// @desc    Get Dashboard KPI Stats
// @route   GET /api/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. PRODUCT STATS
    // Count total products
    const totalProducts = await Product.countDocuments();
    
    // Count low stock items (where totalStock < minStock)
    // Note: This relies on totalStock being updated by your OperationController
    const lowStockCount = await Product.countDocuments({ 
      $expr: { $lt: ["$totalStock", "$minStock"] } 
    });

    // 2. OPERATION STATS (The "Late" vs "Future" logic)
    const today = new Date();

    // Helper to build queries
    const getOperationStats = async (type) => {
      // Base query for ACTIVE tasks (Not Done/Cancelled)
      const baseQuery = { 
        type, 
        status: { $nin: ['DONE', 'CANCELLED'] } 
      };

      // "Late" = Active AND Schedule Date is in the past
      const lateCount = await Operation.countDocuments({
        ...baseQuery,
        scheduleDate: { $lt: today }
      });

      // "Operations" (Future/Today) = Active AND Schedule Date is Today or Future
      const futureCount = await Operation.countDocuments({
        ...baseQuery,
        scheduleDate: { $gte: today }
      });

      // "Waiting" = Specifically waiting for stock (Mostly for Deliveries)
      const waitingCount = await Operation.countDocuments({
        type,
        status: 'WAITING'
      });

      // "To Do" (The Big Number) = Total Active
      const toDoCount = await Operation.countDocuments(baseQuery);

      return {
        toDo: toDoCount,
        late: lateCount,
        operations: futureCount,
        waiting: waitingCount
      };
    };

    // Execute queries in parallel for speed
    const [receiptStats, deliveryStats] = await Promise.all([
      getOperationStats('RECEIPT'),
      getOperationStats('DELIVERY')
    ]);

    // 3. SEND RESPONSE
    res.json({
      inventory: {
        totalProducts,
        lowStock: lowStockCount
      },
      receipts: {
        toReceive: receiptStats.toDo,
        late: receiptStats.late,
        operations: receiptStats.operations
      },
      deliveries: {
        toDeliver: deliveryStats.toDo,
        late: deliveryStats.late,
        waiting: deliveryStats.waiting,
        operations: deliveryStats.operations
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};