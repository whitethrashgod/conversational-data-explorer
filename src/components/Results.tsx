import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Results({ rows }: { rows: Record<string, any>[] }) {
  if (!rows || rows.length === 0) {
    return <div className="text-sm text-gray-500">No results to show</div>;
  }

  const keys = Object.keys(rows[0]);
  const numKey = keys.find(k => rows.every(r => !isNaN(parseFloat(r[k]))));
  const chartData = numKey ? rows.slice(0, 10).map((r, i) => ({ name: String(i + 1), value: Number(r[numKey]) })) : null;

  return (
    <div>
      <div className="overflow-auto max-h-64 border rounded-md p-2">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {keys.map(k => <th key={k} className="text-left px-2 py-1 font-medium">{k}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                {keys.map(k => <td key={k} className="px-2 py-1">{String(r[k] ?? "")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chartData && (
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
