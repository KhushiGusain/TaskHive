// components/KanbanBoard.jsx
"use client";
import React, { useState, useEffect } from "react";
import Column from "./Column";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";

export default function KanbanBoard({ tasks = [], projectEmails = [], projectId }) {
  console.log("Received tasks:", tasks);

  const [columns, setColumns] = useState({
    "Not Started": [],
    "In Progress": [],
    "Completed": []
  });

  const [filters, setFilters] = useState({
    user: "",
    priority: "",
    deadline: ""
  });

  const [dragging, setDragging] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Initialize columns with tasks
  useEffect(() => {
    console.log("Initializing columns with tasks:", tasks);
    const transformTask = (task) => {
      // Helper function to safely extract DynamoDB string values
      const getDynamoString = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (value.S) return value.S;
        if (value.M) return value.M.S || '';
        return '';
      };

      return {
        taskId: getDynamoString(task.taskId) || task.id,
        description: getDynamoString(task.description) || '',
        assigned_to: getDynamoString(task.assigned_to) || '',
        deadline: getDynamoString(task.deadline) || '',
        priority: getDynamoString(task.priority) || 'Low',
        status: getDynamoString(task.status) || 'Not Started',
        projectId: getDynamoString(task.projectId) || ''
      };
    };

    const initialColumns = {
      "Not Started": tasks
        .filter(task => {
          const status = task.status?.S || task.status?.M?.S || task.status;
          return status === "Not Started";
        })
        .map(transformTask),
      "In Progress": tasks
        .filter(task => {
          const status = task.status?.S || task.status?.M?.S || task.status;
          return status === "In Progress";
        })
        .map(transformTask),
      "Completed": tasks
        .filter(task => {
          const status = task.status?.S || task.status?.M?.S || task.status;
          return status === "Completed";
        })
        .map(transformTask)
    };
    console.log("Initial columns:", initialColumns);
    setColumns(initialColumns);
  }, [tasks]);

  // Filter tasks based on selected filters
  const getFilteredColumns = () => {
    console.log("Current columns before filtering:", columns);
    const filtered = {};
    Object.keys(columns).forEach(columnId => {
      filtered[columnId] = columns[columnId].filter(task => {
        const matchesUser = !filters.user || task.assigned_to === filters.user;
        const matchesPriority = !filters.priority || task.priority === filters.priority;
        
        let matchesDeadline = true;
        if (filters.deadline && task.deadline) {
          const taskDate = new Date(task.deadline);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          const monthFromNow = new Date(today);
          monthFromNow.setMonth(today.getMonth() + 1);

          switch (filters.deadline) {
            case 'today':
              matchesDeadline = taskDate.toDateString() === today.toDateString();
              break;
            case 'week':
              matchesDeadline = taskDate >= today && taskDate <= weekFromNow;
              break;
            case 'month':
              matchesDeadline = taskDate >= today && taskDate <= monthFromNow;
              break;
          }
        }

        return matchesUser && matchesPriority && matchesDeadline;
      });
    });
    return filtered;
  };

  const filteredColumns = getFilteredColumns();

  // Handle drag start
  const handleDragStart = (e, status, taskId) => {
    const task = columns[status].find(t => t.taskId === taskId);
    if (task) {
      setDragging(task);
    }
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    setDragging(null);
    if (e.target.classList) {
      e.target.classList.remove("opacity-50");
    }
  };

  // Allow drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!dragging) return;

    try {
      const taskId = dragging.taskId;
      const projectId = dragging.projectId;

      if (!taskId || !projectId) {
        console.error('Missing taskId or projectId:', { taskId, projectId, dragging });
        return;
      }

      const response = await fetch(`https://gvf2mtcwni.execute-api.eu-north-1.amazonaws.com/UpdateTask/${projectId}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: dragging.description,
          assigned_to: dragging.assigned_to,
          deadline: dragging.deadline,
          priority: dragging.priority,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update task');
      }

      const result = await response.json();
      console.log('Update successful:', result);

      // Update local state
      setColumns(prev => {
        const newColumns = { ...prev };
        const oldStatus = dragging.status;

        // Remove from old column
        newColumns[oldStatus] = newColumns[oldStatus].filter(task => task.taskId !== taskId);

        // Add to new column with updated status
        const updatedTask = {
          ...dragging,
          status: newStatus
        };
        newColumns[newStatus] = [...newColumns[newStatus], updatedTask];

        return newColumns;
      });

      setDragging(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setDragging(null);
    }
  };

  // Open add task modal
  const handleAddTask = () => {
    setShowAddModal(true);
  };

  // Save new task
  const handleSaveTask = async (taskData) => {
    try {
      console.log("Saving task data:", taskData);

      // Format task data for API request
      const formattedTaskData = {
        title: taskData.description, // Using description as title
        description: taskData.description,
        assignedTo: taskData.assigned_to,
        dueDate: taskData.deadline,
        priority: taskData.priority,
        status: taskData.status,
        projectId: taskData.projectId
      };

      // Send data to API
      const response = await fetch('https://pgalbiydq4.execute-api.eu-north-1.amazonaws.com/CreateTask', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(formattedTaskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create task: ${errorData.message || response.statusText}`);
      }

      const newTask = await response.json();
      console.log("New task created:", newTask);
      
      // Format the task to match the expected structure
      const formattedTask = {
        taskId: newTask.taskId,
        description: taskData.description,
        assigned_to: taskData.assigned_to,
        deadline: taskData.deadline,
        priority: taskData.priority,
        status: taskData.status,
        projectId: taskData.projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const newColumns = {...columns};
      newColumns[taskData.status] = [...newColumns[taskData.status], formattedTask];
      setColumns(newColumns);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      // Consider showing an error message to the user here
    }
  };

  // Open edit task modal
  const handleEditTask = (columnId, taskId) => {
    const task = columns[columnId].find(task => task.taskId === taskId);
    console.log("Editing task:", task);
    setCurrentTask(task);
    setShowEditModal(true);
  };

  // Update task
  const handleUpdateTask = async (taskData) => {
    try {
      const response = await fetch(`https://ytsg70phul.execute-api.eu-north-1.amazonaws.com/UpdateTask/${currentTask.taskId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          taskId: currentTask.taskId,
          description: taskData.description,
          assigned_to: taskData.assigned_to,
          deadline: taskData.deadline,
          priority: taskData.priority,
          status: taskData.status,
          projectId: taskData.projectId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      const newColumns = {...columns};
      
      // If status changed, remove from old column and add to new column
      if (taskData.status !== currentTask.status) {
        newColumns[currentTask.status] = newColumns[currentTask.status].filter(
          task => task.taskId !== currentTask.taskId
        );
        newColumns[taskData.status] = [...newColumns[taskData.status], updatedTask];
      } else {
        const taskIndex = newColumns[currentTask.status].findIndex(
          task => task.taskId === currentTask.taskId
        );
        newColumns[currentTask.status][taskIndex] = updatedTask;
      }
      
      setColumns(newColumns);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Delete task
  const handleDeleteTask = async (status, taskId) => {
    try {
      const response = await fetch(`https://eh09l513ra.execute-api.eu-north-1.amazonaws.com/DeleteTask/${projectId}/${taskId}`, {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Update local state
      setColumns(prev => {
        const newColumns = { ...prev };
        newColumns[status] = newColumns[status].filter(task => task.taskId !== taskId);
        return newColumns;
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#FF8787] flex items-center justify-center text-white shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Task Board</h2>
            <p className="text-xs text-gray-500">Manage and track your project tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <select
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-[#FF6B6B]"
            >
              <option value="">All Users</option>
              {projectEmails.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-[#FF6B6B]"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={filters.deadline}
              onChange={(e) => setFilters({ ...filters, deadline: e.target.value })}
              className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-[#FF6B6B]"
            >
              <option value="">All Deadlines</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <button
            onClick={handleAddTask}
            className="px-3 py-1.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8787] text-white text-xs font-medium rounded-md hover:from-[#FF5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
        {Object.entries(filteredColumns).map(([status, tasks]) => (
          <Column
            key={status}
            status={status}
            tasks={tasks}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
      
      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveTask}
          columns={Object.keys(columns)}
          projectEmails={projectEmails}
          projectId={projectId}
        />
      )}
      
      {/* Edit Task Modal */}
      {showEditModal && currentTask && (
        <EditTaskModal 
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateTask}
          columns={Object.keys(columns)}
          initialData={currentTask}
          projectEmails={projectEmails}
        />
      )}
    </div>
  );
}