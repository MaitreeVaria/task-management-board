import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Run fetchTasks() when component first loads
  useEffect(() => {
    fetchTasks();
  }, []);

  // Get all tasks from your Node.js backend
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://3.129.45.165:3001/api/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  // Calculate task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const todo = tasks.filter(task => task.status === 'todo').length;
    const inProgress = tasks.filter(task => task.status === 'inprogress').length;
    const done = tasks.filter(task => task.status === 'done').length;
    
    return { total, todo, inProgress, done };
  };

  // Open form for creating new task
  const handleAddTask = () => {
    setEditingTask(null);  
    setIsFormOpen(true);   
  };

  // Open form for editing existing task
  const handleEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Close the form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  // Save task (create or update)
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        // UPDATING existing task
        const response = await axios.put(`http://3.129.45.165:3001/api/tasks/${editingTask.id}`, taskData);
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? response.data : task
        ));
      } else {
        // CREATING new task
        const response = await axios.post('http://3.129.45.165:3001/api/tasks', taskData);
        setTasks([...tasks, response.data]);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  //  Handle deleting a task
  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      await axios.delete(`http://3.129.45.165:3001/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  // FUNCTION: Handle changing task status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = { ...task, status: newStatus };
      
      const response = await axios.put(`http://3.129.45.165:3001/api/tasks/${taskId}`, updatedTask);
      
      setTasks(tasks.map(task => 
        task.id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Task Management Board</h1>
          <button className="add-task-btn" onClick={handleAddTask}>
            <span className="btn-icon">+</span>
            Add Task
          </button>
        </div>
      </header>

      {/* Statistics Dashboard */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card stat-total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.total}</h3>
              <p className="stat-label">Total Tasks</p>
            </div>
          </div>
          
          <div className="stat-card stat-todo">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.todo}</h3>
              <p className="stat-label">To Do</p>
            </div>
          </div>
          
          <div className="stat-card stat-progress">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.inProgress}</h3>
              <p className="stat-label">In Progress</p>
            </div>
          </div>
          
          <div className="stat-card stat-done">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.done}</h3>
              <p className="stat-label">Completed</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="app-main">
        <div className="table-container">
          <div className="table-header">
            <h2>All Tasks</h2>
            <div className="table-filters">
              {/* We can add filters here later */}
            </div>
          </div>
          
          <div className="table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="task-row">
                    <td className="task-info">
                      <div className="task-main">
                        <h4 className="task-title">{task.title}</h4>
                        <p className="task-description">{task.description}</p>
                      </div>
                    </td>
                    <td className="task-status">
                      <select 
                        className={`status-select status-${task.status}`}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="task-priority">
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="task-date">
                      {new Date(task.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="task-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(task)}
                        title="Edit task"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(task.id)}
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {tasks.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No tasks yet</h3>
                <p>Create your first task to get started!</p>
                <button className="empty-cta-btn" onClick={handleAddTask}>
                  Create Task
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </div>
  );
}

export default App;
