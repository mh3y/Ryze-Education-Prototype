
import React, { useState, useRef, useEffect } from 'react';
import { Brain, ChevronRight, Wand2, Zap, RefreshCw, Save, CheckCircle, FileJson, Trash2, ArrowUpRight, ChevronDown } from 'lucide-react';
import { RyzeAI, ChatMessage } from '../../services/ai';

const TOPICS = [
  "Algebra", "Calculus", "Geometry", "Trigonometry", 
  "Probability", "Statistics", "Financial Maths", 
  "Numbers & Arithmetic", "Linear Equations", "Quadratics", 
  "Integration", "Differentiation", "Vectors", "Complex Numbers"
];

const DIFFICULTIES = [
  "Easy", "Medium", "Hard", "Extension 1", "Extension 2"
];

// Skeleton Loader Component
const GenerationSkeleton = () => (
  <div className="space-y-8 animate-pulse">
     <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-white/10 rounded-xl"></div>
        <div className="h-8 w-32 bg-white/10 rounded-lg"></div>
     </div>
     
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* JSON Skeleton */}
        <div className="bg-[#0a0f1e] p-6 rounded-2xl border border-white/5 h-96 relative overflow-hidden">
           <div className="absolute top-4 right-4 text-white/5"><FileJson size={80} /></div>
           <div className="h-4 w-24 bg-white/10 rounded mb-6"></div>
           <div className="space-y-3 font-mono">
              <div className="h-3 w-1/3 bg-white/5 rounded"></div>
              <div className="h-3 w-2/3 bg-white/5 rounded"></div>
              <div className="h-3 w-1/2 bg-white/5 rounded"></div>
              <div className="h-3 w-3/4 bg-white/5 rounded"></div>
              <div className="h-3 w-1/4 bg-white/5 rounded"></div>
              <div className="h-3 w-full bg-white/5 rounded"></div>
           </div>
        </div>

        {/* Preview Skeleton */}
        <div className="bg-[#0a0f1e] p-8 rounded-2xl border border-white/5 h-96 flex flex-col">
           <div className="h-6 w-24 bg-[#FFB000]/20 rounded-full mb-8"></div>
           <div className="space-y-4 mb-8">
              <div className="h-4 w-full bg-white/10 rounded"></div>
              <div className="h-4 w-full bg-white/10 rounded"></div>
              <div className="h-4 w-3/4 bg-white/10 rounded"></div>
           </div>
           
           <div className="bg-[#050510] p-6 rounded-xl border border-white/5 flex-grow">
              <div className="h-3 w-20 bg-[#FFB000]/30 rounded mb-4"></div>
              <div className="h-3 w-full bg-white/5 rounded"></div>
           </div>
        </div>
     </div>
  </div>
);

