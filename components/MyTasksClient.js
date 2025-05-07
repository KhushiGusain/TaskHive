'use client';
import React from 'react';

export default function MyTasksClient({ initialTasks = [] }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-600';
      case 'Medium':
        return 'bg-amber-50 text-amber-600';
      case 'Low':
        return 'bg-emerald-50 text-emerald-600';
      default:
        return 'bg-gray-50 text-gray-600';
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

  // Safely handle the tasks data
  const tasks = Array.isArray(initialTasks) ? initialTasks : [];

  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
      <div className="flex-none flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            {tasks.length} tasks
          </span>
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No tasks found</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2">
          <ul className="space-y-3">
            {tasks.map((task) => {
              const taskId = task?.taskId?.S || task?.taskId || '';
              const description = task?.description?.S || task?.description || '';
              const deadline = task?.deadline?.S || task?.deadline || '';
              const status = task?.status?.S || task?.status || '';
              const priority = task?.priority?.S || task?.priority || '';
              const projectName = task?.projectName || 'No Project';

              return (
                <li
                  key={taskId}
                  className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900 text-base leading-tight">{description}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Due: {formatDate(deadline)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-xs text-gray-500">Project:</span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                          {projectName}
                        </span>
                      </div>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                        {priority}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 