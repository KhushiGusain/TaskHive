import CalendarSection from '@/components/CalendarSection'
import MyTasks from '@/components/MyTasks'
import React from 'react'
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Signout from '@/components/Signout';
import { redirect } from 'next/navigation';

const Dashboard = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      redirect('/');
    }

    let email = '';
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      email = decoded.email;
    } catch (error) {
      console.error('JWT verification failed:', error);
      redirect('/');
    }

    return (
      <div className="h-[calc(100vh-2rem)] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-full flex flex-col">
            <div className="flex-none py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome back,</h1>
                  <p className="mt-1 text-base text-gray-600">{email}</p>
                </div>
                <Signout />
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
              <div className="lg:col-span-2 h-full">
                <MyTasks />
              </div>
              <div className="lg:col-span-1 h-full">
                <CalendarSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/');
  }
}

export default Dashboard;