import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function GetUserEmail() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null; 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.email; 
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null; 
  }
}
