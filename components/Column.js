import React from "react";

const Column = ({ 
  status, 
  tasks, 
  onDragOver, 
  onDrop, 
  onEditTask, 
  onDeleteTask, 
  onDragStart, 
  onDragEnd 
}) => {
  const getColumnHeaderColor = (status) => {
    switch(status) {
      case "Not Started": return "bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 transition-all duration-300";
      case "In Progress": return "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-600 transition-all duration-300";
      case "Completed": return "bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 transition-all duration-300";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Low':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // Get user initial for avatar
  const getUserInitial = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  // Get avatar gradient based on email
  const getAvatarGradient = (email) => {
    const gradients = [
      'from-gray-600 to-gray-700', // Gray
      'from-blue-600 to-blue-700', // Blue
      'from-green-600 to-green-700', // Green
      'from-purple-600 to-purple-700', // Purple
      'from-indigo-600 to-indigo-700', // Indigo
      'from-teal-600 to-teal-700', // Teal
      'from-slate-600 to-slate-700', // Slate
      'from-zinc-600 to-zinc-700', // Zinc
    ];
    
    // Use email to generate consistent color
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-250px)]">
      <div className={`flex-none p-3 rounded-t-lg ${getColumnHeaderColor(status)} text-white shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              {status === "Not Started" && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {status === "In Progress" && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {status === "Completed" && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <h2 className="text-xs font-semibold tracking-wide">{status}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-white/40 px-2 py-0.5 rounded-full font-medium shadow-sm border border-white/20">
              {tasks.length}
            </span>
          </div>
        </div>
      </div>
      
      <div 
        className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, status)}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs">No tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => {
              const taskId = task.taskId?.S || task.taskId;
              const description = task.description?.S || task.description;
              const assignedTo = task.assigned_to?.S || task.assigned_to;
              const deadline = task.deadline?.S || task.deadline;
              const priority = task.priority?.S || task.priority;

              return (
                <div
                  key={taskId}
                  draggable
                  onDragStart={(e) => onDragStart(e, status, taskId)}
                  onDragEnd={onDragEnd}
                  className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 cursor-grab hover:shadow-md transition-all duration-200 group hover:border-gray-200"
                >
                  <div className="flex flex-col gap-1.5">
                    {/* Header with description and priority */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-800 text-xs leading-tight line-clamp-2 flex-1">
                        {description}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(priority)}`}>
                        {priority}
                      </span>
                    </div>

                    {/* User and deadline info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarGradient(assignedTo)} flex items-center justify-center text-white text-[10px] font-medium shadow-sm`}>
                          {getUserInitial(assignedTo)}
                        </div>
                        <span className="text-[10px] text-gray-500 truncate max-w-[100px]">
                          {assignedTo || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(deadline)}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={() => onEditTask(status, taskId)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:bg-blue-50 rounded-md cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDeleteTask(status, taskId)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded-md cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
