import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { projects, tasks } = await request.json();

    // Format the data for the prompt
    const projectsInfo = projects.map(project => ({
      title: project.title?.S || project.title,
      deadline: project.deadline?.S || project.deadline,
      description: project.description?.S || project.description,
    }));

    const tasksInfo = tasks.map(task => ({
      title: task.title?.S || task.title,
      status: task.status?.S || task.status,
      priority: task.priority?.S || task.priority,
      deadline: task.deadline?.S || task.deadline,
      assigned_to: task.assigned_to?.S || task.assigned_to,
    }));

    const prompt = `As a professional project management assistant, analyze the projects and tasks the user has assigned to them and provide a comprehensive summary to help them manage their projects better.

Projects:
${JSON.stringify(projectsInfo, null, 2)}

Tasks:
${JSON.stringify(tasksInfo, null, 2)}

Please provide a detailed analysis in the following structure:

1. Projects:
    - Total number of projects and their current status
    - projects that needs immediate attention and deadlines that are coming up
    - projects that are overdue and need to be completed

2. Tasks:
    - Total number of tasks and their current status
    - tasks that needs immediate attention and deadlines that are coming up
    - tasks according to priority

3. Recommendations:
    - specific steps to improve project efficiency
    - suggestions on how to manage tasks better
    - suggestions on how to manage deadlines better

4. Overall Summary:
    - A brief summary of the projects and tasks
    - A list of recommendations to improve project efficiency
`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an experienced project management consultant with expertise in task analysis, risk assessment, and process optimization. Provide clear, actionable insights that help improve project efficiency and team productivity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1500,
    });

    return NextResponse.json({ 
      summary: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
} 