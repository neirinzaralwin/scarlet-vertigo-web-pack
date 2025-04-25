import { getAuthCookie } from '@/utils/authCookies';
import { useAuthError } from '@/context/AuthErrorContext'; // Import the hook

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3031';

// Define a custom fetch function that includes the auth token and error handling
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAuthCookie();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json'); // Ensure content type is set

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Don't trigger modal directly here as hooks can't be called outside components.
        // We'll handle this by throwing a specific error type or checking status in calling code.
        // For simplicity now, we'll let the calling service handle the status check.
        // A more robust solution might involve a dedicated event emitter or state management.
        console.error('API call resulted in 401 Unauthorized');
        // Throw an error or return a specific structure to indicate unauthorized
        // throw new Error('Unauthorized'); // Or handle in the calling function
    }

    return response;
}

// Example of how a service might use fetchWithAuth and handle 401
// This part is illustrative and should be adapted into your actual services
/*
import { useAuthError } from '@/context/AuthErrorContext';

function MyComponent() {
    const { showUnauthorizedModal } = useAuthError();

    const fetchData = async () => {
        try {
            const response = await fetchWithAuth('/some-protected-endpoint');
            if (response.status === 401) {
                showUnauthorizedModal();
                return; // Stop processing
            }
            if (!response.ok) {
                // Handle other errors
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            // Process data
        } catch (error) {
            console.error('Fetch error:', error);
            // Handle other network or parsing errors
        }
    };

    // ... rest of component
}
*/

// You can export fetchWithAuth or create specific API client functions using it.
export const apiClient = {
    get: (url: string, options?: RequestInit) => fetchWithAuth(url, { ...options, method: 'GET' }),
    post: (url: string, body: any, options?: RequestInit) => fetchWithAuth(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (url: string, body: any, options?: RequestInit) => fetchWithAuth(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (url: string, options?: RequestInit) => fetchWithAuth(url, { ...options, method: 'DELETE' }),
    // Add other methods like PATCH as needed
};

// Function to handle API errors, including triggering the modal
export const handleApiError = async (response: Response, showUnauthorizedModal: () => void) => {
    if (response.status === 401) {
        showUnauthorizedModal();
        // Return a specific value or throw to stop further processing in the caller
        return { error: true, status: 401, message: 'Unauthorized' };
    }

    if (!response.ok) {
        try {
            const errorData = await response.json();
            const message = errorData.message || `Request failed with status ${response.status}`;
            console.error('API Error:', message);
            return { error: true, status: response.status, message };
        } catch (e) {
            // Handle cases where the error response is not JSON
            console.error('API Error:', response.statusText);
            return { error: true, status: response.status, message: response.statusText };
        }
    }

    return { error: false }; // Indicate no error occurred that needs special handling here
};
