/**
 * Pear API Client
 * 
 * Simple client for making authenticated requests to the Pear API.
 * For hackathon use - uses static access token from environment variables.
 */

/**
 * Gets the Pear access token from environment variables.
 * For hackathon: just returns the token, throws if missing.
 * 
 * @returns The access token
 * @throws Error if PEAR_ACCESS_TOKEN is not set
 */
export function getPearAccessToken(): string {
  const token = process.env.PEAR_ACCESS_TOKEN;
  if (!token) {
    throw new Error('PEAR_ACCESS_TOKEN is not set in environment variables');
  }
  return token;
}

/**
 * Makes an authenticated fetch request to the Pear API.
 * 
 * Ensures there is a valid access token and includes it in the Authorization header.
 * 
 * @param path - API path (e.g., '/v1/positions' or '/auth/refresh')
 * @param options - Optional fetch options (method, body, headers, etc.)
 * @returns Promise<Response> from fetch
 * @throws Error if PEAR_API_BASE or PEAR_ACCESS_TOKEN is not set
 */
export async function pearFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiBase = process.env.PEAR_API_BASE;
  if (!apiBase) {
    throw new Error('PEAR_API_BASE is not set in environment variables');
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Ensure API base doesn't have trailing slash
  const baseUrl = apiBase.replace(/\/$/, '');
  const url = `${baseUrl}${normalizedPath}`;

  // Get access token
  const token = getPearAccessToken();

  // Merge headers, ensuring Authorization is set
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  // Set Content-Type to JSON if not already set and there's a body
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
