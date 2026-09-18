import { getAccessToken } from './firebase';
import { GoogleTaskItem, GoogleTaskList } from '../types';

const TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Tasks access token မရှိသေးပါ။ ကျေးဇူးပြု၍ Google Account ဖြင့် အရင် Login ဝင်ပါ။');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const googleTasksService = {
  /**
   * Fetch all user's task lists
   */
  async getTaskLists(): Promise<GoogleTaskList[]> {
    const headers = await getAuthHeader();
    const res = await fetch(`${TASKS_API_BASE}/users/@me/lists?maxResults=100`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to fetch task lists: ${res.status}`);
    }
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      updated: item.updated,
    }));
  },

  /**
   * Fetch tasks in a specific task list
   */
  async getTasks(listId: string): Promise<GoogleTaskItem[]> {
    const headers = await getAuthHeader();
    const url = `${TASKS_API_BASE}/lists/${encodeURIComponent(listId)}/tasks?showCompleted=true&showHidden=true&maxResults=100`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to fetch tasks: ${res.status}`);
    }
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title || '(အမည်မရှိ လုပ်ငန်းစဉ်)',
      notes: item.notes,
      status: item.status,
      due: item.due,
      completed: item.completed,
      updated: item.updated,
    }));
  },

  /**
   * Create a new task in a list
   */
  async createTask(
    listId: string,
    taskData: { title: string; notes?: string; due?: string }
  ): Promise<GoogleTaskItem> {
    const headers = await getAuthHeader();
    const url = `${TASKS_API_BASE}/lists/${encodeURIComponent(listId)}/tasks`;
    const body: any = {
      title: taskData.title,
      notes: taskData.notes || '',
    };
    if (taskData.due) {
      // Google Tasks expects RFC 3339 timestamp (e.g. 2026-09-18T00:00:00.000Z)
      const d = new Date(taskData.due);
      if (!isNaN(d.getTime())) {
        body.due = d.toISOString();
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to create task: ${res.status}`);
    }

    const item = await res.json();
    return {
      id: item.id,
      title: item.title,
      notes: item.notes,
      status: item.status,
      due: item.due,
      completed: item.completed,
      updated: item.updated,
    };
  },

  /**
   * Update task status (toggle completed / needsAction)
   */
  async updateTaskStatus(
    listId: string,
    taskId: string,
    status: 'completed' | 'needsAction'
  ): Promise<GoogleTaskItem> {
    const headers = await getAuthHeader();
    const url = `${TASKS_API_BASE}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`;
    
    const body: any = {
      status,
    };
    if (status === 'completed') {
      body.completed = new Date().toISOString();
    }

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to update task: ${res.status}`);
    }

    const item = await res.json();
    return {
      id: item.id,
      title: item.title,
      notes: item.notes,
      status: item.status,
      due: item.due,
      completed: item.completed,
      updated: item.updated,
    };
  },

  /**
   * Delete a task
   */
  async deleteTask(listId: string, taskId: string): Promise<void> {
    const headers = await getAuthHeader();
    const url = `${TASKS_API_BASE}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to delete task: ${res.status}`);
    }
  },

  /**
   * Create a new task list
   */
  async createTaskList(title: string): Promise<GoogleTaskList> {
    const headers = await getAuthHeader();
    const url = `${TASKS_API_BASE}/users/@me/lists`;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to create task list: ${res.status}`);
    }

    const item = await res.json();
    return {
      id: item.id,
      title: item.title,
      updated: item.updated,
    };
  },

  /**
   * Delete a task list
   */
  async deleteTaskList(listId: string): Promise<void> {
    const headers = await getAuthHeader();
    const url = `${TASKS_API_BASE}/users/@me/lists/${encodeURIComponent(listId)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to delete task list: ${res.status}`);
    }
  },

  /**
   * Clear all completed tasks from a list
   */
  async clearCompletedTasks(listId: string): Promise<void> {
    const headers = await getAuthHeader();
    const url = `${TASKS_API_BASE}/lists/${encodeURIComponent(listId)}/clear`;
    const res = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to clear completed tasks: ${res.status}`);
    }
  },
};
