/**
 * URL State Management with Nuqs
 * Provides type-safe URL state synchronization
 */

import { parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from "nuqs";

/**
 * Why Nuqs?
 * - Type-safe URL parameters
 * - Automatic sync with browser history
 * - React Server Components compatible
 * - Great for filters, search, pagination
 * - Shareable URLs maintain app state
 */

// Example: Search with debounce
export function useSearchParams() {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      history: "push", // Update browser history
    }),
  );

  return { search, setSearch };
}

// Example: Pagination
export function usePaginationParams() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [pageSize, setPageSize] = useQueryState("size", parseAsInteger.withDefault(10));

  return { page, setPage, pageSize, setPageSize };
}

// Example: Filters
export function useFilterParams() {
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("all"));

  const [category, setCategory] = useQueryState("category", parseAsString);

  const [showArchived, setShowArchived] = useQueryState(
    "archived",
    parseAsBoolean.withDefault(false),
  );

  return {
    status,
    setStatus,
    category,
    setCategory,
    showArchived,
    setShowArchived,
  };
}

// Example: Sort
export function useSortParams() {
  const [sortBy, setSortBy] = useQueryState("sort", parseAsString.withDefault("createdAt"));

  const [sortOrder, setSortOrder] = useQueryState("order", parseAsString.withDefault("desc"));

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return {
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
  };
}

// Composite hook for data tables
export function useDataTableParams() {
  const search = useSearchParams();
  const pagination = usePaginationParams();
  const filters = useFilterParams();
  const sort = useSortParams();

  return {
    ...search,
    ...pagination,
    ...filters,
    ...sort,
  };
}
