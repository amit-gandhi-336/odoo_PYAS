const express = require('express');
const router = express.Router();
const { 
    createOperation, 
    getOperations, 
    validateOperation 
} = require('../controllers/operationController');

router.route('/').get(getOperations).post(createOperation);
router.route('/:id/validate').put(validateOperation);

module.exports = router;