import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: "No token found" }), { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return new Response(JSON.stringify({ email: decoded.email }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "JWT verification failed" }), { status: 400 });
  }
}
