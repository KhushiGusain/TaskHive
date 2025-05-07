import dynamic from 'next/dynamic';
import React from 'react';
import { IoPersonCircleSharp } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import KanbanBoard from '@/components/KanbanBoard';

async function fetchProjectById(id) {
  const res = await fetch(`https://vxkn7vl1jk.execute-api.eu-north-1.amazonaws.com/GetProjectById/${id}`, {
    method: "GET",
    headers: {
      "content-type": 'application/json'
    },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch project");
  }
  return res.json();
}

async function fetchTasksByProjectId(projectId) {
  try {
    const res = await fetch('https://yayd57gr7a.execute-api.eu-north-1.amazonaws.com/GetAllTasks', {
      method: "GET",
      headers: {
        "content-type": 'application/json'
      },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const data = await res.json();
    console.log("All tasks from API:", data);
    
    const projectTasks = Array.isArray(data) ? data.filter(task => task.projectId?.S === projectId) : [];
    console.log("Filtered tasks for project:", projectTasks);
    
    return projectTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

const ProjectsDetails = async({params}) => {
  // Await params to get the id
  const { id } = await params;
  
  const project = await fetchProjectById(id);
  const tasks = await fetchTasksByProjectId(id);

  // Calculate task distribution
  const taskDistribution = {
    "Not Started": tasks.filter(task => task.status?.S === "Not Started").length,
    "In Progress": tasks.filter(task => task.status?.S === "In Progress").length,
    "Completed": tasks.filter(task => task.status?.S === "Completed").length
  };

  console.log("Project:", project);
  console.log("Tasks for project:", tasks);

  // Transform project data to match expected structure
  const transformedProject = {
    title: { S: project.title },
    description: { S: project.description },
    deadline: { S: project.deadline },
    projectId: { S: project.projectId },
    useremail: { S: project.useremail },
    emails: { L: project.emails.map(email => ({ S: email })) }
  };

  const avatarColors = [
    'bg-gradient-to-br from-yellow-500 to-yellow-600', // Yellow
    'bg-gradient-to-br from-blue-600 to-blue-700', // Blue
    'bg-gradient-to-br from-green-600 to-green-700', // Green
    'bg-gradient-to-br from-purple-600 to-purple-700', // Purple
    'bg-gradient-to-br from-indigo-600 to-indigo-700', // Indigo
    'bg-gradient-to-br from-teal-600 to-teal-700', // Teal
    'bg-gradient-to-br from-orange-500 to-orange-600', // Orange
    'bg-gradient-to-br from-amber-500 to-amber-600', // Amber
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="flex-none p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className='flex flex-col gap-1.5 w-full md:w-auto'>
          <div className="flex items-center gap-2">
            <div className="w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight break-words">{project.title}</h1>
              <p className='text-sm text-gray-600 mt-1 max-w-xl leading-relaxed break-words'>{project.description}</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto'>
          <div className='flex items-center gap-2 bg-white px-3 sm:px-4 py-2.5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 w-full sm:w-auto'>
            <div className="w-full">
              <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Deadline</p>
              <p className='text-sm font-semibold text-gray-800 mt-0.5'>{new Date(project.deadline).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>

          <div className='flex items-center gap-2 bg-white px-3 sm:px-4 py-2.5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 w-full sm:w-auto'>
            <div className="w-full">
              <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Team Members</p>
              <div className="flex -space-x-1.5 mt-1.5">
                {project.emails.slice(0, 3).map((email, index) => (
                  <div
                    key={`${email}-${index}`}
                    className="relative group"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-sm overflow-hidden transition-all duration-200 hover:scale-110 hover:shadow-md">
                      <div className={`w-full h-full flex items-center justify-center ${avatarColors[index % avatarColors.length]}`}>
                        <span className="text-white font-medium text-xs">
                          {email.split('@')[0].charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                      {email}
                    </div>
                  </div>
                ))}
                {project.emails.length > 3 && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-yellow-600 text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
                    +{project.emails.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content with KanbanBoard */}
      <div className="flex-1 p-2 sm:p-4 min-h-0 overflow-hidden">
        <div className="h-full rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm overflow-auto">
          <KanbanBoard 
            tasks={tasks} 
            projectEmails={project.emails} 
            projectId={project.projectId}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectsDetails;