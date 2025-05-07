import React from 'react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import AISummarizerClient from './AISummarizerClient';
import { redirect } from 'next/navigation';

async function getUserData(userEmail) {
  try {
    const res = await fetch(`https://c1gv0vg643.execute-api.eu-north-1.amazonaws.com/UserDetails/${userEmail}`, {
      method: "GET",
      headers: {
        "content-type": 'application/json'
      },
      cache: "no-store"
    });

    if (!res.ok) {
      console.error('Failed to fetch user data:', res.status, res.statusText);
      return { projects: [], tasks: [] };
    }

    const data = await res.json();
    return {
      projects: data.projects || [],
      tasks: data.tasks.flatMap(projectTasks => projectTasks.tasks || [])
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { projects: [], tasks: [] };
  }
}

export default async function AISummarizer() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      redirect('/');
    }

    let userEmail = '';
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userEmail = decoded.email;
    } catch (error) {
      console.error('JWT verification failed:', error);
      redirect('/');
    }

    const { projects, tasks } = await getUserData(userEmail);

    return (
      <div className="h-[calc(100vh-64px)] bg-[#FFFFFF]">
        <AISummarizerClient 
          userEmail={userEmail}
          initialProjects={projects}
          initialTasks={tasks}
        />
      </div>
    );
  } catch (error) {
    console.error('AISummarizer error:', error);
    redirect('/');
  }
} 