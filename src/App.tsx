import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import QueryInput from "./components/QueryInput";
import Results from "./components/Results";
import "./index.css";

export default function App() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [resultRows, setResultRows] = useState<Record<string, any>[]>([]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4 text-blue-600">Conversational Data Explorer</h1>

        <FileUploader
          onData={({ headers, rows }) => {
            setHeaders(headers);
            setRows(rows);
            setResultRows(rows.slice(0, 5));
          }}
        />

        <div className="mt-6">
          <QueryInput
            headers={headers}
            rows={rows}
            onResult={(r) => setResultRows(r)}
          />
        </div>

        <div className="mt-6">
          <Results rows={resultRows} />
        </div>
      </div>
    </div>
  );
}
