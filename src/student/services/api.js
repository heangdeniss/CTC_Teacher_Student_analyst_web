import {
  getOverview, getProfile, getImpact, getDigitalSkills, getExperience, getRisk, getFilterOptions,
} from '../localData/pages';

/**
 * Student Analyst runs fully static — see server/README.md for why (this app
 * is deployed to Vercel as a static site with no live backend reachable).
 * `src/student/localData/` re-implements every endpoint's exact SQL logic in
 * JavaScript over a one-time export of the same PostgreSQL tables
 * (src/student/data/*.json). Every page/component still calls `apiGet(path,
 * filters)` exactly as it would call a live API — only this file changed.
 */
const ROUTES = {
  '/api/overview': getOverview,
  '/api/profile': getProfile,
  '/api/impact': getImpact,
  '/api/digital-skills': getDigitalSkills,
  '/api/learning-experience': getExperience,
  '/api/risk': getRisk,
  '/api/filters/options': getFilterOptions,
};

export async function apiGet(path, filters) {
  const handler = ROUTES[path];
  if (!handler) {
    throw new Error(`No local data handler registered for ${path}`);
  }
  return handler(filters);
}
