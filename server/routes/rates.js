// File: routes/rates.js

const express = require('express');
const router = express.Router();
const ratesController = require('../controllers/ratesController');

router.post('/', ratesController.createRate);
router.get('/', ratesController.getAllRates);
router.get('/:id', ratesController.getRateById);
router.put('/:id', ratesController.updateRate);
router.delete('/:id', ratesController.deleteRate);

module.exports = router;