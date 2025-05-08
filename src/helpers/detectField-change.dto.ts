function detectChangedFields(
  oldObj: Record<string, any>,
  newObj: Record<string, any>
): string[] {
  const changed: string[] = [];
  for (const key of Object.keys(newObj)) {
    if (oldObj[key] !== newObj[key]) {
      changed.push(key);
    }
  }
  return changed;
}