export const AiArena: React.FC = () => {
  const [mode, setMode] = useState<'chat' | 'generator'>('chat');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [genConfig, setGenConfig] = useState({ topic: 'Calculus', difficulty: 'Medium' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await RyzeAI.chat(chatHistory, input);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const jsonStr = await RyzeAI.generateQuestion(genConfig.topic, genConfig.difficulty);
      setGeneratedContent(JSON.parse(jsonStr));
    } catch (e) {
      setGeneratedContent({ error: "Failed to parse generated content." });
    }
    setIsGenerating(false);
  };

  return (
    // Responsive Height calculation to fit mobile viewports without double scrollbars
    <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col max-w-6xl mx-auto bg-[#0a0f1e] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <div className="p-4 md:p-8 border-b border-white/5 bg-[#0a0f1e] flex flex-col md:flex-row justify-between items-center gap-4 z-20 relative">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#FFB000] border border-white/5 shrink-0">
               <Brain size={24} />
            </div>
            <div>
               <h2 className="font-bold text-white text-base md:text-lg">Ryze AI Engine</h2>
               <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></span> DeepSeek V3
               </div>
            </div>
         </div>
         
         <div className="flex bg-black/20 p-1.5 rounded-xl border border-white/5 w-full md:w-auto">
            <button 
              onClick={() => setMode('chat')}
              className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${mode === 'chat' ? 'bg-[#FFB000] text-[#0a0f1e] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Tutor Chat
            </button>
            <button 
              onClick={() => setMode('generator')}
              className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${mode === 'generator' ? 'bg-[#FFB000] text-[#0a0f1e] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Question Generator
            </button>
         </div>
      </div>

      {/* --- CHAT MODE --- */}
      {mode === 'chat' && (
        <div className="flex-1 flex flex-col relative bg-[#050510] overflow-hidden">
          {/* Clear History Button */}
          {chatHistory.length > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setChatHistory([])} 
                className="p-3 bg-[#0a0f1e] text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-full shadow-lg border border-white/5 transition-all group"
                title="Clear Chat History"
              >
                <Trash2 size={18} />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 hidden md:block">Clear History</span>
              </button>
            </div>
          )}

          <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 md:space-y-8 scroll-smooth">
             {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
                   <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                      <Brain size={40} className="opacity-50" />
                   </div>
                   <p className="text-base md:text-lg font-medium text-slate-400">Start a conversation with Ryze AI Tutor.</p>
                   <p className="text-xs md:text-sm text-slate-600 mt-2">Ask about calculus, essay structure, or physics concepts.</p>
                </div>
             )}
             {chatHistory.map((msg, idx) => (
               <div key={idx} className={`flex gap-3 md:gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-[10px] md:text-xs font-bold shadow-lg ${
                    msg.role === 'user' 
                    ? 'bg-[#FFB000] text-[#0a0f1e]' 
                    : 'bg-[#0a0f1e] text-white border border-white/10'
                 }`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                 </div>
                 <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl text-sm md:text-[15px] leading-relaxed shadow-md max-w-[80%] md:max-w-2xl break-words ${
                    msg.role === 'user' 
                    ? 'bg-[#FFB000] text-[#0a0f1e] rounded-tr-none font-medium' 
                    : 'bg-[#0a0f1e] border border-white/10 text-slate-300 rounded-tl-none'
                 }`}>
                    {msg.text}
                 </div>
               </div>
             ))}
             {isTyping && (
                <div className="flex gap-3 md:gap-5">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0a0f1e] text-white flex items-center justify-center flex-shrink-0 mt-1 text-[10px] md:text-xs font-bold border border-white/10">AI</div>
                   <div className="bg-[#0a0f1e] border border-white/10 px-4 py-4 md:px-6 md:py-5 rounded-2xl md:rounded-3xl rounded-tl-none shadow-sm flex items-center gap-4">
                      <div className="flex gap-1.5">
                         <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FFB000] rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                         <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FFB000] rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                         <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FFB000] rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-[#FFB000] uppercase tracking-wider animate-pulse">Thinking...</span>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 md:p-6 bg-[#0a0f1e] border-t border-white/5">
            <div className="relative max-w-4xl mx-auto flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for help..." 
                  className="flex-1 pl-4 md:pl-6 pr-12 py-3 md:py-5 rounded-xl md:rounded-2xl bg-[#050510] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB000]/50 focus:ring-1 focus:ring-[#FFB000]/50 transition-all text-base md:text-lg shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-3 md:p-4 bg-[#FFB000] rounded-xl text-[#0a0f1e] hover:bg-[#ffc133] disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition-all flex-shrink-0"
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- GENERATOR MODE --- */}
      {mode === 'generator' && (
        <div className="flex-1 p-4 md:p-8 lg:p-12 bg-[#050510] overflow-y-auto scroll-smooth">
           <div className="max-w-3xl mx-auto">
              {!generatedContent && !isGenerating ? (
                 <div className="bg-[#0a0f1e] p-6 md:p-10 rounded-[2rem] shadow-xl border border-white/5 relative overflow-hidden">
                    {/* Background Blob */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFB000] rounded-full blur-[120px] opacity-5 pointer-events-none"></div>

                    <div className="text-center mb-10 relative z-10">
                       <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FFB000]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#FFB000] border border-[#FFB000]/20">
                          <Wand2 size={32} />
                       </div>
                       <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Content Generator</h3>
                       <p className="text-sm md:text-base text-slate-400">Generate exam-style questions with real-time curriculum grounding.</p>
                    </div>
                    
                    <div className="space-y-6 mb-10 relative z-10">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Topic</label>
                          <div className="relative">
                              <select 
                                value={genConfig.topic}
                                onChange={(e) => setGenConfig({...genConfig, topic: e.target.value})}
                                className="w-full p-4 pr-10 rounded-xl border border-white/10 bg-[#050510] text-white focus:border-[#FFB000] focus:ring-1 focus:ring-[#FFB000] outline-none transition-all appearance-none cursor-pointer text-sm md:text-base"
                              >
                                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Difficulty</label>
                          <div className="relative">
                              <select
                                value={genConfig.difficulty}
                                onChange={(e) => setGenConfig({...genConfig, difficulty: e.target.value})}
                                className="w-full p-4 pr-10 rounded-xl border border-white/10 bg-[#050510] text-white focus:border-[#FFB000] focus:ring-1 focus:ring-[#FFB000] outline-none transition-all appearance-none cursor-pointer text-sm md:text-base"
                              >
                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={handleGenerate}
                      className="w-full py-4 md:py-5 bg-white text-[#0a0f1e] font-bold rounded-xl shadow-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-3 text-base md:text-lg relative z-10"
                    >
                      <Zap size={20} className="text-[#FFB000] fill-current" />
                      Generate Content
                    </button>
                 </div>
              ) : (
                 <div className="space-y-8">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-xl md:text-2xl text-white">Generated Output</h3>
                       <button 
                          onClick={() => { setGeneratedContent(null); setIsGenerating(false); }} 
                          disabled={isGenerating}
                          className="flex items-center gap-2 text-xs md:text-sm text-[#FFB000] font-bold hover:text-white transition-colors bg-[#FFB000]/10 px-3 py-2 md:px-4 md:py-2 rounded-lg border border-[#FFB000]/20 disabled:opacity-50"
                       >
                          <RefreshCw size={14} /> Generate New
                       </button>
                    </div>
                    
                    {isGenerating ? (
                        <GenerationSkeleton />
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* JSON View */}
                          <div className="bg-[#0a0f1e] p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden h-96 hidden md:block">
                            <div className="absolute top-4 right-4 opacity-5 text-white"><FileJson size={80} /></div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Raw JSON</h4>
                            <pre className="text-xs font-mono text-slate-400 overflow-auto h-[300px] scrollbar-thin scrollbar-thumb-slate-700">
                                {JSON.stringify(generatedContent, null, 2)}
                            </pre>
                          </div>

                          {/* Preview */}
                          <div className="bg-[#0a0f1e] p-6 md:p-8 rounded-2xl border border-white/5 shadow-lg flex flex-col h-auto">
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-[#FFB000] text-[#0a0f1e] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Preview</span>
                            </div>
                            <p className="font-medium text-white mb-8 text-lg md:text-xl leading-relaxed">{generatedContent.stem}</p>
                            
                            <div className="bg-[#050510] p-6 rounded-xl text-sm text-slate-300 border border-white/5 mb-6">
                                <p className="font-bold mb-2 text-[#FFB000] uppercase text-xs tracking-widest">Solution</p>
                                <p className="text-base">{generatedContent.final_answer}</p>
                            </div>

                            {generatedContent.sources && generatedContent.sources.length > 0 && (
                                <div className="mt-auto pt-6 border-t border-white/5">
                                  <p className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Context Sources</p>
                                  <ul className="space-y-2">
                                      {generatedContent.sources.map((url: string, i: number) => (
                                        <li key={i}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 hover:underline truncate transition-colors">
                                              <ArrowUpRight size={12} /> {url}
                                            </a>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                            )}
                          </div>
                      </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
