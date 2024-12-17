import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState("");

  useEffect(() => {
    const fetchtodos = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:4001/todo/fetch", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        setTodos(response.data.todos);
        setError(null);
      } catch (error) {
        setError("Failed to fetch todos");
      } finally {
        setLoading(false);
      }
    };
    fetchtodos();
  }, []);

  const todoCreate = async () => {
    if (!newTodo) return;
    try {
      const response = await axios.post(
        "http://localhost:4001/todo/create",
        { text: newTodo, completed: false },
        { withCredentials: true }
      );
      setTodos([...todos, response.data.newTodo]);
      setNewTodo("");
    } catch (error) {
      setError("Failed to create todo");
    }
  };

  const todoStatus = async (id) => {
    const todo = todos.find((t) => t._id === id);
    try {
      const response = await axios.put(
        `http://localhost:4001/todo/update/${id}`,
        { ...todo, completed: !todo.completed },
        { withCredentials: true }
      );
      setTodos(todos.map((t) => (t._id === id ? response.data.todo : t)));
    } catch (error) {
      setError("Failed to update todo status");
    }
  };

  const todoEdit = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:4001/todo/update/${id}`,
        { text: editingTodoText },
        { withCredentials: true }
      );
      setTodos(todos.map((t) => (t._id === id ? response.data.todo : t)));
      setEditingTodoId(null);
      setEditingTodoText("");
    } catch (error) {
      setError("Failed to edit todo");
    }
  };

  const todoDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4001/todo/delete/${id}`, {
        withCredentials: true,
      });
      setTodos(todos.filter((t) => t._id !== id));
    } catch (error) {
      setError("Failed to delete todo");
    }
  };

  const navigateTo = useNavigate();
  const logout = async () => {
    try {
      await axios.get("http://localhost:4001/user/logout", {
        withCredentials: true,
      });
      toast.success("User logged out successfully");
      navigateTo("/login");
      localStorage.removeItem("jwt");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center  bg-banner-image bg-cover h-[100vh]">
    <div >
    <div className="w-full max-w-md  bg-current   bg-gray-500  p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Todo App
      </h1>
      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Add a new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && todoCreate()}
          className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={todoCreate}
          className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition duration-300"
        >
          Add
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold">{error}</div>
      ) : (
        <ul className="space-y-4">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className={`flex justify-between items-center p-4 rounded-md ${
                todo.completed ? "bg-green-50" : "bg-gray-100"
              }`}
            >
              {editingTodoId === todo._id ? (
                <div className="flex-grow flex items-center">
                  <input
                    type="text"
                    value={editingTodoText}
                    onChange={(e) => setEditingTodoText(e.target.value)}
                    className="flex-grow p-2 border rounded-md focus:outline-none"
                  />
                  <button
                    onClick={() => todoEdit(todo._id)}
                    className="ml-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex-grow flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => todoStatus(todo._id)}
                    className="mr-4"
                  />
                  <span
                    className={`text-lg ${
                      todo.completed ? "line-through text-gray-600" : ""
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setEditingTodoId(todo._id);
                    setEditingTodoText(todo.text);
                  }}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => todoDelete(todo._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={logout}
        className="block mx-auto mt-8 bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition duration-300"
      >
        Logout
      </button>
    </div>
    </div>
    </div>
  );
}

export default Home;
