"use client";
import { IoPersonCircleSharp } from "react-icons/io5";
import Link from 'next/link';
import { FiTrash2, FiCalendar, FiUsers } from 'react-icons/fi';

const ProjectCard = ({ project, onDelete, index }) => {
  // Safely access nested values from DynamoDB response format
  const title = project?.title?.S || "Untitled Project";
  const description = project?.description?.S || "";
  const deadlineStr = project?.deadline?.S;
  const id = project?.projectId?.S;
  const emailsList = project?.emails?.L || [];

  // Convert DynamoDB email objects [{S: 'email1'}, {S: 'email2'}] to string array
  const emails = emailsList.map(emailObj => emailObj?.S).filter(Boolean);

  const teamCount = emails.length;

  // Using only yellow for distinction
  const cardStyles = 'bg-gradient-to-br from-white to-gray-50 border-l-4 border-[#FFCA28] hover:border-[#FFB300] hover:shadow-lg transition-all duration-300';

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      // Ensure project ID is properly formatted
      const projectId = id?.toString()?.trim();
      if (!projectId) {
        throw new Error('Invalid project ID');
      }

      console.log('Attempting to delete project with ID:', projectId);
      const response = await fetch(
        `https://24afk28s51.execute-api.eu-north-1.amazonaws.com/DeleteProject/${projectId}`,
        {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      let data;
      try {
        data = await response.json();
        console.log('Delete API Response:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        } else if (response.status === 500) {
          throw new Error(data?.details || 'Server error occurred while deleting project');
        }
        throw new Error(data?.error || 'Failed to delete project');
      }

      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      alert(error.message || 'Failed to delete project. Please try again.');
    }
  };

  const avatarColors = [
    'bg-gradient-to-br from-[#FF6B81] to-[#FF8E9E]', // Coral
    'bg-gradient-to-br from-[#6C5CE7] to-[#8B7BFF]', // Periwinkle
    'bg-gradient-to-br from-[#00CEC9] to-[#00B4B0]', // Turquoise
    'bg-gradient-to-br from-[#A29BFE] to-[#B2AEFE]', // Lavender
    'bg-gradient-to-br from-[#55EFC4] to-[#81ECEC]', // Mint
    'bg-gradient-to-br from-[#74B9FF] to-[#A5C9FF]', // Sky
    'bg-gradient-to-br from-[#FDCB6E] to-[#FFEAA7]', // Peach
    'bg-gradient-to-br from-[#E84393] to-[#FF6B9E]', // Rose
  ];

  const formattedDate = new Date(deadlineStr);
  const validDate = !isNaN(formattedDate.getTime())
    ? formattedDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Due date not available';

  return (
    <div className="relative group">
      <Link href={`/projects/${id}`} className="block">
        <div className={`${cardStyles} p-6 rounded-xl shadow-sm relative overflow-hidden border border-gray-100`}>
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 z-10 hover:scale-110 transform cursor-pointer"
            title="Delete Project"
            aria-label="Delete Project"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="space-y-4">
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 pr-8">
              {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2">
              {description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {/* Team Members */}
              <div className="flex items-center gap-2">
                <FiUsers className="text-gray-400" />
                <div className="flex -space-x-2">
                  {emails.slice(0, 3).map((email, index) => (
                    <div
                      key={email}
                      className={`w-8 h-8 rounded-full border-2 border-white ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white text-sm font-medium shadow-md hover:scale-110 transform transition-transform duration-200`}
                      title={email}
                    >
                      {email.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {teamCount > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium shadow-md">
                      +{teamCount - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiCalendar className="text-gray-400" />
                <span className="font-medium">{validDate}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;
