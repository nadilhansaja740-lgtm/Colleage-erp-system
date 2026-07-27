import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types';
import { saveAnnouncement, deleteAnnouncement, subscribeToPath } from '../../firebase/db';
import { Megaphone, Plus, Trash2, X, AlertCircle } from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { role, user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    targetRole: 'All',
    important: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToPath<Record<string, Announcement>>('announcements', (data) => {
      if (data) {
        const list = Object.values(data);
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAnnouncements(list);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setSaving(true);
    const newAnn: Announcement = {
      id: `ANN-${Date.now().toString().slice(-6)}`,
      title: formData.title!,
      content: formData.content!,
      targetRole: formData.targetRole || 'All',
      date: new Date().toISOString().split('T')[0],
      author: user?.name || 'Dean Office',
      important: formData.important || false
    };

    const ok = await saveAnnouncement(newAnn);
    setSaving(false);

    if (ok) {
      setIsAddOpen(false);
      setFormData({ title: '', content: '', targetRole: 'All', important: false });
    } else {
      alert('Failed to post announcement to Firebase Realtime Database');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this announcement notice?')) {
      await deleteAnnouncement(id);
    }
  };

  // Filter based on role
  const visibleAnnouncements = announcements.filter((ann) => {
    if (role === 'admin') return true;
    if (ann.targetRole === 'All') return true;
    if (role === 'teacher' && ann.targetRole === 'Teacher') return true;
    if (role === 'student' && ann.targetRole === 'Student') return true;
    return false;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Megaphone className="w-6 h-6 text-indigo-600" />
            <span>Campus Announcements & Notices</span>
          </h1>
          <p className="text-xs text-slate-500">
            Realtime institutional circulars and department broadcasts.
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {visibleAnnouncements.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
            No active announcements.
          </div>
        ) : (
          visibleAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border shadow-2xs space-y-2 transition-all ${
                ann.important
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {ann.important && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white font-extrabold text-[10px] rounded-full uppercase">
                        Important
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded border border-slate-200">
                      Target: {ann.targetRole}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{ann.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                </div>

                {role === 'admin' && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                Published by: <span className="text-slate-800">{ann.author}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Announcement Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold">New Announcement Notice</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. Campus Placement Drive 2026"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={formData.targetRole || 'All'}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="All">All Campus Users</option>
                  <option value="Teacher">Teachers Only</option>
                  <option value="Student">Students Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="Enter notice details..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="important"
                  checked={formData.important || false}
                  onChange={(e) => setFormData({ ...formData, important: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="important" className="font-semibold text-slate-700">
                  Mark as High Priority / Important Notice
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Posting...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
