import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  RefreshCw,
  AlertTriangle,
  FolderPlus,
  CheckCircle2,
  Clock,
  Sparkles,
  ListTodo,
} from 'lucide-react';
import { GoogleTaskItem, GoogleTaskList } from '../types';
import { googleTasksService } from '../services/googleTasks';

interface GoogleTasksPanelProps {
  isAuthenticated: boolean;
  userEmail: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onTaskCreatedByVoice?: (taskTitle: string) => void;
}

export const GoogleTasksPanel: React.FC<GoogleTasksPanelProps> = ({
  isAuthenticated,
  userEmail,
  onSignIn,
  onSignOut,
}) => {
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for new task
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Confirmation modal state for destructive operations (Google Workspace policy)
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<GoogleTaskItem | null>(null);
  const [confirmClearCompleted, setConfirmClearCompleted] = useState<boolean>(false);
  const [confirmDeleteList, setConfirmDeleteList] = useState<GoogleTaskList | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // New list creation state
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Fetch task lists on auth or mount
  useEffect(() => {
    if (isAuthenticated) {
      loadTaskLists();
    } else {
      setTaskLists([]);
      setTasks([]);
      setSelectedListId('');
    }
  }, [isAuthenticated]);

  // Fetch tasks when selected list changes
  useEffect(() => {
    if (isAuthenticated && selectedListId) {
      loadTasks(selectedListId);
    }
  }, [isAuthenticated, selectedListId]);

  const loadTaskLists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const lists = await googleTasksService.getTaskLists();
      setTaskLists(lists);
      if (lists.length > 0) {
        if (!selectedListId || !lists.some((l) => l.id === selectedListId)) {
          setSelectedListId(lists[0].id);
        }
      } else {
        setSelectedListId('');
        setTasks([]);
      }
    } catch (err: any) {
      console.error('Failed to load task lists:', err);
      setError(err?.message || 'Google Tasks စာရင်းများ ရယူ၍မရပါ');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async (listId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await googleTasksService.getTasks(listId);
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      setError(err?.message || 'လုပ်ငန်းဆောင်တာများ ရယူ၍မရပါ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedListId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const created = await googleTasksService.createTask(selectedListId, {
        title: newTitle.trim(),
        notes: newNotes.trim() || undefined,
        due: newDueDate || undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
      setNewNotes('');
      setNewDueDate('');
    } catch (err: any) {
      console.error('Failed to create task:', err);
      setError(err?.message || 'လုပ်ငန်းအသစ် ထည့်သွင်း၍မရပါ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: GoogleTaskItem) => {
    if (!selectedListId) return;
    const targetStatus = task.status === 'completed' ? 'needsAction' : 'completed';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: targetStatus } : t))
    );

    try {
      await googleTasksService.updateTaskStatus(selectedListId, task.id, targetStatus);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      setError(err?.message || 'လုပ်ငန်းအခြေအနေ ပြောင်းလဲ၍မရပါ');
    }
  };

  const executeDeleteTask = async () => {
    if (!confirmDeleteTask || !selectedListId) return;
    try {
      setIsDeleting(true);
      await googleTasksService.deleteTask(selectedListId, confirmDeleteTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== confirmDeleteTask.id));
      setConfirmDeleteTask(null);
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setError(err?.message || 'လုပ်ငန်း ဖျက်၍မရပါ');
    } finally {
      setIsDeleting(false);
    }
  };

  const executeClearCompleted = async () => {
    if (!selectedListId) return;
    try {
      setIsDeleting(true);
      await googleTasksService.clearCompletedTasks(selectedListId);
      setTasks((prev) => prev.filter((t) => t.status !== 'completed'));
      setConfirmClearCompleted(false);
    } catch (err: any) {
      console.error('Failed to clear completed tasks:', err);
      setError(err?.message || 'ပြီးစီးပြီးသား လုပ်ငန်းများ ရှင်းထုတ်၍မရပါ');
    } finally {
      setIsDeleting(false);
    }
  };

  const executeCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      setIsSubmitting(true);
      const createdList = await googleTasksService.createTaskList(newListTitle.trim());
      setTaskLists((prev) => [...prev, createdList]);
      setSelectedListId(createdList.id);
      setNewListTitle('');
      setIsCreatingList(false);
    } catch (err: any) {
      console.error('Failed to create task list:', err);
      setError(err?.message || 'စာရင်းအသစ် ဖွင့်၍မရပါ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteList = async () => {
    if (!confirmDeleteList) return;
    try {
      setIsDeleting(true);
      await googleTasksService.deleteTaskList(confirmDeleteList.id);
      const remaining = taskLists.filter((l) => l.id !== confirmDeleteList.id);
      setTaskLists(remaining);
      if (remaining.length > 0) {
        setSelectedListId(remaining[0].id);
      } else {
        setSelectedListId('');
        setTasks([]);
      }
      setConfirmDeleteList(null);
    } catch (err: any) {
      console.error('Failed to delete task list:', err);
      setError(err?.message || 'စာရင်းဖျက်၍မရပါ');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status === 'needsAction';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'needsAction').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const currentListName = taskLists.find((l) => l.id === selectedListId)?.title || 'My Tasks';

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 sm:p-6 rounded-2xl bg-[#170e07]/95 border border-amber-900/60 shadow-[0_0_35px_rgba(245,158,11,0.15)] backdrop-blur-md">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-900/40">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-xl font-bold font-bagan text-amber-200">
              Google Tasks အလုပ်စာရင်း စီမံခန့်ခွဲမှု (Workspace Integration)
            </h2>
          </div>
          <p className="text-xs text-amber-300/80 font-myanmar mt-1">
            သင့် Google Account ရှိ Tasks များကို ကြည့်ရှုခြင်း၊ အသစ်ထည့်ခြင်း၊ ပြီးစီးကြောင်း မှတ်သားခြင်းနှင့် စီမံခြင်း
          </p>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => selectedListId && loadTasks(selectedListId)}
              disabled={isLoading}
              className="p-2 rounded-xl text-amber-400 hover:bg-stone-800 transition-colors cursor-pointer border border-amber-950"
              title="စာရင်း ပြန်လည်ရယူရန်"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Auth Status / Sign-in Section */}
      <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-amber-950">
        {isAuthenticated ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-amber-200 font-medium">
                Google Tasks ချိတ်ဆက်ထားသည်: <strong className="text-amber-400">{userEmail}</strong>
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="px-3 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-stone-300 font-myanmar">
              သင့် Google Tasks နှင့် တိုက်ရိုက် ချိတ်ဆက်ရန် Google Account ဖြင့် Sign in ဝင်ရောက်ပါ:
            </span>

            {/* Official Google Sign-In Button compliant with guidelines */}
            <button
              onClick={onSignIn}
              className="flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl shadow-md border border-gray-300 cursor-pointer transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-stone-400 hover:text-stone-200 text-xs underline cursor-pointer ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {isAuthenticated && (
        <>
          {/* List Selector & Stats Bar */}
          <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-black/30 border border-amber-950">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-300 font-myanmar font-semibold">စာရင်း ရွေးချယ်မှု:</span>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="bg-[#120a05] text-amber-200 text-xs px-3 py-1.5 rounded-lg border border-amber-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {taskLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsCreatingList(true)}
                className="p-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-xs flex items-center gap-1 cursor-pointer"
                title="စာရင်းအသစ် ဖွင့်ရန်"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span className="text-[11px] font-myanmar">စာရင်းသစ်</span>
              </button>

              {taskLists.length > 1 && (
                <button
                  onClick={() => {
                    const current = taskLists.find((l) => l.id === selectedListId);
                    if (current) setConfirmDeleteList(current);
                  }}
                  className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-950 border border-stone-800 hover:border-rose-700 text-stone-400 hover:text-rose-300 text-xs cursor-pointer"
                  title="ဤစာရင်းကို ဖျက်ရန်"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-stone-300">
                စုစုပေါင်း: <strong className="text-amber-400">{tasks.length}</strong>
              </span>
              <span className="text-amber-300">
                ဆောင်ရွက်ရန်: <strong>{pendingCount}</strong>
              </span>
              <span className="text-emerald-400">
                ပြီးစီးပြီး: <strong>{completedCount}</strong>
              </span>
            </div>
          </div>

          {/* Inline Create List Modal / Expand */}
          {isCreatingList && (
            <form
              onSubmit={executeCreateList}
              className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-600/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="စာရင်း ခေါင်းစဉ် (ဥပမာ: ပုဂံခရီးစဉ်၊ နေ့စဉ်လုပ်ငန်း)"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e0704] border border-amber-900 text-amber-200 text-xs focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !newListTitle.trim()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                သိမ်းမည်
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingList(false)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs cursor-pointer"
              >
                မလုပ်တော့ပါ
              </button>
            </form>
          )}

          {/* Quick Voice Assistant Hint */}
          <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/50 via-stone-900/40 to-amber-950/50 border border-amber-900/40 flex items-center gap-2 text-xs text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-myanmar text-[11px] leading-relaxed">
              <strong>အသံဖြင့် လုပ်ငန်းစဉ် အသစ်မှတ်တမ်းတင်ရန်:</strong> Voice Hub သို့သွား၍ <em>"Google Tasks ထဲမှာ မနက်ဖြန် စာအုပ်ဖတ်ရန် မှတ်ပါ"</em> သို့မဟုတ် <em>"အလုပ်သစ် ထည့်ပါ"</em> ဟု ပြောဆိုနိုင်ပါသည်။
            </span>
          </div>

          {/* Create Task Form */}
          <form
            onSubmit={handleCreateTask}
            className="mt-4 p-4 rounded-xl bg-black/40 border border-amber-950 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-myanmar">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>လုပ်ငန်းဆောင်တာ အသစ် ထည့်သွင်းခြင်း ({currentListName}):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="လုပ်ဆောင်ရမည့် အလုပ် ခေါင်းစဉ် *"
                required
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#0c0603] border border-amber-900/80 text-amber-200 text-xs focus:outline-none focus:border-amber-400"
              />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c0603] border border-amber-900/80 text-xs text-stone-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="bg-transparent text-amber-200 text-xs focus:outline-none w-full cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="အသေးစိတ် မှတ်ချက် (ရွေးချယ်နိုင်သည်)"
                className="flex-1 px-3 py-2 rounded-xl bg-[#0c0603] border border-amber-900/80 text-amber-200 text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'ထည့်သွင်းနေသည်...' : 'လုပ်ငန်းသစ် ထည့်မည်'}</span>
              </button>
            </div>
          </form>

          {/* Tasks Filter Tabs & Clear Action */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-b border-amber-950 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  filter === 'all'
                    ? 'bg-amber-600 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200 bg-black/30'
                }`}
              >
                အားလုံး ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  filter === 'pending'
                    ? 'bg-amber-600 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200 bg-black/30'
                }`}
              >
                ဆောင်ရွက်ရန် ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  filter === 'completed'
                    ? 'bg-amber-600 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200 bg-black/30'
                }`}
              >
                ပြီးစီးပြီး ({completedCount})
              </button>
            </div>

            {completedCount > 0 && (
              <button
                onClick={() => setConfirmClearCompleted(true)}
                className="text-xs text-rose-400 hover:text-rose-300 font-myanmar flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>ပြီးစီးပြီးသားများ ရှင်းထုတ်ရန်</span>
              </button>
            )}
          </div>

          {/* Tasks List Content */}
          <div className="mt-3 space-y-2">
            {isLoading && tasks.length === 0 ? (
              <div className="py-12 text-center text-amber-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                <span>Google Tasks မှ အချက်အလက်များ ဆွဲယူနေပါသည်...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-10 text-center rounded-xl bg-black/20 border border-dashed border-amber-950 text-stone-400 text-xs font-myanmar">
                <ListTodo className="w-8 h-8 mx-auto text-amber-700/60 mb-2" />
                <span>ဤစာရင်းတွင် လုပ်ငန်းဆောင်တာ မရှိသေးပါ</span>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isDone
                        ? 'bg-black/30 border-amber-950/50 opacity-75'
                        : 'bg-[#100804] border-amber-900/60 hover:border-amber-700/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-500 text-stone-950'
                            : 'border-amber-600/80 hover:border-amber-400 bg-black/40'
                        }`}
                        title={isDone ? 'ဆောင်ရွက်ရန် သို့ ပြန်ပြောင်းမည်' : 'ပြီးစီးကြောင်း မှတ်သားမည်'}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs block font-myanmar ${
                            isDone ? 'line-through text-stone-500' : 'text-amber-100 font-semibold'
                          }`}
                        >
                          {task.title}
                        </span>

                        {task.notes && (
                          <p className="text-[11px] text-stone-400 font-myanmar mt-0.5 line-clamp-2">
                            {task.notes}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-stone-400 font-mono">
                          {task.due && (
                            <span className="flex items-center gap-1 text-amber-400/90 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-900/60">
                              <Calendar className="w-3 h-3" />
                              <span>သတ်မှတ်ရက်: {new Date(task.due).toLocaleDateString()}</span>
                            </span>
                          )}

                          {task.completed && (
                            <span className="text-emerald-400/80">
                              ပြီးစီးချိန်: {new Date(task.completed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Task Button (triggers required confirmation dialog) */}
                    <button
                      onClick={() => setConfirmDeleteTask(task)}
                      className="text-stone-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                      title="ဤလုပ်ငန်းကို ဖျက်မည်"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MANDATORY CONFIRMATION MODALS (Google Workspace Destructive Policy) */}
      {/* ========================================================================= */}

      {/* 1. Confirm Delete Task Modal */}
      {confirmDeleteTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-5 rounded-2xl bg-[#1a0f07] border border-rose-600/80 shadow-[0_0_40px_rgba(225,29,72,0.3)] space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-rose-200 font-myanmar">
                လုပ်ငန်းဆောင်တာအား အပြီးတိုင် ဖျက်ပစ်ရန် အတည်ပြုပါ
              </h3>
            </div>

            <p className="text-xs text-stone-300 font-myanmar leading-relaxed">
              အောက်ပါ လုပ်ငန်းစဉ်အား Google Tasks အကောင့်ထဲမှ အပြီးတိုင် ဖျက်ပစ်ပါမည်လော? ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။
            </p>

            <div className="p-3 rounded-xl bg-black/50 border border-amber-950 font-myanmar text-xs text-amber-300">
              "{confirmDeleteTask.title}"
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-950">
              <button
                type="button"
                onClick={() => setConfirmDeleteTask(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                မဖျက်တော့ပါ (Cancel)
              </button>
              <button
                type="button"
                onClick={executeDeleteTask}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'ဖျက်နေသည်...' : 'သေချာသည်၊ ဖျက်မည်'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Confirm Clear Completed Tasks Modal */}
      {confirmClearCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-5 rounded-2xl bg-[#1a0f07] border border-rose-600/80 shadow-[0_0_40px_rgba(225,29,72,0.3)] space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-rose-200 font-myanmar">
                ပြီးစီးပြီးသား လုပ်ငန်းအားလုံး ရှင်းထုတ်ရန် အတည်ပြုပါ
              </h3>
            </div>

            <p className="text-xs text-stone-300 font-myanmar leading-relaxed">
              စာရင်းထဲရှိ ပြီးစီးပြီးသား လုပ်ငန်း ({completedCount}) ခုလုံးအား အပြီးတိုင် ဖျက်ပစ်ပါမည်လော?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-950">
              <button
                type="button"
                onClick={() => setConfirmClearCompleted(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                မဖျက်တော့ပါ (Cancel)
              </button>
              <button
                type="button"
                onClick={executeClearCompleted}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'ရှင်းထုတ်နေသည်...' : 'သေချာသည်၊ ရှင်းမည်'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirm Delete Task List Modal */}
      {confirmDeleteList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-5 rounded-2xl bg-[#1a0f07] border border-rose-600/80 shadow-[0_0_40px_rgba(225,29,72,0.3)] space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-rose-200 font-myanmar">
                လုပ်ငန်းစာရင်းတစ်ခုလုံးအား ဖျက်ပစ်ရန် အတည်ပြုပါ
              </h3>
            </div>

            <p className="text-xs text-stone-300 font-myanmar leading-relaxed">
              <strong>"{confirmDeleteList.title}"</strong> စာရင်းနှင့် ၎င်းအတွင်းရှိ လုပ်ငန်းအားလုံးကို ဖျက်ပစ်ပါမည်လော?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-950">
              <button
                type="button"
                onClick={() => setConfirmDeleteList(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                မဖျက်တော့ပါ (Cancel)
              </button>
              <button
                type="button"
                onClick={executeDeleteList}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'ဖျက်နေသည်...' : 'သေချာသည်၊ စာရင်းဖျက်မည်'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
