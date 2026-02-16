const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  dashboard: (params?: { from?: string; to?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<any>(`/dashboard${qs}`);
  },

  // People
  people: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any>(`/people${qs}`);
    },
    all: () => request<any[]>('/people/all'),
    get: (id: number) => request<any>(`/people/${id}`),
    create: (data: any) => request<any>('/people', { method: 'POST', body: JSON.stringify(data) }),
    quickAdd: (data: any) => request<any>('/people/quick-add', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/people/${id}`, { method: 'DELETE' }),
    findByEmail: async (email: string) => {
      const res = await request<any>(`/people?search=${encodeURIComponent(email)}&limit=50`);
      const match = (res.data || []).find(
        (p: any) => p.email?.toLowerCase() === email.toLowerCase()
      );
      return match || null;
    },
  },

  // Courses
  courses: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any>(`/courses${qs}`);
    },
    get: (id: number) => request<any>(`/courses/${id}`),
    create: (data: any) => request<any>('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/courses/${id}`, { method: 'DELETE' }),
    addAttendee: (courseId: number, data: any) =>
      request<any>(`/courses/${courseId}/attendees`, { method: 'POST', body: JSON.stringify(data) }),
    removeAttendee: (courseId: number, personId: number) =>
      request<any>(`/courses/${courseId}/attendees/${personId}`, { method: 'DELETE' }),
  },

  // Meetings
  meetings: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any>(`/meetings${qs}`);
    },
    get: (id: number) => request<any>(`/meetings/${id}`),
    create: (data: any) => request<any>('/meetings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/meetings/${id}`, { method: 'DELETE' }),
    addAttendee: (meetingId: number, data: any) =>
      request<any>(`/meetings/${meetingId}/attendees`, { method: 'POST', body: JSON.stringify(data) }),
    removeAttendee: (meetingId: number, personId: number) =>
      request<any>(`/meetings/${meetingId}/attendees/${personId}`, { method: 'DELETE' }),
    toggleAttendance: (meetingId: number, personId: number, attended: boolean | null) =>
      request<any>(`/meetings/${meetingId}/attendees/${personId}`, { method: 'PATCH', body: JSON.stringify({ attended }) }),
  },

  // CME
  cme: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any>(`/cme${qs}`);
    },
    get: (id: number) => request<any>(`/cme/${id}`),
    create: (data: any) => request<any>('/cme', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/cme/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/cme/${id}`, { method: 'DELETE' }),
    awardCredits: (activityId: number, data: any) =>
      request<any>(`/cme/${activityId}/credits`, { method: 'POST', body: JSON.stringify(data) }),
    transcript: (personId: number) => request<any>(`/cme/transcript/${personId}`),
  },

  // Credentials
  credentials: {
    templates: () => request<any[]>('/credentials/templates'),
    createTemplate: (data: any) => request<any>('/credentials/templates', { method: 'POST', body: JSON.stringify(data) }),
    getTemplate: (id: number) => request<any>(`/credentials/templates/${id}`),
    updateTemplate: (id: number, data: any) => request<any>(`/credentials/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTemplate: (id: number) => request<any>(`/credentials/templates/${id}`, { method: 'DELETE' }),
    uploadFile: async (file: File, folder: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      return res.json() as Promise<{ url: string; key: string; filename: string; size: number }>;
    },
    issued: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any[]>(`/credentials/issued${qs}`);
    },
    issue: (data: any) => request<any>('/credentials/issued', { method: 'POST', body: JSON.stringify(data) }),
    distribution: () => request<any>('/credentials/distribution'),
  },
};
