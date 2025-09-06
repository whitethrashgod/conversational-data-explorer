export function applyInstructions(
  rows: Record<string, any>[],
  instructions: any
): Record<string, any>[] {
  if (!instructions) return [];

  // ✅ Normalize headers to match CSV columns more loosely
  const normalize = (s: string) => s?.toString().trim().toLowerCase();

  if (instructions.action === "filter") {
    const { column, op, value } = instructions.filter || {};
    if (!column) return [];

    // Find actual CSV column that matches ignoring case
    const targetCol = Object.keys(rows[0] || {}).find(
      (c) => normalize(c) === normalize(column)
    );
    if (!targetCol) return [];

    return rows.filter((row) => {
      const cell = (row[targetCol] ?? "").toString().toLowerCase();
      const v = (value ?? "").toString().toLowerCase();

      if (op === "contains") return cell.includes(v);
      if (op === "=") return cell === v;
      if (op === ">") return parseFloat(cell) > parseFloat(v);
      if (op === "<") return parseFloat(cell) < parseFloat(v);
      return cell.includes(v);
    });
  }

  if (instructions.action === "aggregate") {
    const agg = instructions.aggregate || {};
    const column = agg.column;
    const groupBy = agg.groupBy;
    if (!column) return [];

    // Find matching columns ignoring case
    const targetCol = Object.keys(rows[0] || {}).find(
      (c) => normalize(c) === normalize(column)
    );
    const targetGroup = groupBy
      ? Object.keys(rows[0] || {}).find(
          (c) => normalize(c) === normalize(groupBy)
        )
      : null;

    if (!targetCol) return [];

    if (targetGroup) {
      const map = new Map<string, number>();
      rows.forEach((r) => {
        const key = String(r[targetGroup] ?? "Unknown");
        const val = parseFloat(r[targetCol]) || 0;
        map.set(key, (map.get(key) || 0) + val);
      });
      return Array.from(map.entries()).map(([k, v]) => ({
        [targetGroup]: k,
        [targetCol]: v,
      }));
    } else {
      const total = rows.reduce(
        (s, r) => s + (parseFloat(r[targetCol]) || 0),
        0
      );
      return [{ [targetCol]: total }];
    }
  }

  return [];
}

