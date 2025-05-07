import React, { useState } from "react";

const AddTaskModal = ({ onClose, onSave, columns, projectEmails, projectId }) => {
  const [taskData, setTaskData] = useState({
    description: "",
    assigned_to: projectEmails[0] || "",
    deadline: "",
    priority: "Medium",
    status: columns[0],
    projectId: projectId
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(taskData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Add New Task</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-3">
          <div className="mb-3">
            <label className="block text-gray-700 mb-1.5 text-sm">Description</label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded resize-none text-sm"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-gray-700 mb-1.5 text-sm">Assigned To</label>
            <select
              value={taskData.assigned_to}
              onChange={(e) => setTaskData({...taskData, assigned_to: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            >
              {projectEmails.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 mb-1.5 text-sm">Due Date</label>
            <input
              type="datetime-local"
              value={taskData.deadline}
              onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 mb-1.5 text-sm">Priority</label>
            <select
              value={taskData.priority}
              onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-gray-700 mb-1.5 text-sm">Status</label>
            <select
              value={taskData.status}
              onChange={(e) => setTaskData({...taskData, status: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              {columns.map(column => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 cursor-pointer text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 cursor-pointer bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;