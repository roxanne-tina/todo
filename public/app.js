document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskList = document.getElementById('task-list');
    const addTaskForm = document.getElementById('add-task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const editModal = document.getElementById('edit-modal');
    const closeModalBtn = document.querySelector('.close');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskId = document.getElementById('edit-task-id');
    const editTaskTitle = document.getElementById('edit-task-title');
    const editTaskDescription = document.getElementById('edit-task-description');
    const editTaskStatus = document.getElementById('edit-task-status');
    
    // Current filter
    let currentFilter = 'all';
    
    // Fetch all tasks
    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load tasks. Please try again later.');
        }
    };
    
    // Render tasks based on current filter
    const renderTasks = (tasks) => {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            return task.status === currentFilter;
        });
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">No tasks found</li>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description || ''}</div>
                    <span class="task-status status-${task.status}">${task.status}</span>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners for edit and delete buttons
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditModal(task));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(taskItem);
        });
    };
    
    // Add a new task
    const addTask = async (e) => {
        e.preventDefault();
        
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create task');
            }
            
            // Reset form
            addTaskForm.reset();
            
            // Refresh tasks
            fetchTasks();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add task. Please try again.');
        }
    };
    
    // Delete a task
    const deleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            
            // Refresh tasks
            fetchTasks();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete task. Please try again.');
        }
    };
    
    // Open edit modal
    const openEditModal = (task) => {
        editTaskId.value = task.id;
        editTaskTitle.value = task.title;
        editTaskDescription.value = task.description || '';
        editTaskStatus.value = task.status;
        
        editModal.style.display = 'block';
    };
    
    // Close edit modal
    const closeEditModal = () => {
        editModal.style.display = 'none';
    };
    
    // Update a task
    const updateTask = async (e) => {
        e.preventDefault();
        
        const taskId = editTaskId.value;
        const title = editTaskTitle.value.trim();
        const description = editTaskDescription.value.trim();
        const status = editTaskStatus.value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description, status })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            
            // Close modal
            closeEditModal();
            
            // Refresh tasks
            fetchTasks();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update task. Please try again.');
        }
    };
    
    // Filter tasks
    const filterTasks = (filter) => {
        currentFilter = filter;
        
        // Update active filter button
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Refresh tasks with the new filter
        fetchTasks();
    };
    
    // Event Listeners
    addTaskForm.addEventListener('submit', addTask);
    editTaskForm.addEventListener('submit', updateTask);
    closeModalBtn.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterTasks(btn.dataset.filter);
        });
    });
    
    // Initial load
    fetchTasks();
});
