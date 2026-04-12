/** IDs estables para ítems generados en servidor; en cliente preferir crypto.randomUUID. */
export function createRoadmapItemId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `rm-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
