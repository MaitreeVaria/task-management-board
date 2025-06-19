// TaskForm.jsx - Updated to properly handle editing
import { useState, useEffect } from 'react';

function TaskForm({ isOpen, onClose, onSave, editingTask }) {
  // STATE: Form input values
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  // EFFECT: Update form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      // Pre-fill form with existing task data
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  }, [editingTask]); // Run this effect when editingTask changes

  // FUNCTION: Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority
    };

    if (editingTask) {
      taskData.id = editingTask.id;
      taskData.status = editingTask.status;
    }

    onSave(taskData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  // FUNCTION: Handle cancel button
  const handleCancel = () => {
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;