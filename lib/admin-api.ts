// Helper functions for authenticated admin API calls

function getAuthHeaders(): HeadersInit {
  const credentials = localStorage.getItem('admin_credentials');
  return credentials ? { Authorization: `Basic ${credentials}` } : {};
}

export async function adminGet(url: string): Promise<Response> {
  return fetch(url, {
    headers: getAuthHeaders(),
  });
}

export async function adminPost(url: string, data: any): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
}

export async function adminPut(url: string, data: any): Promise<Response> {
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
}

export async function adminDelete(url: string): Promise<Response> {
  return fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}
