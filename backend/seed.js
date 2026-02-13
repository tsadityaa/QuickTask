const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Task.deleteMany({});

        // Create demo user
        const user = await User.create({
            name: 'Demo User',
            email: 'demo@quicktask.com',
            password: 'password123',
        });

        console.log('Created demo user: demo@quicktask.com / password123');

        // Create sample tasks
        const tasks = [
            { user: user._id, title: 'Set up project repository', description: 'Initialize Git repo and push to GitHub', priority: 'High', status: 'Completed', dueDate: new Date('2026-02-10') },
            { user: user._id, title: 'Design database schema', description: 'Create MongoDB schema for users and tasks', priority: 'High', status: 'Completed', dueDate: new Date('2026-02-11') },
            { user: user._id, title: 'Implement authentication', description: 'JWT-based auth with register and login', priority: 'High', status: 'Completed', dueDate: new Date('2026-02-12') },
            { user: user._id, title: 'Build task CRUD API', description: 'Create REST endpoints for task management', priority: 'High', status: 'In Progress', dueDate: new Date('2026-02-13') },
            { user: user._id, title: 'Create React frontend', description: 'Build the UI with React and Vite', priority: 'High', status: 'In Progress', dueDate: new Date('2026-02-14') },
            { user: user._id, title: 'Add filtering and search', description: 'Enable filtering by status, priority, and search by title', priority: 'Medium', status: 'Todo', dueDate: new Date('2026-02-15') },
            { user: user._id, title: 'Implement dashboard charts', description: 'Add Chart.js charts to the dashboard', priority: 'Medium', status: 'Todo', dueDate: new Date('2026-02-16') },
            { user: user._id, title: 'Build Python analytics service', description: 'FastAPI microservice for analytics', priority: 'Medium', status: 'Todo', dueDate: new Date('2026-02-17') },
            { user: user._id, title: 'Write unit tests', description: 'Add tests for API endpoints', priority: 'Low', status: 'Todo', dueDate: new Date('2026-02-18') },
            { user: user._id, title: 'Deploy application', description: 'Deploy all services to cloud platform', priority: 'Low', status: 'Todo', dueDate: new Date('2026-02-20') },
        ];

        await Task.insertMany(tasks);
        console.log(`Seeded ${tasks.length} tasks`);

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
