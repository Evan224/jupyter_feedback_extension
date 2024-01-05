const db = require('../models');
const ensureUserExists = require('./ensureUserExists');
const { generateMockComments } = require('./utils');

exports.createComment = async (req, res) => {
    try {
        await ensureUserExists(req.body.user_id);
        const comment = await db.Comment.create(req.body);
        res.json(comment);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
};

exports.getAllComments = async (req, res) => {
    try {
        const comments = await db.Comment.findAll();
        res.json(comments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCommentById = async (req, res) => {
    try {
        const comment = await db.Comment.findByPk(req.params.id);
        if (comment) {
            res.json(comment);
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const comment = await db.Comment.findByPk(req.params.id);
        if (comment) {
            await comment.update(req.body);
            res.json(comment);
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await db.Comment.findByPk(req.params.id);
        if (comment) {
            await comment.destroy();
            res.json({ message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.generateMockData = async (req, res) => {
    try {
        const { comments } = generateMockComments();
        for (let comment of comments) {
            await db.Comment.create(comment);
        }
        res.json({ message: 'Mock data generated successfully' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};