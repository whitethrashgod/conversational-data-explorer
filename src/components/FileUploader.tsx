import React from "react";
import Papa from "papaparse";

type Props = {
  onData: (payload: { headers: string[]; rows: Record<string, any>[] }) => void;
};

export default function FileUploader({ onData }: Props) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        onData({ headers: headers as string[], rows: results.data as Record<string, any>[] });
      },
    });
  };

  return (
    <div className="border-dashed border-2 border-gray-300 rounded-lg p-4">
      <label className="block text-sm text-gray-600 mb-2">Upload CSV</label>
      <input type="file" accept=".csv" onChange={handleFile} className="block" />
      <p className="text-xs text-gray-500 mt-2">Try sample.csv (Region,Product,Sales,Date)</p>
    </div>
  );
}
