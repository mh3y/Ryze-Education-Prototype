
import React from 'react';
import { BookOpen, FileText, CheckCircle, Clock } from 'lucide-react';
import { Course, Assignment } from '../../services/backend';

export const CoursesList: React.FC<{ courses: Course[] }> = ({ courses }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {courses.map(course => (
      <div key={course.id} className="bg-[#0a0f1e] p-8 rounded-3xl border border-white/5 shadow-lg hover:border-[#FFB000]/50 transition-all group">
         <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white/5 text-[#FFB000] rounded-2xl flex items-center justify-center font-bold text-lg border border-white/5 group-hover:bg-[#FFB000] group-hover:text-[#0a0f1e] transition-colors">
              {course.code.substring(0, 2)}
            </div>
            <span className="text-[10px] font-bold bg-white/5 text-slate-400 px-3 py-1.5 rounded-full border border-white/5 tracking-wider">{course.code}</span>
         </div>
         <h3 className="font-bold text-xl text-white mb-4 leading-tight">{course.title}</h3>
         <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#FFB000]" style={{ width: `${course.progress}%` }}></div>
         </div>
         <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>{course.progress}% Complete</span>
            <span>{course.students} Students</span>
         </div>
      </div>
    ))}
  </div>
);

export const AssignmentsList: React.FC<{ assignments: Assignment[] }> = ({ assignments }) => (
  <div className="bg-[#0a0f1e] rounded-[2rem] border border-white/5 overflow-hidden shadow-lg">
      <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-white/5 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-widest">
         <div className="col-span-6">Title</div>
         <div className="col-span-3">Due Date</div>
         <div className="col-span-3">Status</div>
      </div>
      {assignments.map(a => (
         <div key={a.id} className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors items-center group">
             <div className="col-span-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#FFB000] transition-colors">
                   <FileText size={18} />
                </div>
                <span className="font-medium text-slate-200 group-hover:text-white transition-colors text-base">{a.title}</span>
             </div>
             <div className="col-span-3 text-sm text-slate-500 flex items-center gap-2">
                <Clock size={16} /> {a.dueDate}
             </div>
             <div className="col-span-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${
                   a.status === 'graded' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                   a.status === 'submitted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                   'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/20'
                }`}>
                   {a.status === 'graded' && <CheckCircle size={12} />}
                   {a.status} {a.grade && `(${a.grade}%)`}
                </span>
             </div>
         </div>
      ))}
  </div>
);
