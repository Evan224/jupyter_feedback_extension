const db = require('../models');
const ensureUserExists = require('./ensureUserExists');

exports.createEvent = async (req, res) => {
    try {
        // Add a timestamp to the event data
        req.body.timestamp = new Date().toISOString();
        await ensureUserExists(req.body.user_id);

        const event = await db.Event.create(req.body);
        res.json(event);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};


exports.getAllEvents = async (req, res) => {
    try {
        const events = await db.Event.findAll();
        res.json(events);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
