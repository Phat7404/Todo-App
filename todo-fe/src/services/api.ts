const API_BASE_URL = '/api';  // This will be proxied to http://localhost:3001/api

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: {
        todos: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface Todo {
    _id: string;
    title: string;
    content: string;
    status: 'pending' | 'done';
    dateTime: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: 'pending' | 'done';
    title?: string;
    dateTime?: string;
}

export const todoApi = {
    // Get all todo list
    getAllTodos: async (params?: PaginationParams): Promise<ApiResponse<Todo>> => {
        try {
            const queryParams = new URLSearchParams();
            if (params) {
                if (params.page) queryParams.append('page', params.page.toString());
                if (params.limit) queryParams.append('limit', params.limit.toString());
                if (params.sortBy) queryParams.append('sortBy', params.sortBy);
                if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
                if (params.status) queryParams.append('status', params.status);
                if (params.title) queryParams.append('title', params.title);
                if (params.dateTime) queryParams.append('dateTime', params.dateTime);
            }
            
            const queryString = queryParams.toString();
            const url = `${API_BASE_URL}/todos${queryString ? `?${queryString}` : ''}`;
            
            console.log('Fetching todos from:', url);
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch todos: ${response.status} ${errorText}`);
            }
            
            const responseData: ApiResponse<Todo> = await response.json();
            console.log('Received todos:', responseData);
            return responseData;
        } catch (error) {
            console.error('Error in getAllTodos:', error);
            throw error;
        }
    },

    // Get one todo
    getTodo: async (id: string): Promise<Todo> => {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch todo: ${response.status} ${errorText}`);
            }
            const responseData = await response.json();
            return responseData.data; // The API returns the todo directly in data
        } catch (error) {
            console.error('Error in getTodo:', error);
            throw error;
        }
    },

    // Create a new todo
    createTodo: async (todo: Omit<Todo, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Todo> => {
        try {
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(todo),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create todo: ${response.status} ${errorText}`);
            }
            const responseData = await response.json();
            return responseData.data; // The API returns the created todo directly in data
        } catch (error) {
            console.error('Error in createTodo:', error);
            throw error;
        }
    },

    // Update a todo
    updateTodo: async (id: string, todo: Partial<Todo>): Promise<Todo> => {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(todo),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update todo: ${response.status} ${errorText}`);
            }
            const responseData = await response.json();
            return responseData.data; // The API returns the updated todo directly in data
        } catch (error) {
            console.error('Error in updateTodo:', error);
            throw error;
        }
    },

    // Delete a todo
    deleteTodo: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete todo: ${response.status} ${errorText}`);
            }
        } catch (error) {
            console.error('Error in deleteTodo:', error);
            throw error;
        }
    },
}; 