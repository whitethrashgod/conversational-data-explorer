import { useState } from "react";
import { applyInstructions } from "../utils/queryProcessor";   // 👈 make sure this import is present

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

type Props = {
  headers: string[];
  rows: Record<string, any>[];
  onResult: (r: Record<string, any>[]) => void;
};

export default function QueryInput({ headers, rows, onResult }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, headers }),
      });

      const data = await response.json();
      const instructions = data.instructions;

      // Apply the Groq-generated JSON instructions to your CSV rows
      const resultRows = applyInstructions(rows, instructions);

      // Send results back to App.tsx so Results.tsx updates
      onResult(resultRows);

      console.log("Instructions:", instructions);
      console.log("Computed Results:", resultRows);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder='e.g. "Sum sales by region for last month"'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 border rounded-lg p-2"
      />
      <button
        onClick={handleRun}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Running..." : "Run"}
      </button>
    </div>
  );
}
