import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, CheckCircle2, Circle, Clock, Plus } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // Create task states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const projRes = await api.get(`/projects/${id}`); // Adjust endpoint to match backend route
      setProject(projRes.data);
      
      const taskRes = await api.get(`/tasks?projectId=${id}`);
      setTasks(taskRes.data);
    } catch (err) {
      console.error('Error fetching dashboard cluster details', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await api.post('/tasks', {
        title,
        description,
        status: 'todo',
        projectId: id
      });
      setTasks([...tasks, res.data]);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error submitting payload', err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Failed to patch task metrics', err);
    }
  };

  const columns = [
    { id: 'todo', name: 'To Do', icon: <Circle className="h-4 w-4 text-slate-500" /> },
    { id: 'in_progress', name: 'In Progress', icon: <Clock className="h-4 w-4 text-blue-400" /> },
    { id: 'done', name: 'Completed', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation Subheader */}
      <div className="border-b border-slate-800 bg-slate-900/30 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">{project?.title || 'Loading Board Configuration...'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{project?.description || 'Synchronized Scrum metrics workspace.'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Simple Inline Task Builder */}
        <form onSubmit={handleAddTask} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task objectives..." className="flex-1 min-w-[200px] bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500" required />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Sprint parameters (Optional)..." className="flex-1 min-w-[250px] bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </form>

        {/* Kanban Matrix Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[600px]">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 font-semibold text-sm tracking-wide text-slate-300 uppercase">
                {col.icon}
                <span>{col.name}</span>
                <span className="ml-auto bg-slate-800 px-2 py-0.5 rounded-md text-xs text-slate-400 font-mono">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {tasks.filter(t => t.status === col.id).map((task) => (
                  <div key={task._id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700/80 transition-all space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{task.title}</h4>
                      {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>}
                    </div>
                    
                    {/* Dynamic Action Buttons inside Card */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end gap-1.5">
                      {col.id !== 'todo' && (
                        <button onClick={() => updateTaskStatus(task._id, col.id === 'done' ? 'in_progress' : 'todo')} className="text-[10px] font-medium bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 px-2 py-1 rounded">
                          Move Back
                        </button>
                      )}
                      {col.id !== 'done' && (
                        <button onClick={() => updateTaskStatus(task._id, col.id === 'todo' ? 'in_progress' : 'done')} className="text-[10px] font-medium bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                          Advance →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;