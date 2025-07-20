import { NextRequest } from 'next/server';

const ADMIN_CREDENTIALS = {
  username: 'dnna',
  password: 'z4L9mY28MQDUZs6qT2VkOr17',
};

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

export function getAuthFromRequest(
  request: NextRequest
): { username: string; password: string } | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  try {
    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    return { username, password };
  } catch (error) {
    return null;
  }
}

export function createUnauthorizedResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Panel"',
    },
  });
}
