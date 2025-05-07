import MyTasksClient from './MyTasksClient';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function getTasks() {
  try {
    const response = await fetch('https://yayd57gr7a.execute-api.eu-north-1.amazonaws.com/GetAllTasks', {
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

async function getProjectById(id, retryCount = 0) {
  try {
    // Handle both string and DynamoDB format IDs
    const projectId = typeof id === 'object' && id.S ? id.S : id;
    console.log('Fetching project with ID:', projectId);
    
    const url = `https://vxkn7vl1jk.execute-api.eu-north-1.amazonaws.com/GetProjectById/${projectId}`;
    console.log('API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Project with ID ${projectId} not found in the database`);
        // Try fetching from the projects list API as a fallback
        try {
          const projectsResponse = await fetch('https://uh8otb6qa5.execute-api.eu-north-1.amazonaws.com/GetProjects', {
            method: 'GET',
            headers: {
              'content-type': 'application/json'
            },
            cache: 'no-store'
          });

          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            const project = Array.isArray(projectsData) 
              ? projectsData.find(p => p.projectId === projectId || p.projectId?.S === projectId)
              : projectsData.projects?.find(p => p.projectId === projectId || p.projectId?.S === projectId);

            if (project) {
              console.log('Found project in projects list:', project);
              return project;
            }
          }
        } catch (error) {
          console.error('Error fetching from projects list:', error);
        }
        return null;
      }
      
      // Retry on server errors (5xx) or network errors
      if ((response.status >= 500 || !response.status) && retryCount < 3) {
        console.log(`Retrying fetch for project ${projectId} (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return getProjectById(id, retryCount + 1);
      }

      console.error('Failed to fetch project:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Project data received:', JSON.stringify(data, null, 2));

    // The API returns the project data directly
    return data;
  } catch (error) {
    console.error('Error fetching project:', error);
    // Retry on network errors
    if (retryCount < 3) {
      console.log(`Retrying fetch for project ${projectId} (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return getProjectById(id, retryCount + 1);
    }
    return null;
  }
}

export default async function MyTasks() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let userEmail = '';

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userEmail = decoded.email;
    } catch (error) {
      console.error('JWT verification failed:', error);
    }
  }

  const allTasks = await getTasks();
  const userTasks = allTasks.filter(task => task.assigned_to?.S === userEmail);

  // Get project details for each task
  const tasksWithProjects = await Promise.all(
    userTasks.map(async (task) => {
      if (task.projectId?.S) {
        try {
          const project = await getProjectById(task.projectId);
          console.log('Project data for task:', task.taskId?.S, project);

          // The project data is returned directly from the API
          const projectTitle = project?.title || project?.title?.S || 'No Project';

          return {
            ...task,
            projectName: projectTitle
          };
        } catch (error) {
          console.error(`Error fetching project for task ${task.taskId?.S}:`, error);
          return {
            ...task,
            projectName: 'No Project'
          };
        }
      }
      return {
        ...task,
        projectName: 'No Project'
      };
    })
  );

  return <MyTasksClient initialTasks={tasksWithProjects} />;
}
