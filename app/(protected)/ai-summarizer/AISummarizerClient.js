"use client";
import React, { useState, useEffect } from "react";
import { FiClock, FiFlag, FiCheckCircle, FiAlertCircle, FiCalendar, FiTrendingUp, FiList, FiTarget, FiCheckSquare, FiAlertTriangle } from "react-icons/fi";
import { BsKanban, BsLightningCharge } from "react-icons/bs";
import { Button } from "@/components/ui/button";

export default function AISummarizerClient({ userEmail, initialProjects, initialTasks }) {
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState(null);

  // Calculate task distribution
  const taskDistribution = {
    "Not Started": tasks.filter(task => task.status?.S === "Not Started").length,
    "In Progress": tasks.filter(task => task.status?.S === "In Progress").length,
    "Completed": tasks.filter(task => task.status?.S === "Completed").length
  };

  // Calculate team activity
  const teamActivity = {
    totalTasks: tasks.length,
    completedTasks: taskDistribution["Completed"],
    pendingTasks: taskDistribution["Not Started"] + taskDistribution["In Progress"]
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projects,
          tasks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setSummary(`# Error Generating Summary

We apologize, but we couldn't generate your task summary at this time. Please try again later.

Error details: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );

  const SummarySection = ({ title, icon, children }) => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-blue-50">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="prose prose-sm max-w-none">
        {children}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const parseSummary = (summaryText) => {
    if (!summaryText) return null;

    const sections = summaryText.split(/\d\.\s+/).filter(Boolean);
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(Boolean);
      if (lines.length === 0) return null; // Skip empty sections
      
      const title = lines[0].replace(':', '').trim();
      const content = lines.slice(1).filter(line => line.trim()); // Filter out empty lines

      if (content.length === 0) return null; // Skip sections with no content

      let sectionTitle = '';
      let sectionIcon = null;

      if (title.includes('Projects')) {
        sectionTitle = 'Projects Overview';
        sectionIcon = <FiTarget className="w-4 h-4 text-blue-600" />;
      } else if (title.includes('Tasks')) {
        sectionTitle = 'Task Analysis';
        sectionIcon = <FiList className="w-4 h-4 text-green-600" />;
      } else if (title.includes('Recommendations')) {
        sectionTitle = 'Recommendations';
        sectionIcon = <FiTrendingUp className="w-4 h-4 text-purple-600" />;
      } else if (title.includes('Overall Summary')) {
        sectionTitle = 'Overall Summary';
        sectionIcon = <FiCheckSquare className="w-4 h-4 text-indigo-600" />;
      }

      if (!sectionTitle) return null; // Skip if no valid section title found

      return (
        <SummarySection key={index} title={sectionTitle} icon={sectionIcon}>
          <div className="space-y-2">
            {content.map((line, lineIndex) => (
              <p key={lineIndex} className="text-sm text-gray-700 leading-relaxed">
                {line.startsWith('-') ? (
                  <span className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{line.substring(1).trim()}</span>
                  </span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </SummarySection>
      );
    }).filter(Boolean); // Remove any null sections
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Fixed Header and Stats Section */}
      <div className="flex-none p-4 border-b border-gray-100">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Task Summary</h1>
            <p className="text-sm text-gray-600 mt-1">Get AI-powered insights about your tasks and projects</p>
          </div>
          <Button
            onClick={generateSummary}
            disabled={isGenerating}
            className="bg-[#FFCA28] hover:bg-[#FFB300] text-gray-800 px-5 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md text-sm font-medium"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <BsLightningCharge className="w-4 h-4" />
                <span>Generate Summary</span>
              </>
            )}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Tasks"
            value={teamActivity.totalTasks}
            icon={<BsKanban className="w-4 h-4 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Completed Tasks"
            value={teamActivity.completedTasks}
            icon={<FiCheckCircle className="w-4 h-4 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            title="In Progress"
            value={taskDistribution["In Progress"]}
            icon={<FiClock className="w-4 h-4 text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatCard
            title="Not Started"
            value={taskDistribution["Not Started"]}
            icon={<FiAlertCircle className="w-4 h-4 text-red-600" />}
            color="bg-red-50"
          />
        </div>
      </div>

      {/* Summary Container */}
      {summary && (
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-full overflow-y-auto p-4">
              <div className="max-w-5xl mx-auto space-y-3">
                {parseSummary(summary)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 