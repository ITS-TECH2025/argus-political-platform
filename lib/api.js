// lib/api.js
// Client-side API utilities

export async function fetchPoliticians(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/politicians?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch politicians');
  }
  
  return response.json();
}

export async function fetchPoliticianDetails(id) {
  const response = await fetch(`/api/politicians/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch politician details');
  }
  
  return response.json();
}
