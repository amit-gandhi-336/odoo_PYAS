const express = require('express');
const router = express.Router();
const { 
    createOperation, 
    getOperations, 
    getOperationById, 
    updateOperation, 
    validateOperation 
} = require('../controllers/operationController');


router.route('/')
    .get(getOperations) // Fetch list (with filters like ?type=RECEIPT)
    .post(createOperation); // Create new operation (Draft)


router.route('/:id')
    .get(getOperationById) // Fetch single operation details
    .put(updateOperation); // Update operation (Edit Draft)

router.route('/:id/validate')
    .put(validateOperation); 

module.exports = router;