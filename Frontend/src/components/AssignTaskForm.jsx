import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AssignTaskForm = ({ activeProjectId, teamId, onTaskCreated }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Dynamically load coworkers within the same team ecosystem 
  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) return;
      setLoadingMembers(true);
      try {
        const res = await api.get(`/users?teamId=${teamId}`);
        setTeamMembers(res.data);
      } catch (err) {
        console.error('Error fetching assignable pool members:', err);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchTeam();
  }, [teamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!activeProjectId) {
      setFeedback({ type: 'error', message: 'Please select an active project cluster first.' });
      return;
    }

    try {
      const payload = { ...formData, projectId: activeProjectId };
      const res = await api.post('/tasks', payload);
      
      setFeedback({ type: 'success', message: '🎉 Task successfully dispatched!' });
      setFormData({ title: '', description: '', assignedTo: '', dueDate: '' });
      
      if (onTaskCreated) onTaskCreated(res.data);
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.message || 'Execution error delegating task.' 
      });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl text-white max-w-md w-full">
      <h3 className="text-md font-semibold text-zinc-100 mb-4 tracking-wide uppercase">
        🛡️ Admin Workspace Task Delegation
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Task Title</label>
          <input 
            type="text"
            required
            className="w-full bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Build api validation routing"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Detailed Requirements</label>
          <textarea 
            className="w-full bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500 h-20 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add specific user authorization parameters..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Assign Token To</label>
          <select
            required
            className="w-full bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          >
            <option value="">{loadingMembers ? 'Loading team network...' : '-- Pick Assignee --'}</option>
            {teamMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} — ({member.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Due Date</label>
          <input 
            type="date"
            className="w-full bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-zinc-100 hover:bg-zinc-200 text-black text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          Dispatch Assignments
        </button>
      </form>

      {feedback.message && (
        <p className={`text-xs mt-3 text-center font-medium ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
};

export default AssignTaskForm;