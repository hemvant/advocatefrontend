import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listTasks, updateTask, markTaskComplete, reassignTask } from '../../services/taskApi';
import { getEmployees } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function TasksPage() {
  const { isOrgAdmin } = useOrgAuth();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING', due_date: '', assigned_to: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      if (priority) params.priority = priority;
      const { data: res } = await listTasks(params);
      setData(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status, priority]);
  useEffect(() => {
    if (isOrgAdmin) getEmployees().then(({ data: d }) => setEmployees(d.data || [])).catch(() => {});
  }, [isOrgAdmin]);

  const handleComplete = async (task) => {
    try {
      await markTaskComplete(task.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const openEdit = (task) => {
    setModal({ type: 'edit', id: task.id });
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'PENDING',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
      assigned_to: task.assigned_to || ''
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!modal?.id) return;
    try {
      await updateTask(modal.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null
      });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!modal?.id) return;
    try {
      await reassignTask(modal.id, form.assigned_to ? parseInt(form.assigned_to, 10) : null);
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Reassign failed');
    }
  };

  const openReassign = (task) => {
    setModal({ type: 'reassign', id: task.id });
    setForm({ assigned_to: task.assigned_to ? String(task.assigned_to) : '' });
  };

  const isOverdue = (task) => {
    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
    if (!task.due_date) return false;
    return task.due_date < new Date().toISOString().slice(0, 10);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Tasks</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">All</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>
        ) : data.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No tasks. Create tasks from a case page.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((task) => (
              <li key={task.id} className="px-6 py-4">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.description || '—'}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Link to={`/cases/${task.case_id}`} className="text-sm text-primary hover:underline">{task.Case?.case_title || 'Case'}</Link>
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-100">{task.priority}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : task.status === 'CANCELLED' ? 'bg-gray-100' : 'bg-amber-100 text-amber-800'}`}>{task.status.replace('_', ' ')}</span>
                      {isOverdue(task) && <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">Overdue</span>}
                      {task.due_date && <span className="text-sm text-gray-500">Due: {task.due_date}</span>}
                      {task.Assignee && <span className="text-sm text-gray-500">→ {task.Assignee.name}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                      <button type="button" onClick={() => handleComplete(task)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Complete</button>
                    )}
                    <button type="button" onClick={() => openEdit(task)} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                    {isOrgAdmin && <button type="button" onClick={() => openReassign(task)} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">Reassign</button>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">Total {pagination.total}</span>
            <div className="flex gap-2">
              <button type="button" disabled={pagination.page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
              <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            {modal.type === 'edit' && (
              <>
                <h2 className="text-lg font-semibold text-primary mb-4">Edit task</h2>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
                    <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Save</button>
                    <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  </div>
                </form>
              </>
            )}
            {modal.type === 'reassign' && (
              <>
                <h2 className="text-lg font-semibold text-primary mb-4">Reassign task</h2>
                <form onSubmit={handleReassign} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                    <select value={form.assigned_to} onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                      <option value="">Unassigned</option>
                      {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Reassign</button>
                    <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
