'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { todoApi, Todo } from '../services/api';

// Helper function to convert ISO string to datetime-local input format
const formatDateTimeForInput = (isoString: string) => {
  const date = new Date(isoString);
  return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
};

// Helper function to convert datetime-local input value to ISO string
const formatDateTimeToISO = (dateTimeString: string) => {
  return new Date(dateTimeString).toISOString();
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDateTime, setNewDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('dateTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTitle, setSearchTitle] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, [currentPage, sortBy, sortOrder, limit]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await todoApi.getAllTodos({
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
        title: searchTitle || undefined
      });
      setTodos(response.data.todos);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string) => {
    try {
      const todo = todos.find(t => t._id === id);
      if (!todo) return;

      const updatedTodo = await todoApi.updateTodo(id, {
        status: todo.status === 'pending' ? 'done' : 'pending'
      });

      setTodos(todos.map(t =>
        t._id === id ? updatedTodo : t
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      setError('Please enter a task title');
      return;
    }

    try {
      const newTodo = await todoApi.createTodo({
        title: newTask,
        content: newContent,
        status: 'pending',
        dateTime: newDateTime ? formatDateTimeToISO(newDateTime) : new Date().toISOString()
      });

      setTodos([...todos, newTodo]);
      setNewTask('');
      setNewContent('');
      setNewDateTime('');
      setSuccess('Task created successfully!');
      setError(null);
      fetchTodos();
    } catch (err) {
      setError('Failed to create todo');
      setSuccess(null);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter(todo => todo._id !== id));
      fetchTodos();
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortChange = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchTodos();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditContent(todo.content);
    setEditDateTime(formatDateTimeForInput(todo.dateTime));
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo) return;

    try {
      const updatedTodo = await todoApi.updateTodo(editingTodo._id, {
        title: editTitle,
        content: editContent,
        dateTime: formatDateTimeToISO(editDateTime)
      });

      setTodos(todos.map(t => t._id === editingTodo._id ? updatedTodo : t));
      setSuccess('Task updated successfully!');
      setError(null);
      setEditingTodo(null);
      fetchTodos();
    } catch (err) {
      setError('Failed to update todo');
      setSuccess(null);
    }
  };

  const handleCloseEdit = () => {
    setEditingTodo(null);
    setError(null);
  };

  const handleTodoClick = async (id: string) => {
    try {
      setIsLoadingDetails(true);
      const todo = await todoApi.getTodo(id);
      setSelectedTodo(todo);
      setEditTitle(todo.title);
      setEditContent(todo.content);
      setEditDateTime(formatDateTimeForInput(todo.dateTime));
      setEditingTodo(todo);
    } catch (err) {
      setError('Failed to fetch todo details');
      setSuccess(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-6">My Tasks</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
              {success}
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                  value={searchTitle}
                  onChange={handleSearch}
                  onKeyPress={handleKeyPress}
                />
                <svg className="w-5 h-5 text-purple-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={handleSearchSubmit}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSortChange('dateTime')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  sortBy === 'dateTime'
                    ? 'bg-purple-100 text-purple-700 shadow-inner'
                    : 'bg-white/50 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                Date/Time {sortBy === 'dateTime' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('title')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  sortBy === 'title'
                    ? 'bg-purple-100 text-purple-700 shadow-inner'
                    : 'bg-white/50 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('status')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  sortBy === 'status'
                    ? 'bg-purple-100 text-purple-700 shadow-inner'
                    : 'bg-white/50 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="group bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-purple-200"
                onClick={() => handleTodoClick(todo._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-purple-300 text-purple-600 focus:ring-purple-500"
                        checked={todo.status === 'done'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(todo._id);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium ${todo.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {todo.title}
                      </h3>
                      {todo.content && (
                        <p className="mt-1 text-gray-600 text-sm line-clamp-2">{todo.content}</p>
                      )}
                      {todo.dateTime && (
                        <p className="mt-2 text-sm text-purple-600">
                          {new Date(todo.dateTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="p-2 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(todo);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTodo(todo._id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Items per page:</span>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="p-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Add New Task Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">Add New Task</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <textarea
              placeholder="Task description..."
              className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-y bg-white/50"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="flex items-center space-x-4">
              <input
                type="datetime-local"
                className="flex-1 p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
              />
              <button
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={handleAddTask}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTodo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-purple-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Edit Task</h3>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] resize-y bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date/Time</label>
                  <input
                    type="datetime-local"
                    value={editDateTime}
                    onChange={(e) => setEditDateTime(e.target.value)}
                    className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={handleCloseEdit}
                    className="px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTodo}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
