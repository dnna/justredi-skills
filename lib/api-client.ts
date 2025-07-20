// Custom fetch wrapper that includes authentication headers for admin API calls
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const credentials = localStorage.getItem('admin_credentials');

  const headers = {
    'Content-Type': 'application/json',
    ...(credentials && { Authorization: `Basic ${credentials}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Helper function to handle common API response patterns
export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(url, options);

  if (!response.ok) {
    if (response.status === 401) {
      // Handle authentication failure
      localStorage.removeItem('admin_credentials');
      window.location.reload();
      throw new Error('Authentication required');
    }
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
