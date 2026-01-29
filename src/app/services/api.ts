import { apiBaseUrl, publicAnonKey } from '../../utils/supabase/info';
import { authAPI } from '../../utils/api';

const API_BASE = apiBaseUrl;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const accessToken = await authAPI.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ==================== ORGANIZER PROFILE ====================

export async function saveOrganizerProfile(profileData: any) {
  return apiCall('/organizer/profile', {
    method: 'POST',
    body: JSON.stringify(profileData)
  });
}

export async function getOrganizerProfile() {
  return apiCall('/organizer/profile', {
    method: 'GET'
  });
}

// ==================== EVENT BRIEFS ====================

export async function createEventBrief(eventData: any) {
  return apiCall('/event-brief', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
}

export async function getEventBriefs() {
  return apiCall('/event-briefs', {
    method: 'GET'
  });
}

// ==================== MESSAGING ====================

export async function sendMessage(conversationId: string, content: string, recipientId: string) {
  return apiCall('/messages', {
    method: 'POST',
    body: JSON.stringify({ conversationId, content, recipientId })
  });
}

export async function getConversationMessages(conversationId: string) {
  return apiCall(`/messages/${conversationId}`, {
    method: 'GET'
  });
}

export async function getConversations() {
  return apiCall('/conversations', {
    method: 'GET'
  });
}

// ==================== SPEAKER SEARCH ====================

export async function searchSpeakers(query: string, filters?: any) {
  return apiCall('/search/speakers', {
    method: 'POST',
    body: JSON.stringify({ query, filters })
  });
}
