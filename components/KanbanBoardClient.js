"use client";
import React, { useState, useEffect } from "react";
import Column from "./Column";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";

export default function KanbanBoardClient({ initialTasks = [], projectEmails = [], projectId }) {
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

  // Initialize tasks in columns
  useEffect(() => {
    const initialColumns = {
      "Not Started": [],
      "In Progress": [],
      "Completed": []
    };

    initialTasks.forEach(task => {
      const status = task.status?.S || task.status;
      if (initialColumns[status]) {
        initialColumns[status].push(task);
      }
    });

    setColumns(initialColumns);
  }, [initialTasks]);

  // Filter tasks based on selected filters
  const filteredColumns = Object.entries(columns).reduce((acc, [status, tasks]) => {
    acc[status] = tasks.filter(task => {
      const userMatch = !filters.user || (task.assigned_to?.S || task.assignedTo) === filters.user;
      const priorityMatch = !filters.priority || (task.priority?.S || task.priority) === filters.priority;
      const deadlineMatch = !filters.deadline || 
        (filters.deadline === 'today' && new Date(task.deadline?.S || task.deadline).toDateString() === new Date().toDateString()) ||
        (filters.deadline === 'week' && new Date(task.deadline?.S || task.deadline) <= new Date(new Date().setDate(new Date().getDate() + 7))) ||
        (filters.deadline === 'month' && new Date(task.deadline?.S || task.deadline) <= new Date(new Date().setMonth(new Date().getMonth() + 1)));
      
      return userMatch && priorityMatch && deadlineMatch;
    });
    return acc;
  }, {});

  // Helper function to safely get task values
  const getTaskValue = (task, key) => {
    if (!task) return '';
    if (task[key]?.S) return task[key].S;
    if (task[key]?.M) {
      // If it's a nested object, convert it to a string representation
      return JSON.stringify(task[key].M);
    }
    return task[key] || '';
  };

  // Handle Drag Start
  const handleDragStart = (e, task) => {
    setDragging(task);
  };

  // Handle Drag Over
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary for dropping
  };

  // Handle Drop
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!dragging) return;

    try {
      const projectId = dragging.projectId?.S || dragging.projectId;
      const taskId = dragging.taskId?.S || dragging.taskId;

      // Update task in DynamoDB
      const response = await fetch(`https://gvf2mtcwni.execute-api.eu-north-1.amazonaws.com/UpdateTask/${projectId}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: dragging.description?.S || dragging.description,
          assigned_to: dragging.assigned_to?.S || dragging.assigned_to,
          deadline: dragging.deadline?.S || dragging.deadline,
          priority: dragging.priority?.S || dragging.priority,
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
        const oldStatus = dragging.status?.S || dragging.status;

        // Remove from old column
        newColumns[oldStatus] = newColumns[oldStatus].filter(task => {
          const taskId = task.taskId?.S || task.taskId;
          const draggingId = dragging.taskId?.S || dragging.taskId;
          return taskId !== draggingId;
        });

        // Add to new column with updated status
        const updatedTask = {
          ...dragging,
          status: { S: newStatus }
        };
        newColumns[newStatus] = [...newColumns[newStatus], updatedTask];

        return newColumns;
      });

      setDragging(null);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert the drag operation
      setDragging(null);
      // You might want to show an error message to the user here
    }
  };

  // Handle Drag End
  const handleDragEnd = () => {
    setDragging(null);
  };

  // Add Task handler
  const handleAddTask = () => {
    setShowAddModal(true);
  };

  // Save new Task
  const handleSaveTask = (newTask) => {
    setColumns(prev => ({
      ...prev,
      [newTask.status]: [...prev[newTask.status], newTask]
    }));
    setShowAddModal(false);
  };

  // Edit Task handler
  const handleEditTask = (task) => {
    setCurrentTask(task);
    setShowEditModal(true);
  };

  // Update existing Task
  const handleUpdateTask = (updatedTask) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      const oldStatus = updatedTask.oldStatus;
      const newStatus = updatedTask.status;

      // Remove from old column
      newColumns[oldStatus] = newColumns[oldStatus].filter(task => {
        const taskId = task.taskId?.S || task.taskId;
        return taskId !== (updatedTask.taskId?.S || updatedTask.taskId);
      });

      // Add to new column
      newColumns[newStatus] = [...newColumns[newStatus], updatedTask];

      return newColumns;
    });
    setShowEditModal(false);
  };

  // Delete Task
  const handleDeleteTask = (taskToDelete) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      const status = taskToDelete.status?.S || taskToDelete.status;

      newColumns[status] = newColumns[status].filter(task => {
        const taskId = task.taskId?.S || task.taskId;
        return taskId !== (taskToDelete.taskId?.S || taskToDelete.taskId);
      });

      return newColumns;
    });
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex-none flex flex-col gap-2 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-[#212121]">Task Board</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <select
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                className="text-xs p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
              >
                <option value="">All Users</option>
                {projectEmails.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="text-xs p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={filters.deadline}
                onChange={(e) => setFilters({ ...filters, deadline: e.target.value })}
                className="text-xs p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
              >
                <option value="">All Deadlines</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <button
              onClick={handleAddTask}
              className="px-2 cursor-pointer py-0.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1 shadow-md text-xs"
            >
              <span className="text-sm cursor-pointer">+</span> Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(filteredColumns).map(([status, tasks]) => (
          <Column
            key={status}
            status={status}
            tasks={tasks}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
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