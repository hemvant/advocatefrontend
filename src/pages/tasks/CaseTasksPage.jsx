import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listTasksByCase, createTask, updateTask, markTaskComplete, reassignTask } from '../../services/taskApi';
import { getCase } from '../../services/caseApi';
import { getEmployees } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export default function CaseTasksPage() {
  const { id: caseId } = useParams();
  const { isOrgAdmin } = useOrgAuth();
  const [caseRecord, setCaseRecord] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', due_date: '', assigned_to: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING', due_date: '' });

  const load = () => {
    setLoading(true);
    getCase(caseId)
      .then(({ data }) => setCaseRecord(data.data))
      .catch(() => setError('Case not found'));
    listTasksByCase(caseId)
      .then(({ data }) => setTasks(data.data || []))
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [caseId]);
  useEffect(() => {
    if (isOrgAdmin) getEmployees().then(({ data: d }) => setEmployees(d.data || [])).catch(() => {});
  }, [isOrgAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await createTask({
        case_id: parseInt(caseId, 10),
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_to: form.assigned_to ? parseInt(form.assigned_to, 10) : null
      });
      setForm({ title: '', description: '', priority: 'MEDIUM', due_date: '', assigned_to: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await updateTask(editId, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        priority: editForm.priority,
        status: editForm.status,
        due_date: editForm.due_date || null
      });
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleComplete = async (task) => {
    try {
      await markTaskComplete(task.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleReassign = async (taskId, assignedTo) => {
    try {
      await reassignTask(taskId, assignedTo ? parseInt(assignedTo, 10) : null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Reassign failed');
    }
  };

  const isOverdue = (task) => {
    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
    if (!task.due_date) return false;
    return task.due_date < new Date().toISOString().slice(0, 10);
  };

  if (loading && !caseRecord) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;
  if (error && !caseRecord) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <Link to={'/cases/' + caseId} className="text-sm text-primary hover:underline mb-2 inline-block">← Case</Link>
          <h1 className="text-2xl font-bold text-primary">Tasks · {caseRecord?.case_title || 'Case'}</h1>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add task</button>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">New task</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
              {isOrgAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                  <select value={form.assigned_to} onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                    <option value="">Unassigned</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {tasks.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No tasks for this case.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.id} className="px-6 py-4">
                {editId === task.id ? (
                  <form onSubmit={handleUpdate} className="space-y-3">
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border rounded" required />
                    <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded" />
                    <div className="flex flex-wrap gap-2">
                      <select value={editForm.priority} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))} className="px-3 py-2 border rounded">
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className="px-3 py-2 border rounded">
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <input type="date" value={editForm.due_date} onChange={(e) => setEditForm((f) => ({ ...f, due_date: e.target.value }))} className="px-3 py-2 border rounded" />
                      <button type="submit" className="px-3 py-2 bg-primary text-white rounded text-sm">Save</button>
                      <button type="button" onClick={() => setEditId(null)} className="px-3 py-2 border rounded text-sm">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="px-2 py-0.5 text-xs rounded bg-gray-100">{task.priority}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${task.status === 'COMPLETED' ? 'bg-green-100' : 'bg-amber-100'}`}>{task.status}</span>
                        {isOverdue(task) && <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">Overdue</span>}
                        {task.due_date && <span className="text-sm text-gray-500">Due: {task.due_date}</span>}
                        {task.Assignee && <span className="text-sm text-gray-500">→ {task.Assignee.name}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                        <button type="button" onClick={() => handleComplete(task)} className="px-3 py-1 text-sm bg-green-600 text-white rounded">Complete</button>
                      )}
                      <button type="button" onClick={() => { setEditId(task.id); setEditForm({ title: task.title, description: task.description || '', priority: task.priority, status: task.status, due_date: task.due_date ? task.due_date.slice(0, 10) : '' }); }} className="px-3 py-1 text-sm border rounded">Edit</button>
                      {isOrgAdmin && (
                        <select value={task.assigned_to || ''} onChange={(e) => handleReassign(task.id, e.target.value)} className="px-2 py-1 text-sm border rounded">
                          <option value="">Unassigned</option>
                          {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
