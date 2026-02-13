const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/tasks
router.get('/', async (req, res) => {
    try {
        const { status, priority, search, sortBy, order } = req.query;
        const query = { user: req.user._id };

        if (status && status !== 'All') {
            query.status = status;
        }
        if (priority && priority !== 'All') {
            query.priority = priority;
        }
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        let sortObj = { createdAt: -1 };
        if (sortBy) {
            const sortOrder = order === 'asc' ? 1 : -1;
            if (sortBy === 'dueDate') sortObj = { dueDate: sortOrder };
            else if (sortBy === 'priority') {
                // Custom sort: High=3, Medium=2, Low=1
                sortObj = { priority: sortOrder };
            } else if (sortBy === 'createdAt') sortObj = { createdAt: sortOrder };
        }

        const tasks = await Task.find(query).sort(sortObj);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/tasks
router.post(
    '/',
    [body('title').trim().notEmpty().withMessage('Title is required')],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { title, description, priority, status, dueDate } = req.body;

            const task = await Task.create({
                user: req.user._id,
                title,
                description: description || '',
                priority: priority || 'Medium',
                status: status || 'Todo',
                dueDate: dueDate || null,
            });
            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, priority, status, dueDate } = req.body;
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority !== undefined) task.priority = priority;
        if (status !== undefined) task.status = status;
        if (dueDate !== undefined) task.dueDate = dueDate;

        const updated = await task.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
