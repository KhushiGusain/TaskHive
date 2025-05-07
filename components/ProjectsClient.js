"use client";
import React, { useState, useEffect } from 'react';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectButton from '@/components/CreateProjectButton';

const ProjectsClient = ({ initialProjects, userEmail }) => {
  const [projects, setProjects] = useState(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://uh8otb6qa5.execute-api.eu-north-1.amazonaws.com/GetProjects", {
        method: "GET",
        headers: {
          'content-type': 'application/json',
          'useremail': userEmail
        },
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await res.json();
      const updatedProjects = Array.isArray(data) ? data : data.projects || [];
      setProjects(updatedProjects);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch projects when userEmail changes
  useEffect(() => {
    if (userEmail) {
      fetchProjects();
    }
  }, [userEmail]);

  const filteredProjects = projects.filter(project => 
    project.title?.S?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.S?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format project deadlines to a readable date format
  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const handleDeleteProject = (projectId) => {
    setProjects(prevProjects => prevProjects.filter(project => project.projectId?.S !== projectId));
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header Section */}
        <div className="flex-none flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">My Projects</h1>
            <p className="text-gray-500 mt-1">Manage and track your projects</p>
          </div>
          <CreateProjectButton fetchProjects={fetchProjects} />
        </div>

        {/* Search and Projects Container */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="flex-none p-2 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="flex-1 p-3 overflow-y-auto">
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProjects.map((project, index) => {
                  const key = project.projectId ? project.projectId.S : `${project.useremail.S}-${project.title.S}`;
                  return (
                    <ProjectCard
                      key={key}
                      project={project}
                      formattedDeadline={formatDeadline(project.deadline.S)}
                      emails={project.emails?.L?.map(email => email.S) || []}
                      onDelete={handleDeleteProject}
                      index={index}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-sm text-gray-500">Create a new project to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsClient; 