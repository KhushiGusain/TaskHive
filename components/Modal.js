"use client";
import React, { useState, useEffect } from "react";
import EmailInput from "./EmailInput";

const Modal = ({ setShowModal, fetchProjects}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [emails, setEmails] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await fetch("/api/getUserEmail");
        const data = await response.json();
        if (data.email) {
          setEmail(data.email);
        } else {
          console.error("Error fetching email:", data.error);
        }
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };

    fetchEmail();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!email) {
      console.error("User email is missing.");
      return;
    }
  
    const projectData = {
      title,
      description,
      deadline,
      emails,
      useremail: email
    };

    const handleCreateProject = async () => {
      try {
        console.log("Sending Project Data:", projectData);

        const response = await fetch(
          "https://ro0m4a7t0i.execute-api.eu-north-1.amazonaws.com/CreateProject",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(projectData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to create project');
        }

        const result = await response.json();
        console.log("Project Created:", result);

        // Reset form fields
        setTitle("");
        setDescription("");
        setDeadline("");
        setEmails([]);

        // Close modal and refresh projects list
        setShowModal(false);
        if (fetchProjects) {
          await fetchProjects();
        }
      } catch (error) {
        console.error("Error creating project:", error);
      }
    };

    handleCreateProject();
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Project Name"
            className="border p-2 mb-4 w-full rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            className="border p-2 mb-4 w-full rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            className="border p-2 mb-4 w-full rounded"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Members
          </label>
          <EmailInput emails={emails} setEmails={setEmails} />

          <div className="mt-2">
            <h3 className="text-sm text-gray-600">Emails Added:</h3>
            <div className="bg-gray-100 p-2 mt-1 rounded-md max-h-32 overflow-y-auto">
              {emails.length === 0 ? (
                <p className="text-sm text-gray-500">No emails added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {emails.map((email, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="submit"
              className="bg-black cursor-pointer text-white px-4 py-2 rounded"
            >
              Create
            </button>
            <button
              type="button"
              className="bg-gray-200 cursor-pointer text-black px-4 py-2 rounded"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
