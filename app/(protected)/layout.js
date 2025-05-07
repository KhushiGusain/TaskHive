// app/(protected)/layout.js
import Sidebar from "@/components/Sidebar"; 


export const metadata = {
  title: "Dashboard",
  description: "Protected layout",
};

export default function ProtectedLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className=" flex-1 p-4">
        {children}
      </main>
    </div>
  );
}
