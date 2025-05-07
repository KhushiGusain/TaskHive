'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LuLayoutDashboard } from "react-icons/lu";
import { AiOutlineFundProjectionScreen } from "react-icons/ai";
import { RiRobot3Line } from "react-icons/ri";



const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", icon: <LuLayoutDashboard />, path: "/dashboard" },
    { label: "Projects", icon: <AiOutlineFundProjectionScreen />, path: "/projects" },
    { label: "AI Summarizer", icon: <RiRobot3Line />
      , path: "/ai-summarizer" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <div className='w-1/5 h-screen bg-[#1E1E1E] text-white'>
      <div className="flex p-2 mt-5 items-center justify-center">
        <img height={80} width={80} className="pb-3" src="/images/beelogo.gif" alt="logo" />
        <h1 className="text-4xl text-[#E0E0E0] mr-9 text-center font-bold">TaskHive</h1>
      </div>

      <div className='flex flex-col my-2 items-center justify-center'>
        <ul>
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.path)}
              className={`flex gap-2 text-xl my-3 p-2 cursor-pointer w-52 rounded-xl items-center justify-start ${
                isActive(item.path) ? 'bg-yellow-500 text-black font-semibold' : 'hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <li>{item.label}</li>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
