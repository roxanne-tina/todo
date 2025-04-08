const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Default XAMPP password is empty
    database: 'todo_database'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
    db.query('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ error: 'Failed to fetch tasks' });
        }
        res.json(results);
    });
});

// Create a new task
app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    db.query(
        'INSERT INTO tasks (title, description) VALUES (?, ?)',
        [title, description || ''],
        (err, result) => {
            if (err) {
                console.error('Error creating task:', err);
                return res.status(500).json({ error: 'Failed to create task' });
            }
            
            // Fetch the newly created task
            db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Task created but failed to retrieve it' });
                }
                res.status(201).json(rows[0]);
            });
        }
    );
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, description, status } = req.body;
    
    db.query(
        'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
        [title, description, status, taskId],
        (err, result) => {
            if (err) {
                console.error('Error updating task:', err);
                return res.status(500).json({ error: 'Failed to update task' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            // Fetch the updated task
            db.query('SELECT * FROM tasks WHERE id = ?', [taskId], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Task updated but failed to retrieve it' });
                }
                res.json(rows[0]);
            });
        }
    );
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    
    db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).json({ error: 'Failed to delete task' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted successfully' });
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
