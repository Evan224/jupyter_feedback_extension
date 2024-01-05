// File: controllers/ratesController.js

const db = require('../models');

exports.createRate = async (req, res) => {
    try {
        const rate = await db.Rate.create(req.body);
        res.json(rate);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
};

exports.getAllRates = async (req, res) => {
    try {
        const rates = await db.Rate.findAll();
        res.json(rates);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getRateById = async (req, res) => {
    try {
        const rate = await db.Rate.findByPk(req.params.id);
        if (rate) {
            res.json(rate);
        } else {
            res.status(404).json({ error: 'Rate not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateRate = async (req, res) => {
    try {
        const rate = await db.Rate.findByPk(req.params.id);
        if (rate) {
            await rate.update(req.body);
            res.json(rate);
        } else {
            res.status(404).json({ error: 'Rate not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteRate = async (req, res) => {
    try {
        const rate = await db.Rate.findByPk(req.params.id);
        if (rate) {
            await rate.destroy();
            res.json({ message: 'Rate deleted successfully' });
        } else {
            res.status(404).json({ error: 'Rate not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
