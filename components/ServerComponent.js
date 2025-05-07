// app/components/ServerComponent.js
import jwt from 'jsonwebtoken';

export default async function ServerComponent() {
  // Get cookies from the request
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    // No token, redirect to login or return an empty value
    return null;
  }

  try {
    // Verify the token with JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email; // Assuming the email is in the JWT payload

    return { email }; // Return the email as part of the result
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null; // If token verification fails, return null
  }
}
