"use client"
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const [isOtpSent, setisOtpSent] = useState(false)
  const [email, setemail] = useState("");
  const [otp, setotp] = useState("");
  const router = useRouter();

  useEffect(()=>{
    const hasToken = document.cookie.includes("token=");
    if(hasToken){
      router.push('/dashboard');
    }
  },[])

  const handleLogin=async(e)=>{
    e.preventDefault();
    if(!email){
      alert("Missing Credentials!")
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Enter a valid email address!");
        return;
      }

      const res = await fetch("/api/send-otp",{
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({email}),
      });
      setisOtpSent(true);
    }

  const handleVerify = async(e)=>{
    e.preventDefault();
    if(!otp){
      alert("Enter OTP to Verify")
      return;
    }

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email, otp}),
    });
    const data = await res.json();
    if (data.success) {
      router.push('/dashboard')
    } else {
      alert(data.message || "OTP verification failed");
    }
  }

  return(
    <div className=" w-full min-h-screen flex justify-center items-center">
      <div className="w-[70vh] h-auto rounded-lg bg-[#E0E0E0] border-slate-400">
        <div className="flex p-2 mt-3 items-center justify-center">
          <img height={60} width={60} className="pb-2" src="/images/beelogo.gif" alt="logo" />
          <h1 className="text-3xl text-[#212121] mr-9 text-center font-bold">TaskHive</h1>
        </div>
          <p className="text-center -my-2 text-[#212121] tracking-widest text-sm">Where Remote Teams Buzz Together</p>

          <div className="flex items-center my-3 justify-center">
          <div className="my-6 flex flex-col rounded-2xl bg-white items-center w-[50vh] h-auto shadow-lg p-5">
  <h2 className="font-bold text-[#212121] text-2xl mb-4">Login</h2>

  <form onSubmit={isOtpSent ? handleVerify : handleLogin} className="w-full flex flex-col items-center">
    <label className="mb-1.5 text-[#212121] text-sm font-medium" htmlFor="email">
      Enter Your Email Address
    </label>
    <input
      id="email"
      value={email}
      onChange={(e) => setemail(e.target.value)}
      type="text"
      required
      className="border border-[#E0E0E0] text-[#212121] bg-white px-4 py-1.5 w-72 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCA28] transition-all duration-200"
    />

    {isOtpSent && (
      <div className="flex flex-col items-center mt-3 w-full">
        <input
          className="border border-[#E0E0E0] py-1.5 px-4 w-60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCA28] transition-all duration-200"
          onChange={(e) => setotp(e.target.value)}
          value={otp}
          type="number"
          placeholder="Enter OTP"
          required
        />
        <p className="text-xs text-green-600 mt-1 font-medium">OTP sent!</p>
      </div>
    )}

    {!isOtpSent ? (
      <button
        type="submit"
        className="mt-4 w-72 py-1.5 cursor-pointer text-sm font-semibold text-[#212121] bg-[#FFCA28] rounded-lg hover:bg-[#f4b400] transition-all duration-200"
      >
        Send OTP
      </button>
    ) : (
      <div className="w-full flex flex-col items-center">
        <button
          type="submit"
          className="mt-4 w-72 py-1.5 cursor-pointer text-sm font-semibold text-[#212121] bg-[#FFCA28] rounded-lg hover:bg-[#f4b400] transition-all duration-200"
        >
          Verify OTP
        </button>
        <p
          onClick={(e)=>{setisOtpSent(false)}}
          className="text-xs text-center hover:underline cursor-pointer text-black mt-1.5 font-medium"
        >
          Didnt Receive?
        </p>
      </div>
    )}
  </form>

  {/* Demo Credentials Section */}
  <div className="mt-5 w-full">
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">or try demo account</span>
      </div>
    </div>
    <div className="mt-3 flex justify-center">
      <button
        onClick={() => {
          if (email === "khushii@gmail.com" && otp === "123456") {
            // Clear demo credentials
            setemail("");
            setotp("");
            setisOtpSent(false);
          } else {
            // Set demo credentials
            setemail("khushii@gmail.com");
            setotp("123456");
            setisOtpSent(true);
          }
        }}
        className="inline-flex cursor-pointer items-center px-3 py-1.5 text-sm font-medium text-[#212121] bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FFCA28] transition-all duration-200"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {email === "khushii@gmail.com" && otp === "123456" ? "Clear Demo Account" : "Use Demo Account"}
      </button>
    </div>
  </div>
</div>

          </div>

      </div>
    </div>
  );
}
