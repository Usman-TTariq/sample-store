/** Escape user input for PostgREST ilike patterns in `.or()` filters */
export function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

/** Build a PostgREST `.or()` ilike filter string with quoted pattern values */
export function buildIlikeOrFilter(fields: string[], query: string): string {
  const pattern = `%${escapeIlike(query)}%`;
  const quoted = `"${pattern.replace(/"/g, '""')}"`;
  return fields.map((field) => `${field}.ilike.${quoted}`).join(',');
}
