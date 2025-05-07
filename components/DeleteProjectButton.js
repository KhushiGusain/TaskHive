"use client";
import React, { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const DeleteProjectButton = ({ projectId, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log("Attempting to delete project:", projectId);
      const response = await fetch(
        `https://24afk28s51.execute-api.eu-north-1.amazonaws.com/DeleteProject/${projectId}`,
        {
          method: "DELETE",
          headers: {
            'content-type': 'application/json',
          },
        }
      );

      const responseData = await response.json();
      console.log("Delete response:", responseData);

      if (!response.ok) {
        const errorMessage = responseData.details || responseData.error || "Failed to delete project";
        throw new Error(errorMessage);
      }

      onDelete();
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(`Error: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className="text-red-500 hover:text-red-700 transition-colors duration-200"
        disabled={isDeleting}
      >
        <FiTrash2 className="w-5 h-5" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Project</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteProjectButton; 