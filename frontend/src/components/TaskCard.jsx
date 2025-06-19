// TaskCard.jsx - Shows one individual task
function TaskCard({ task, onEdit, onDelete }) {
  
    // Function to get priority color
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return '#ff4757';    // Red
        case 'medium': return '#ffa502';  // Orange  
        case 'low': return '#2ed573';     // Green
        default: return '#747d8c';        // Gray
      }
    };
  
    return (
      <div className="task-card">
        {/* Task title */}
        <h3 className="task-title">{task.title}</h3>
        
        {/* Task description */}
        <p className="task-description">{task.description}</p>
        
        {/* Priority badge with color */}
        <div 
          className="task-priority" 
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority.toUpperCase()}
        </div>
        
        {/* Action buttons */}
        <div className="task-actions">
          <button 
            className="edit-btn"
            onClick={() => onEdit(task)}
          >
            Edit
          </button>
          <button 
            className="delete-btn"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  }
  
  export default TaskCard;