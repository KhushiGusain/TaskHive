import React from 'react';
import ProjectsClient from '@/components/ProjectsClient';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function fetchUserEmail() {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      console.error("Token not found in cookies");
      return null;
    }

    // Decode the JWT token to get the email
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;

    if (!userEmail) {
      console.error("Email not found in token");
      return null;
    }

    return userEmail;
  } catch (err) {
    console.error("Error fetching user email:", err);
    return null;
  }
}

async function fetchProjects(userEmail) {
  if (!userEmail) {
    console.error("User email is missing");
    return [];
  }

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
      console.error('Failed to fetch projects:', res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.projects || [];
  } catch (err) {
    console.error("Failed to load projects:", err);
    return [];
  }
}

const Projects = async () => {
  const userEmail = await fetchUserEmail();
  const projects = await fetchProjects(userEmail);

  return <ProjectsClient initialProjects={projects} userEmail={userEmail} />;
};

export default Projects;
