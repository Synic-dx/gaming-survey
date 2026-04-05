"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { Download, ChevronDown, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sorting
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: responses, error } = await supabase
      .from("responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && responses) {
      setData(responses);
    }
    setIsLoading(false);
  };

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDesc(!sortDesc);
    else {
      setSortCol(col);
      setSortDesc(true);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortCol];
    const valB = b[sortCol];
    if (typeof valA === "string") {
      return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
    }
    if (valA === valB) return 0;
    return sortDesc ? valB - valA : valA - valB;
  });

  const handleExport = () => {
    // Format JSON array to flatten items
    const flattened = data.map((row) => {
      const gScores = row.genre_scores || {};
      const tScores = row.trait_scores || {};
      const big5 = row.big_five_scores || {};
      const persScores = row.personality_responses || {};

      const base = {
        ID: row.id,
        "Created At": new Date(row.created_at).toLocaleString(),
        Name: row.name,
        Age: row.age,
        Gender: row.gender,
        Education: row.education,
        "Laptop Price": row.laptop_price,
        Platform: row.platform,
        "Gaming Hours": row.gaming_hours,
        "Games Selected": Array.isArray(row.games_selected) ? row.games_selected.join(", ") : "",
        "Premiumness Avg": row.premiumness_avg,
        "Top Genres": Array.isArray(row.top_genres) ? row.top_genres.join(", ") : "",
        "Gaming Motivation": Array.isArray(row.gaming_motivation) ? row.gaming_motivation.join(", ") : "",
        "MBTI Type": row.mbti_type,
        "Series Selected": Array.isArray(row.series_selected) ? row.series_selected.join(", ") : "",
        "Books Selected": Array.isArray(row.books_selected) ? row.books_selected.join(", ") : "",
        "Hobbies Selected": Array.isArray(row.hobbies_selected) ? row.hobbies_selected.join(", ") : "",
        "SES Score": row.socioeconomic_score,
        Completed: row.completed ? "Yes" : "No",
      };

      // Add flattened nested ones
      const genresFlat: any = {};
      Object.keys(gScores).forEach((k) => genresFlat[`genre_${k.toLowerCase().replace(/[^a-z]/g, "_")}`] = gScores[k]);

      const traitsFlat: any = {};
      Object.keys(tScores).forEach((k) => traitsFlat[`trait_${k.toLowerCase().replace(/[^a-z]/g, "_")}`] = tScores[k]);

      const big5Flat: any = {};
      Object.keys(big5).forEach((k) => big5Flat[`big5_${k.toLowerCase()}`] = big5[k]);
      
      const persFlat: any = {};
      Object.keys(persScores).forEach((k) => persFlat[`personality_${k}`] = persScores[k]);

      return {
        ...base,
        ...genresFlat,
        ...traitsFlat,
        ...big5Flat,
        ...persFlat,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(flattened);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `gaming_survey_responses_${dateStr}.xlsx`);
  };

  // Stats calculation
  const totalResponses = data.length;
  const completedResponses = data.filter((d) => d.completed).length;
  const avgSES = data.length ? data.reduce((acc: number, d: any) => acc + (d.socioeconomic_score || 0), 0) / data.filter((d: any) => d.socioeconomic_score).length : 0;
  
  const mbtiCounts = data.reduce((acc: Record<string, number>, d: any) => {
    if (d.mbti_type) acc[d.mbti_type] = (acc[d.mbti_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topMBTI = Object.entries(mbtiCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const platCounts = data.reduce((acc: Record<string, number>, d: any) => {
    if (d.platform) acc[d.platform] = (acc[d.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topPlatform = Object.entries(platCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const columns = [
    { key: "name", label: "Name" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
    { key: "platform", label: "Platform" },
    { key: "gaming_hours", label: "Hours" },
    { key: "mbti_type", label: "MBTI" },
    { key: "premiumness_avg", label: "Premiumness" },
    { key: "socioeconomic_score", label: "SES Score" },
    { key: "completed", label: "Done" },
    { key: "created_at", label: "Date" },
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-background text-white flex items-center justify-center">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 overflow-auto">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Research Dashboard</h1>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-bold shadow-lg transition-colors border border-transparent"
          >
            <Download size={20} />
            Export to XLSX
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Responses", val: totalResponses },
            { label: "Completed", val: completedResponses },
            { label: "Avg SES Score", val: avgSES ? avgSES.toFixed(2) : "0" },
            { label: "Top MBTI", val: topMBTI },
            { label: "Top Platform", val: topPlatform },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</span>
              <span className="text-2xl font-black text-primary">{stat.val}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden w-full overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/50 text-white/60">
              <tr>
                <th className="p-4 font-semibold w-10"></th>
                {columns.map((c) => (
                  <th 
                    key={c.key} 
                    onClick={() => handleSort(c.key)}
                    className="p-4 font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                  >
                     <div className="flex items-center gap-2">
                       {c.label}
                       {sortCol === c.key && (
                         <ChevronDown size={14} className={`transition-transform ${sortDesc ? '' : 'rotate-180'}`} />
                       )}
                     </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sortedData.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 w-10 cursor-pointer" onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}>
                    {expandedId === row.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </td>
                  <td className="p-4 font-medium">{row.name}</td>
                  <td className="p-4">{row.age || "-"}</td>
                  <td className="p-4">{row.gender || "-"}</td>
                  <td className="p-4">{row.platform || "-"}</td>
                  <td className="p-4">{row.gaming_hours || "-"}</td>
                  <td className="p-4 font-bold text-secondary">{row.mbti_type || "-"}</td>
                  <td className="p-4">{row.premiumness_avg ? row.premiumness_avg.toFixed(2) : "-"}</td>
                  <td className="p-4 text-accent font-bold">{row.socioeconomic_score ? row.socioeconomic_score.toFixed(2) : "-"}</td>
                  <td className="p-4">
                    {row.completed ? <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">YES</span> : <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">NO</span>}
                  </td>
                  <td className="p-4 text-white/50">{new Date(row.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr><td colSpan={11} className="text-center p-8 text-white/50">No responses yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Expanded View */}
        {expandedId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setExpandedId(null)}>
            <div className="bg-[#12121e] border border-white/20 shadow-2xl rounded-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">Details: {data.find(d => d.id === expandedId)?.name}</h2>
                 <button onClick={() => setExpandedId(null)} className="text-white/50 hover:text-white">Close</button>
               </div>
               <pre className="bg-black/50 p-6 rounded-lg overflow-x-auto text-sm text-green-400 font-mono">
                 {JSON.stringify(data.find(d => d.id === expandedId), null, 2)}
               </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
