import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet } from '../services/api';

export const EMPTY_FILTERS = { schools: [], grades: [], genders: [], ages: [] };

const FilterContext = createContext(null);

/**
 * One filter state for the whole dashboard. Every page reads the same object,
 * so KPI cards and charts are always computed over the same cohort.
 */
export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [options, setOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/filters/options')
      .then(setOptions)
      .catch(() => setOptions(null))
      .finally(() => setOptionsLoading(false));
  }, []);

  const toggle = useCallback((key, value) => {
    setFilters((previous) => {
      const current = previous[key];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...previous, [key]: next };
    });
  }, []);

  const setValues = useCallback((key, values) => {
    setFilters((previous) => ({ ...previous, [key]: values }));
  }, []);

  const clear = useCallback((key) => {
    setFilters((previous) => ({ ...previous, [key]: [] }));
  }, []);

  const resetAll = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const activeCount =
    filters.schools.length + filters.grades.length + filters.genders.length + filters.ages.length;

  const value = useMemo(
    () => ({ filters, options, optionsLoading, activeCount, toggle, setValues, clear, resetAll }),
    [filters, options, optionsLoading, activeCount, toggle, setValues, clear, resetAll],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilters must be used inside a FilterProvider');
  return context;
}
