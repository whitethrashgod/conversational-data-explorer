export function applyInstructions(rows: Record<string, any>[], instructions: any): Record<string, any>[] {
  if (!instructions) return [];

  if (instructions.action === "filter") {
    const { column, op, value } = instructions.filter || {};
    if (!column) return [];
    return rows.filter(row => {
      const cell = (row[column] ?? "").toString().toLowerCase();
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
    const func = agg.func || "sum";
    const column = agg.column;
    const groupBy = agg.groupBy;
    if (!column) return [];

    if (groupBy) {
      const map = new Map<string, number>();
      rows.forEach(r => {
        const key = String(r[groupBy] ?? "Unknown");
        const val = parseFloat(r[column]) || 0;
        map.set(key, (map.get(key) || 0) + val);
      });
      return Array.from(map.entries()).map(([k, v]) => ({ [groupBy]: k, [column]: v }));
    } else {
      const total = rows.reduce((s, r) => s + (parseFloat(r[column]) || 0), 0);
      return [{ [column]: total }];
    }
  }

  return [];
}
