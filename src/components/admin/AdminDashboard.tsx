"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { Download, ChevronDown, ChevronRight, Trash2 } from "lucide-react";

export default function AdminDashboard({ onExit }: { onExit?: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"database" | "analytics">("database");
  const [selectedIV, setSelectedIV] = useState<string>("All");

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

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to completely delete the response from ${name}?`)) return;
    
    // Optimistic UI update
    setData((prev) => prev.filter(r => r.id !== id));
    setExpandedId(null);
    
    const { error } = await supabase.from('responses').delete().eq('id', id);
    if (error) {
      alert("Failed to delete from DB: " + error.message);
    }
  };

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

  // Correlation Engine
  const calcCorrelation = (xList: number[], yList: number[]) => {
    if (xList.length !== yList.length || xList.length < 2) return 0;
    const n = xList.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
       sumX += xList[i];
       sumY += yList[i];
       sumXY += xList[i] * yList[i];
       sumX2 += xList[i] * xList[i];
       sumY2 += yList[i] * yList[i];
    }
    const num = (n * sumXY) - (sumX * sumY);
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    if (den === 0) return 0;
    return num / den;
  };

  const getNumericArray = (key: string) => {
    return data.map(d => {
      if (key === "age") return parseInt(d.age) || 0;
      if (key === "gaming_hours") {
        const gh = d.gaming_hours || "";
        if (gh.includes("Less than 3")) return 1;
        if (gh.includes("3 to 7")) return 2;
        if (gh.includes("7 to 14")) return 3;
        if (gh.includes("14 to 25")) return 4;
        if (gh.includes("More than 25")) return 5;
        return 0;
      }
      return parseFloat(d[key]) || 0;
    });
  };

  const calcCategoricalCorrelations = () => {
    if (!data || data.length === 0) return [];
    
    const uniqueIVs = new Set<string>();
    const uniqueDVs = new Set<{type: string, val: string}>();

    data.forEach(d => {
       if (Array.isArray(d.top_genres)) d.top_genres.forEach((g: string) => uniqueIVs.add(g));
       if (Array.isArray(d.hobbies_selected)) d.hobbies_selected.forEach((h: string) => uniqueDVs.add({type: 'Hobby', val: h}));
       if (Array.isArray(d.books_selected)) d.books_selected.forEach((b: string) => uniqueDVs.add({type: 'Book', val: b}));
       if (Array.isArray(d.series_selected)) d.series_selected.forEach((s: string) => uniqueDVs.add({type: 'Series', val: s}));
    });

    const results: { iv: string, dvType: string, dv: string, r: number, count: number }[] = [];

    Array.from(uniqueIVs).forEach(iv => {
      if (selectedIV !== "All" && iv !== selectedIV) return;

      Array.from(uniqueDVs).forEach(dvObj => {
         const dv = dvObj.val;
         let n11=0, n10=0, n01=0, n00=0;
         
         data.forEach(d => {
           const hasIV = Array.isArray(d.top_genres) && d.top_genres.includes(iv);
           let hasDV = false;
           if (dvObj.type === 'Hobby' && Array.isArray(d.hobbies_selected)) hasDV = d.hobbies_selected.includes(dv);
           if (dvObj.type === 'Book' && Array.isArray(d.books_selected)) hasDV = d.books_selected.includes(dv);
           if (dvObj.type === 'Series' && Array.isArray(d.series_selected)) hasDV = d.series_selected.includes(dv);

           if (hasIV && hasDV) n11++;
           else if (hasIV && !hasDV) n10++;
           else if (!hasIV && hasDV) n01++;
           else n00++;
         });

         const n1_ = n11 + n10;
         const n0_ = n01 + n00;
         const n_1 = n11 + n01;
         const n_0 = n10 + n00;

         if (n1_ === 0 || n0_ === 0 || n_1 === 0 || n_0 === 0) return;

         const num = (n11 * n00) - (n10 * n01);
         const den = Math.sqrt(n1_ * n0_ * n_1 * n_0);
         const phi = num / den;

         // Lower threshold when filtering to a specific IV (fewer data points)
         const minCoOccurrence = selectedIV === "All" ? 2 : 1;
         if (n11 >= minCoOccurrence) {
           results.push({ iv, dvType: dvObj.type, dv, r: phi, count: n11 });
         }
      });
    });

    return results.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 9);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background text-white flex items-center justify-center">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 overflow-auto">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-widest text-glow">Research Dashboard</h1>
          <div className="flex items-center gap-4">
            <a 
              href={onExit ? undefined : "/"}
              onClick={onExit ? (e) => { e.preventDefault(); onExit(); } : undefined}
              className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md font-bold text-xs transition-all uppercase tracking-widest border border-red-500/30 cursor-pointer"
            >
              Exit
            </a>
            <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
               <button onClick={() => setActiveTab('database')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all uppercase tracking-widest ${activeTab === 'database' ? 'bg-primary text-black shadow-[0_0_10px_var(--color-primary)]' : 'text-white/50 hover:text-white'}`}>Database</button>
               <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all uppercase tracking-widest ${activeTab === 'analytics' ? 'bg-primary text-black shadow-[0_0_10px_var(--color-primary)]' : 'text-white/50 hover:text-white'}`}>Analytics</button>
             </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md font-bold transition-colors border border-white/20 uppercase tracking-widest text-xs"
            >
              <Download size={16} />
              Export
            </button>
          </div>
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

        {activeTab === 'analytics' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-glow-secondary border-b border-secondary/20 pb-4">Hypothesis Testing Matrix</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "SES vs Premiumness", x: "socioeconomic_score", y: "premiumness_avg", desc: "Correlation between hardware wealth and playing highly-budgeted AAA games." },
                { title: "Age vs Premiumness", x: "age", y: "premiumness_avg", desc: "Correlation between age maturity and preference for premium titles." },
                { title: "Hours vs Premiumness", x: "gaming_hours", y: "premiumness_avg", desc: "Correlation between massive playtime and game cost preference." },
                { title: "SES vs Hours", x: "socioeconomic_score", y: "gaming_hours", desc: "Correlation between wealth brackets and total hours dedicated to gaming." }
              ].map(stat => {
                const xArr = getNumericArray(stat.x);
                const yArr = getNumericArray(stat.y);
                
                // Filter out zeroes/invalid matches
                const validX: number[] = [];
                const validY: number[] = [];
                for(let i=0; i<xArr.length; i++) {
                  if (xArr[i] !== 0 && yArr[i] !== 0) {
                    validX.push(xArr[i]); validY.push(yArr[i]);
                  }
                }
                
                const r = calcCorrelation(validX, validY);
                const isStrong = Math.abs(r) > 0.6;
                const isModerate = Math.abs(r) > 0.3 && !isStrong;
                
                let corrText = "NEGLIGIBLE";
                if (isStrong) corrText = r > 0 ? "STRONG POSITIVE" : "STRONG NEGATIVE";
                else if (isModerate) corrText = r > 0 ? "MODERATE POSITIVE" : "MODERATE NEGATIVE";
                else if (Math.abs(r) > 0.1) corrText = r > 0 ? "WEAK POSITIVE" : "WEAK NEGATIVE";

                return (
                  <div key={stat.title} className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4 hover:border-secondary/50 transition-colors group relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[50px] pointer-events-none ${isStrong ? 'bg-primary/20' : ''}`} />
                    <h3 className="font-bold text-lg text-white uppercase tracking-wider">{stat.title}</h3>
                    <p className="text-white/40 text-xs font-mono min-h-[3rem]">{stat.desc}</p>
                    <div className="flex items-end justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Pearson (r)</p>
                        <p className={`font-black text-3xl font-mono ${isStrong ? 'text-primary drop-shadow-[0_0_10px_rgba(0,241,255,1)]' : 'text-white'}`}>
                          {r.toFixed(3)}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded bg-black border ${isStrong ? 'border-primary text-primary' : 'border-white/20 text-white/50'}`}>
                        {corrText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-secondary/20 pb-4 pt-12 gap-4">
               <h2 className="text-2xl font-black uppercase tracking-widest text-glow-secondary">Categorical Linkages (Top 9)</h2>
               <select 
                 value={selectedIV} 
                 onChange={(e) => setSelectedIV(e.target.value)}
                 className="bg-black border border-white/20 text-white px-4 py-2 rounded-md font-mono text-xs uppercase tracking-widest outline-none focus:border-primary transition-colors cursor-pointer max-w-[200px] md:max-w-none"
               >
                  <option value="All">-- All Gaming Categories --</option>
                  {Array.from(new Set(data.flatMap(d => Array.isArray(d.top_genres) ? d.top_genres : []))).sort().map(iv => (
                    <option key={iv} value={iv}>{iv}</option>
                  ))}
               </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calcCategoricalCorrelations().map((corr, idx) => {
                const isStrong = Math.abs(corr.r) > 0.6;
                const isModerate = Math.abs(corr.r) > 0.3 && !isStrong;
                
                let corrText = "WEAK";
                if (isStrong) corrText = corr.r > 0 ? "STRONG POSITIVE" : "STRONG NEGATIVE";
                else if (isModerate) corrText = corr.r > 0 ? "MODERATE POSITIVE" : "MODERATE NEGATIVE";
                else if (Math.abs(corr.r) > 0.1) corrText = corr.r > 0 ? "WEAK POSITIVE" : "WEAK NEGATIVE";

                return (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4 relative overflow-hidden group">
                     <div className={`absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[50px] pointer-events-none ${isStrong ? 'bg-primary/20' : ''}`} />
                     <h3 className="font-bold text-sm text-white uppercase tracking-wider">{corr.iv} <br/><span className="text-white/40 text-[10px] break-words">vs</span><br/> <span className="text-primary">{corr.dv}</span> <span className="text-[10px] text-white/30 truncate">({corr.dvType})</span></h3>
                     
                     <div className="flex items-end justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Phi</p>
                        <p className={`font-black text-2xl font-mono ${isStrong ? 'text-primary drop-shadow-[0_0_10px_rgba(0,241,255,1)]' : 'text-white'}`}>
                          {corr.r.toFixed(3)}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded bg-black border ${isStrong ? 'border-primary text-primary' : 'border-white/20 text-white/50'}`}>
                        {corrText}
                      </span>
                    </div>
                  </div>
                )
              })}
              {calcCategoricalCorrelations().length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-white/50 p-8 border border-dashed border-white/20 rounded-xl">
                  Not enough valid qualitative category overlaps to map data.
                </div>
              )}
            </div>
          </div>
        ) : (
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
        )}
        
        {/* Expanded View */}
        {expandedId && data.find(d => d.id === expandedId) && (() => {
          const expandedData = data.find(d => d.id === expandedId);
          
          const renderValue = (val: any) => {
            if (Array.isArray(val)) {
              if (val.length === 0) return "-";
              return (
                <div className="flex flex-wrap gap-2">
                  {val.map((item, i) => (
                    <span key={i} className="bg-primary/10 text-primary border border-primary/30 px-2 py-1 rounded text-xs shadow-sm font-bold tracking-widest uppercase">
                      {item}
                    </span>
                  ))}
                </div>
              );
            }
            if (typeof val === "object" && val !== null) {
              return (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(val).map(([k, v]) => (
                    <span key={k} className="bg-white/10 border border-white/20 px-2 py-1 rounded text-xs text-white">
                      <span className="text-secondary font-bold opacity-80 mr-1">{k}:</span>
                      {String(v)}
                    </span>
                  ))}
                </div>
              );
            }
            if (typeof val === "boolean") return val ? "YES" : "NO";
            return String(val || "-");
          };

          return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setExpandedId(null)}>
              <div className="bg-[#0a0a0f] border-2 border-primary/20 shadow-[0_0_50px_rgba(0,241,255,0.1)] rounded-2xl w-full max-w-6xl max-h-[85vh] overflow-y-auto p-6 md:p-10" onClick={(e) => e.stopPropagation()}>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
                   <div>
                     <h2 className="text-2xl md:text-3xl font-black text-glow tracking-widest uppercase truncate break-all">Target: {expandedData?.name}</h2>
                     <p className="text-white/40 font-mono text-xs md:text-sm tracking-widest uppercase mt-2">ID: {expandedData?.id}</p>
                   </div>
                   <div className="flex items-center gap-4">
                     <button onClick={() => handleDelete(expandedId, expandedData?.name || 'user')} className="bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors uppercase tracking-widest text-xs">
                       <Trash2 size={16} /> Purge Record
                     </button>
                     <button onClick={() => setExpandedId(null)} className="text-white/50 hover:text-white uppercase tracking-widest font-bold text-sm transition-colors">Close</button>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {expandedData && Object.entries(expandedData).filter(([k]) => !['id', 'name'].includes(k)).map(([key, value]) => (
                      <div key={key} className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3 hover:border-primary/50 transition-colors group">
                        <h3 className="text-primary/70 text-xs font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{key.replace(/_/g, ' ')}</h3>
                        <div className="font-mono text-sm text-white/90">
                          {key === "created_at" && typeof value === 'string' ? new Date(value).toLocaleString() : renderValue(value)}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
