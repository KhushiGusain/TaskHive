import React from "react";

const TaskCard = ({ task, columnId, onEdit, onDelete, onDragStart, onDragEnd }) => {
  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Low':
        return 'bg-green-50 text-green-600 border-green-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get user initial for avatar
  const getUserInitial = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div
      id={task.id}
      draggable
      onDragStart={(e) => onDragStart(e, columnId, task.id)}
      onDragEnd={onDragEnd}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-2 cursor-grab hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex flex-col gap-2">
        {/* Header with description and priority */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-800 text-sm leading-tight line-clamp-2 flex-1">
            {task.description}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        {/* User and deadline info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#8B7BFF] flex items-center justify-center text-white text-xs font-medium shadow-sm">
              {getUserInitial(task.assigned_to)}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {task.assigned_to || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(task.deadline)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => onEdit(columnId, task.id)}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(columnId, task.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
