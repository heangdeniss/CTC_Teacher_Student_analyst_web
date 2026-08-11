const BASE = import.meta.env.VITE_STUDENT_API_URL ?? '';

export function toQuery(filters) {
  const params = new URLSearchParams();
  const add = (key, values) => {
    for (const value of values) params.append(key, value);
  };
  add('schools', filters.schools);
  add('grades', filters.grades);
  add('genders', filters.genders);
  add('ages', filters.ages);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function apiGet(path, filters, signal) {
  const query = filters ? toQuery(filters) : '';
  const response = await fetch(`${BASE}${path}${query}`, { signal });
  if (!response.ok) {
    throw new Error(`Request to ${path} failed (${response.status})`);
  }
  return await response.json();
}
