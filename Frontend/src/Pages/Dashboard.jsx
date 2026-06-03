import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { socket } from "../utils/socket";
import toast from "react-hot-toast";
import { useRef } from "react";

const Dashboard = () => {
  const { mongoUser, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Kanban & Team States
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  // Safely check if the user is an Admin or Manager (ignores case)
  const isPrivileged =
    mongoUser?.role && mongoUser.role.toUpperCase() !== "MEMBER";

  useEffect(() => {
    if (mongoUser) {
      fetchWorkspaceData();

      socket.on("receive-message", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on("task-updated", () => {
        if (selectedProject) fetchTasks(selectedProject._id);
      });
    }
    return () => {
      socket.off("receive-message");
      socket.off("task-updated");
    };
  }, [mongoUser]);

  const fetchWorkspaceData = async () => {
    try {
      const projRes = await api.get("/projects");
      setProjects(projRes.data);
    } catch (err) {
      console.log("Projects error", err);
    }

    try {
      const msgRes = await api.get("/messages");
      setMessages(msgRes.data);
    } catch (err) {
      console.log("Messages error", err);
    }

    try {
      const memberRes = await api.get("/users");
      console.log("MEMBERS:", memberRes.data);
      setTeamMembers(memberRes.data);
    } catch (err) {
      console.log("Users error", err);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading task entities:", err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!isPrivileged) {
      toast.error("Access denied");
      return;
    }

    try {
      const res = await api.post("/projects", {
        name: projectName,
        description: projectDesc,
      });

      const newProject = res.data.project || res.data;

      setProjects((prev) => [...prev, newProject]);

      setProjectName("");
      setProjectDesc("");

      toast.success("Project created successfully 🚀");
    } catch (err) {
      console.error(err);
      toast.error("Project creation failed");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const res = await api.post("/messages", {
        content: newMessage,
      });

      socket.emit("send-message", {
        ...res.data,
        teamId: "global",
      });

      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProject || !taskTitle) return;

    // If Admin/Manager picked someone, use that ID. Otherwise default to themselves.
    const targetAssignee =
      isPrivileged && assigneeId ? assigneeId : mongoUser?._id;

    try {
      const res = await api.post("/tasks", {
        title: taskTitle,
        description: taskDesc,
        projectId: selectedProject._id,
        assignedTo: targetAssignee,
        status: "todo",
      });
      setTasks((prev) => [...prev, res.data]);

      toast.success("Task created successfully");
      socket.emit("task-change", selectedProject._id);
      setTaskTitle("");
      setTaskDesc("");
      setAssigneeId("");
    } catch (err) {
      console.error("Task registration failed:", err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);

      setProjects((prev) =>
        prev.filter((project) => project._id !== projectId),
      );

      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
      }

      toast.success("Project deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    }
  };
  const handleClearChat = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all messages?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete("/messages/clear");

      setMessages([]);

      toast.success("Chat cleared successfully");
    } catch (err) {
      toast.error("Failed to clear chat");
      console.error(err);
    }
  };
  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);

      setTasks((prev) => prev.filter((task) => task._id !== taskId));

      toast.success("Task deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task");
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(
        tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
      );
      if (selectedProject) socket.emit("task-change", selectedProject._id);
    } catch (err) {
      console.error("Status modification exception:", err);
    }
  };

  useEffect(() => {
    const receiveHandler = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.off("receive-message");
    socket.on("receive-message", receiveHandler);

    return () => {
      socket.off("receive-message", receiveHandler);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 font-sans antialiased overflow-hidden">
      {/* Sidebar Control Hub */}
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between p-5">
        <div className="space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-bold tracking-tight">TaskQ Portal</h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Role: {mongoUser?.role}
            </p>
          </div>

          {isPrivileged && (
            <form
              onSubmit={handleCreateProject}
              className="space-y-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                Create Project
              </span>
              <input
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-zinc-600"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-zinc-600"
              />
              <button
                type="submit"
                className="w-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-950 p-2.5 rounded-lg transition-colors hover:cursor-pointer"
              >
                Initialize
              </button>
            </form>
          )}

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block px-1">
              Active Projects
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projects.length === 0 && (
                <p className="text-xs text-zinc-500 px-1">No projects found.</p>
              )}
              {projects.map((proj) => (
                <div key={proj._id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProject(proj);
                      fetchTasks(proj._id);
                    }}
                    className={`flex-1 text-left text-sm px-3 py-2.5 rounded-lg transition-all border ${
                      selectedProject?._id === proj._id
                        ? "bg-zinc-800 border-zinc-700 text-white"
                        : "hover:bg-zinc-800/50 border-transparent text-zinc-400"
                    }`}
                  >
                    📁 {proj.name}
                  </button>

                  {isPrivileged && (
                    <button
                      onClick={() => handleDeleteProject(proj._id)}
                      className="text-red-500 hover:text-red-400 hover:cursor-pointer scale-1.05"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full text-xs font-medium border border-zinc-800 hover:bg-zinc-800/60 p-2.5 rounded-lg transition-all text-zinc-400 hover:text-white hover:cursor-pointer "
        >
          Sign Out
        </button>
      </div>

      {/* Main Kanban Workspace Column */}
      <div className="flex-1 flex flex-col bg-zinc-950 border-r border-zinc-800 overflow-y-auto p-6">
        {selectedProject ? (
          <div className="space-y-6 h-full flex flex-col">
            <div className="border-b border-zinc-800 pb-4 shrink-0">
              <h1 className="text-2xl font-bold tracking-tight">
                {selectedProject.name}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {selectedProject.description ||
                  "No overview summary specified."}
              </p>
            </div>

            {/* Quick Task Creation Entry Line */}
            <form
              onSubmit={handleCreateTask}
              className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl flex items-center gap-3 shrink-0"
            >
              <input
                type="text"
                placeholder="Task objective string..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="flex-1 text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-zinc-600"
                required
              />

              {/* Dropdown ONLY renders if the user is an Admin or Manager */}
              {isPrivileged && (
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-48 text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-300 focus:outline-none focus:border-zinc-600"
                >
                  <option value="">Assign to...</option>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name || m.email}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No team members found
                    </option>
                  )}
                </select>
              )}

              <button
                type="submit"
                className="text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-5 py-2.5 rounded-lg transition-colors hover:cursor-pointer"
              >
                Add Task
              </button>
            </form>

            <div className="flex-1 grid grid-cols-3 gap-4 min-h-[350px]">
              {["todo", "in-progress", "done"].map((status) => (
                <div
                  key={status}
                  className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 flex flex-col"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2 mb-3 block capitalize">
                    {status.replace("-", " ")}
                  </span>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {tasks
                      .filter((t) => t.status === status)
                      .map((task) => (
                        <div
                          key={task._id}
                          className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-3 shadow-sm"
                        >
                          <h4 className="text-xs font-bold text-white leading-relaxed">
                            {task.title}
                          </h4>
                          <div className="flex justify-between items-center pt-1">
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-red-400 text-xs hover:text-red-300 hover:cursor-pointer"
                            >
                              Delete
                            </button>

                            <div className="flex gap-1">
                              {status !== "todo" && (
                                <button
                                  onClick={() =>
                                    moveTask(
                                      task._id,
                                      status === "done"
                                        ? "in-progress"
                                        : "todo",
                                    )
                                  }
                                  className="text-[10px] border border-zinc-800 text-zinc-400 px-2 py-1 rounded hover:bg-zinc-800"
                                >
                                  ←
                                </button>
                              )}

                              {status !== "done" && (
                                <button
                                  onClick={() =>
                                    moveTask(
                                      task._id,
                                      status === "todo"
                                        ? "in-progress"
                                        : "done",
                                    )
                                  }
                                  className="text-[10px] border border-zinc-800 text-zinc-400 px-2 py-1 rounded hover:bg-zinc-800"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="m-auto text-center text-zinc-500">
            <p className="text-sm">
              Select an active workspace cluster from the panel to view tasks.
            </p>
          </div>
        )}
      </div>

      {/* Right Column Component: Embedded Live Chat Stream */}
      <div
        className={`
    bg-zinc-950 border-l border-zinc-800
    transition-all duration-500 ease-in-out
    ${chatOpen ? "w-80" : "w-14"}
    flex flex-col
    overflow-hidden
  `}
      >
        <div className="p-4 border-b border-zinc-800 shrink-0 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Team Stream Chat
          </h3>

          <button
            onClick={handleClearChat}
            className="text-xs px-3 py-1 rounded bg-red-700 hover:bg-red-800 text-white hover:cursor-pointer"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex flex-col max-w-[85%] ${msg.senderId?.email === mongoUser?.email ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <span className="text-[10px] text-zinc-500 mb-0.5 font-mono">
                {msg.senderId?.name || "User"}
              </span>
              <div
                className={`p-2.5 rounded-xl text-xs leading-relaxed ${msg.senderId?.email === mongoUser?.email ? "bg-zinc-100 text-zinc-950 rounded-tr-none" : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none"}`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef}></div>
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-zinc-600"
            required
          />
          <button
            type="submit"
            className="text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg transition-colors border border-zinc-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
