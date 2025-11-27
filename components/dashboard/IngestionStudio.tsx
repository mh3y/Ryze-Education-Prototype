
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Zap, Brain, Eye, Database, FileJson, Activity, Loader2, AlertCircle, Table, Layers, Scissors } from 'lucide-react';
import { RyzeAI, IngestionResult } from '../../services/ai';

const PIPELINE_STEPS = [
  { id: 'parsing', name: 'Advanced Layout Analysis', icon: Layers },
  { id: 'ocr', name: 'OCR Extraction', icon: Eye },
  { id: 'vision', name: 'Vision Analysis', icon: Brain },
  { id: 'chunking', name: 'Semantic Chunking', icon: Scissors },
  { id: 'embedding', name: 'Vector Embedding', icon: Activity },
  { id: 'storage', name: 'Knowledge Base', icon: Database },
];

export const IngestionStudio: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setResult(null);
    setChunks([]);
    setError(null);
    setIsProcessing(true);
    setCurrentStep(0);

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      // Convert to Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const progressInterval = setInterval(() => {
        setCurrentStep(prev => (prev < 2 ? prev + 1 : prev));
      }, 800);

      // 1. Ingest (OCR + Vision + Layout)
      const ingestionResult = await RyzeAI.ingestDocument(base64, file.type);
      clearInterval(progressInterval);

      if (ingestionResult) {
        setResult(ingestionResult);
        setCurrentStep(3); // Move to Chunking
        
        // 2. Semantic Chunking
        // Simulate a slight delay for the UI to reflect the step
        await new Promise(r => setTimeout(r, 600));
        const generatedChunks = RyzeAI.chunkContent(ingestionResult);
        setChunks(generatedChunks);
        
        setCurrentStep(4); // Embedding
        await new Promise(r => setTimeout(r, 600));
        setCurrentStep(5); // Storage
        await new Promise(r => setTimeout(r, 600));
        setCurrentStep(6); // Done
      }

    } catch (err) {
      console.error("UI Ingestion Error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ingestion failed due to an unexpected system error.");
      }
      setCurrentStep(-1);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
       <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="text-[#FFB000]" />
            Ingestion Pipeline
          </h2>
          <p className="text-slate-400 mt-2 text-lg">Upload learning materials to the Ryze Knowledge Base. The AI Engine performs advanced layout analysis, OCR, chunking, and vectorisation.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* Left Column: Upload & Status */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Upload Card */}
             <div 
               onClick={() => !isProcessing && fileInputRef.current?.click()}
               className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center h-72 relative overflow-hidden ${
                 isProcessing ? 'border-slate-700 bg-white/5 opacity-50 cursor-not-allowed' : 'border-white/10 hover:border-[#FFB000] hover:bg-white/5 bg-[#0a0f1e]'
               }`}
             >
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#FFB000] rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity"></div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                />
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform relative z-10 ${isProcessing ? 'bg-white/5 text-slate-500' : 'bg-white/5 text-[#FFB000] border border-white/10 group-hover:scale-110 group-hover:bg-[#FFB000] group-hover:text-[#0a0f1e]'}`}>
                   {isProcessing ? <Loader2 size={36} className="animate-spin" /> : <Upload size={36} />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">
                  {isProcessing ? 'Ingesting Content...' : 'Upload Document'}
                </h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto relative z-10">
                  Supported: PNG, JPG (Scanned Worksheets, Exam Papers). <br/>Max 10MB.
                </p>
             </div>

             {/* Pipeline Visualizer */}
             <div className="bg-[#0a0f1e] rounded-[2rem] border border-white/5 p-8 shadow-lg">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Processing Status</h4>
                <div className="space-y-6">
                   {PIPELINE_STEPS.map((step, idx) => {
                      const isCompleted = currentStep > idx;
                      const isActive = currentStep === idx;

                      return (
                        <div key={step.id} className="flex items-center gap-4">
                           <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isCompleted ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                              isActive ? 'bg-[#FFB000] text-[#0f172a] scale-110 shadow-[0_0_20px_rgba(255,176,0,0.4)] border border-[#FFB000]' :
                              'bg-white/5 text-slate-600 border border-white/5'
                           }`}>
                              {isActive && <div className="absolute inset-0 rounded-full bg-[#FFB000] animate-ping opacity-25"></div>}
                              {isCompleted ? <CheckCircle size={18} /> : <step.icon size={18} className={isActive ? "animate-pulse" : ""} />}
                           </div>
                           <div className="flex-1">
                              <div className={`text-sm font-medium transition-colors ${isActive ? 'text-white font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                                 {step.name}
                              </div>
                              {isActive && (
                                <div className="h-1 w-full bg-white/5 rounded-full mt-2.5 overflow-hidden">
                                   <div className="h-full bg-[#FFB000] animate-pulse w-full"></div>
                                </div>
                              )}
                           </div>
                        </div>
                      );
                   })}
                </div>
                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 text-red-400 text-sm rounded-xl flex items-start gap-3 border border-red-500/20">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" /> 
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}
             </div>

          </div>

          {/* Right Column: Results Preview */}
          <div className="lg:col-span-8">
             {result ? (
               <div className="bg-[#0a0f1e] rounded-[2rem] border border-white/5 shadow-2xl h-full flex flex-col overflow-hidden">
                  <div className="p-8 border-b border-white/5 bg-[#0a0f1e] flex justify-between items-center">
                     <h3 className="font-bold text-white text-xl flex items-center gap-3">
                        <FileJson size={24} className="text-[#FFB000]" />
                        Digital Twin
                     </h3>
                     <div className="flex gap-2">
                        {result.topics.map(t => (
                           <span key={t} className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                              {t}
                           </span>
                        ))}
                        <span className="px-4 py-1.5 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/20">
                           {result.difficulty}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050510]/50 scroll-smooth">
                     
                     {/* Summary Section */}
                     <div className="p-6 bg-[#0a0f1e] rounded-2xl border border-white/5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Summary</h4>
                        <p className="text-slate-300 leading-relaxed text-lg">{result.summary}</p>
                     </div>

                     {/* Semantic Chunks */}
                     {chunks.length > 0 && (
                        <div>
                           <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                                 <Scissors size={16} className="text-[#FFB000]" /> Semantic Chunks
                              </h4>
                              <span className="text-xs text-slate-600 font-mono bg-white/5 px-2 py-1 rounded">{chunks.length} Chunks Created</span>
                           </div>
                           <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2 scroll-smooth">
                              {chunks.map((chunk, i) => (
                                 <div key={i} className="bg-[#0a0f1e] border border-white/5 rounded-xl p-4 text-xs text-slate-400 font-mono hover:border-white/20 transition-colors">
                                    <div className="mb-2 flex justify-between opacity-50">
                                       <span>ID: chunk_{i}</span>
                                       <span>{chunk.length} chars</span>
                                    </div>
                                    <div className="whitespace-pre-wrap">{chunk}</div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Extracted Text */}
                        <div>
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
                              <FileText size={16} className="text-[#FFB000]" /> OCR Extraction
                           </h4>
                           <div className="bg-[#0a0f1e] p-6 rounded-2xl border border-white/5 text-sm text-slate-400 font-mono whitespace-pre-wrap max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scroll-smooth">
                              {result.extractedText}
                           </div>
                        </div>

                        {/* Vision Analysis */}
                        <div>
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
                              <Eye size={16} className="text-[#FFB000]" /> Vision Analysis
                           </h4>
                           <div className="space-y-4">
                              {result.diagrams.length > 0 ? result.diagrams.map((d, i) => (
                                 <div key={i} className="bg-[#FFB000]/5 p-5 rounded-2xl border border-[#FFB000]/20 text-sm">
                                    <span className="font-bold text-[#FFB000] block mb-2">{d.type}</span>
                                    <span className="text-slate-300 leading-relaxed">{d.description}</span>
                                 </div>
                              )) : (
                                 <div className="text-slate-600 text-sm italic border border-white/5 p-4 rounded-xl text-center">No diagrams detected.</div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Structure Analysis */}
                     {result.structure && result.structure.length > 0 && (
                        <div>
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
                              <Layers size={16} className="text-[#FFB000]" /> Document Structure
                           </h4>
                           <div className="grid grid-cols-1 gap-4">
                              {result.structure.map((section, i) => (
                                 <div key={i} className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-6 shadow-sm hover:border-white/10 transition-colors">
                                    <h5 className="font-bold text-white mb-3 text-sm uppercase tracking-wide border-b border-white/5 pb-3">{section.header}</h5>
                                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{section.content}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Tables */}
                     {result.tables && result.tables.length > 0 && (
                        <div>
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
                              <Table size={16} className="text-[#FFB000]" /> Extracted Tables
                           </h4>
                           <div className="space-y-6">
                              {result.tables.map((table, i) => (
                                 <div key={i} className="bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                                    {table.caption && <div className="bg-white/5 px-6 py-3 border-b border-white/5 text-sm font-bold text-slate-300">{table.caption}</div>}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-black/20 text-slate-400 border-b border-white/5">
                                                <tr>
                                                    {table.headers.map((h, hi) => <th key={hi} className="px-6 py-3 font-bold whitespace-nowrap uppercase text-xs tracking-wider">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {table.rows.map((row, ri) => (
                                                    <tr key={ri} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                        {row.cells.map((cell, ci) => <td key={ci} className="px-6 py-3 text-slate-300">{cell}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Original Image */}
                     <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Source Document</h4>
                        <div className="rounded-2xl overflow-hidden border border-white/5 bg-black">
                           <img src={previewUrl || ''} alt="Source" className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                     </div>

                  </div>
               </div>
             ) : (
               <div className="h-full rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-600 bg-[#0a0f1e]/50">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                     <Database size={48} className="opacity-30" />
                  </div>
                  <p className="font-bold text-lg text-slate-500">Waiting for ingestion...</p>
                  <p className="text-sm opacity-60 mt-2">Upload a document to see the extraction result.</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};
