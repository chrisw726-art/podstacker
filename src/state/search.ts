// src/state/search.ts
import { searchPodcasts, PodcastSearchResult } from "../lib/itunesApi";

let searchState = {
  query: "",
  results: [] as PodcastSearchResult[],
  loading: false,
  error: null as string | null,
  selectedCountry: "US",
  selectedCategories: [] as string[],
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribeToSearch(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSearchState() {
  return searchState;
}

export function setQuery(query: string) {
  searchState.query = query;
  notifyListeners();
}

export async function search(query: string) {
  const trimmed = query.trim();
  
  if (!trimmed) {
    searchState.results = [];
    searchState.query = "";
    notifyListeners();
    return;
  }

  searchState.loading = true;
  searchState.error = null;
  searchState.query = trimmed;
  notifyListeners();

  try {
    const results = await searchPodcasts(trimmed, searchState.selectedCountry, 50);
    searchState.results = results;
    searchState.loading = false;
    notifyListeners();
  } catch (error) {
    console.error("Search error:", error);
    searchState.error = "Failed to search podcasts. Please try again.";
    searchState.loading = false;
    searchState.results = [];
    notifyListeners();
  }
}

export function clearResults() {
  searchState.results = [];
  searchState.query = "";
  searchState.error = null;
  notifyListeners();
}

export function setCountry(country: string) {
  searchState.selectedCountry = country;
  notifyListeners();
  // Re-run search if there's an active query
  if (searchState.query) {
    search(searchState.query);
  }
}

export function addCategory(category: string) {
  if (!searchState.selectedCategories.includes(category)) {
    searchState.selectedCategories = [...searchState.selectedCategories, category];
    notifyListeners();
  }
}

export function removeCategory(category: string) {
  searchState.selectedCategories = searchState.selectedCategories.filter(
    (c) => c !== category
  );
  notifyListeners();
}

export function clearFilters() {
  searchState.selectedCategories = [];
  searchState.selectedCountry = "US";
  notifyListeners();
}
