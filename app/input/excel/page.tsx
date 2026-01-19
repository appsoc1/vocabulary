"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useFolders } from "@/hooks/useFolders";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type ImportedRow = {
    English: string;
    Meaning: string;
    Link?: string;
};

export default function ImportExcelPage() {
    const { folders } = useFolders();
    const [folderId, setFolderId] = useState("");
    const [rows, setRows] = useState<ImportedRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
    const [error, setError] = useState("");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                // Parse CSV/Excel. Assuming headers: English, Meaning, Link (optional)
                const data = XLSX.utils.sheet_to_json<ImportedRow>(ws);

                // Basic validation
                const validRows = data.filter(r => r.English && r.Meaning);
                setRows(validRows);
                setResult(null);
                setError("");
            } catch (err) {
                setError("Failed to parse file. Ensure it's a valid Excel/CSV.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (!folderId) {
            setError("Please select a target folder.");
            return;
        }
        if (rows.length === 0) {
            setError("No valid rows found to import.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload = rows.map(r => ({
                folder_id: folderId,
                type: "word", // Default to word type for bulk import
                english: String(r.English).trim(),
                meaning_1: String(r.Meaning).trim(),
                video_url: r.Link ? String(r.Link).trim() : null,
            }));

            const res = await fetch("/api/cards/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cards: payload }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Import failed");

            setResult(data);
            setRows([]); // Clear preview
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in py-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Import from Excel</h2>
                <p className="text-muted-foreground">
                    Bulk add words from `.xlsx` or `.csv`.
                    <br />
                    Headers required: <strong>English</strong>, <strong>Meaning</strong>. Optional: <strong>Link</strong>.
                </p>
            </div>

            <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
                {/* 1. Select Folder */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Target Folder</label>
                    <select
                        value={folderId}
                        onChange={(e) => setFolderId(e.target.value)}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">-- Select Folder --</option>
                        {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                {/* 2. Upload File */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Upload File</label>
                    <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">Click to select file</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports .xlsx, .csv</p>
                    </div>
                </div>

                {/* 3. Preview & Status */}
                {rows.length > 0 && !result && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Preview ({rows.length} items)</span>
                            <button
                                onClick={handleImport}
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Import Now
                            </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto border rounded-md text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-2">English</th>
                                        <th className="p-2">Meaning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.slice(0, 50).map((r, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2">{r.English}</td>
                                            <td className="p-2 text-muted-foreground">{r.Meaning}</td>
                                        </tr>
                                    ))}
                                    {rows.length > 50 && (
                                        <tr>
                                            <td colSpan={2} className="p-2 text-center text-muted-foreground italic">
                                                ... and {rows.length - 50} more
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Success / Error Messages */}
                {result && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3 text-green-700">
                        <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Import Complete!</p>
                            <ul className="text-sm mt-1 list-disc list-inside">
                                <li>Added: <strong>{result.inserted}</strong> new words</li>
                                <li>Skipped: <strong>{result.skipped}</strong> duplicates</li>
                            </ul>
                            <button
                                onClick={() => { setRows([]); setResult(null); }}
                                className="text-xs underline mt-2 hover:text-green-800"
                            >
                                Import more
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
