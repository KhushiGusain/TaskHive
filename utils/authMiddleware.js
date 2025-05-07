import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;

export async function authMiddleware(req) {
  try {
    const token = req.cookies?.get('token')?.value;

    if (!token) {
      return { authenticated: false };
    }

    const decoded = jwt.verify(token, jwtSecret);
    return {
      authenticated: true,
      user: decoded // contains email or userId etc.
    };

  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return { authenticated: false };
  }
}
