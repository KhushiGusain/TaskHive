import React, { useState } from "react";

const EditTaskModal = ({ onClose, onSave, columns, initialData, projectEmails }) => {
  const [taskData, setTaskData] = useState({
    description: initialData.description?.S || "",
    assignedTo: initialData.assigned_to?.S || projectEmails[0] || "",
    dueDate: initialData.deadline?.S ? new Date(initialData.deadline.S).toISOString().slice(0, 16) : "",
    priority: initialData.priority?.S || "Medium",
    status: initialData.status?.S || columns[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...taskData,
      id: initialData.taskId?.S
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Edit Task</h3>
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
              value={taskData.assignedTo}
              onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
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
              value={taskData.dueDate}
              onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;