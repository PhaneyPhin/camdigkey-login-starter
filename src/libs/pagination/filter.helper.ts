export function applyFilters(query, filters, params) {
  for (const [key, value] of Object.entries(params)) {
    if (value && filters && filters[key]) {
      filters[key](query, value); // Apply the custom filter
    }
  }
}