"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

const Signout = () => {
    const router = useRouter();
    const handleSignout = async () => {
        await fetch('/api/signout');
        router.push('/');
      };
  return (
    <div>
        <button type="button"
            onClick={handleSignout}
            className="w-32 py-2.5 cursor-pointer text-lg font-semibold text-[#212121] bg-[#FFCA28] rounded-lg hover:bg-[#f4b400] transition-all duration-200">Signout</button>
        
    </div>
  )
}

export default Signout
