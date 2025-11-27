
import React from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { Microscope, BedDouble, BellOff, Zap, ArrowRight, XCircle, CheckCircle2, Quote } from 'lucide-react';

const TheRyzeTruth: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-20 font-sans bg-white">
      {/* Header */}
      <div className="bg-white pt-24 pb-24 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-sans font-bold mb-6 text-slate-900 tracking-tight">The Ryze Truth</h1>
          <p className="text-xl text-slate-500 font-light">The story behind why most tutoring fails, and how we fixed it.</p>
        </div>
      </div>

      {/* The Intro / Story Section */}
      <section className="py-24 px-4 max-w-2xl mx-auto">
        <div className="prose prose-lg prose-slate mx-auto font-light text-slate-600">
          <p className="mb-8">
            Parents rarely come to us at the beginning.
            <br/>They come when they’re tired — and when their child is tired too.
          </p>
          <p className="mb-8">
            Before they reach Ryze, most families have already cycled through a handful of tutoring centres.
            <br/>They’ve paid the fees, done the weekly sessions, followed every recommendation.
            <br/>Months go by. The routines become familiar.
          </p>
          <p className="mb-8 font-medium text-slate-900 text-xl">
            But the understanding never really changes.
          </p>
          <p className="mb-8">
            Meanwhile their child feels themselves slipping — comparing their progress to everyone else’s, wondering why they’re still stuck, wondering what’s wrong with them.
          </p>
          <div className="border-l-4 border-ryze pl-6 py-2 my-10">
            <p className="text-slate-900 italic text-lg">
              And that’s the tragedy: not that the tutoring didn’t work, but that the child starts to believe <strong>they</strong> didn’t work.
            </p>
          </div>
          <p className="mb-8">
            The truth is simpler and far less cruel.
            <br/>They were placed in environments that weren’t built to notice them — classrooms too crowded to see their confusion, too rigid to adapt to their pace, too busy to hear their questions.
          </p>
          <p className="text-slate-900 font-bold text-lg">
            Nothing was wrong with them.
            <br/>Something was wrong with the setup around them.
          </p>
        </div>
      </section>

      {/* I Know This Because I've Lived It */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-[100px] opacity-40 -z-10"></div>
        <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-sans font-bold text-slate-900 mb-12 text-center">I Know This Because I've Lived It</h2>
            <div className="prose prose-lg prose-slate mx-auto text-slate-600 font-light">
                <p className="mb-6">
                    I still remember the feeling.
                    <br/>Packing my bag after school, that weight settling in my chest. Not the weight of textbooks — the weight of knowing where I was headed next.
                </p>
                <p className="mb-6 font-medium">
                    The bus ride to tutoring. Twenty minutes of dread.
                </p>
                <p className="mb-6">
                    I’d walk into that centre and become invisible. Just another student in a room of twenty others, all of us sitting in rows, staring at a whiteboard while a tutor droned through problems like they were reading a script they’d memorised years ago.
                </p>
                <p className="text-slate-900 font-bold italic mb-6">15 hours. Every week.</p>
                <p className="mb-6">
                    I wasn’t learning. I was enduring.
                </p>
                <p className="mb-6">
                    The tutor didn’t know my name. Didn’t notice when I zoned out. Didn’t see the confusion on my face when they skipped steps I didn’t understand. I was a seat filled, a number on their attendance sheet, revenue on their spreadsheet.
                </p>
                
                <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 my-12 text-center border border-slate-100">
                    <Quote className="text-ryze w-10 h-10 mx-auto mb-6 opacity-50" />
                    <p className="font-bold text-slate-900 text-xl mb-4">Why am I falling behind when everyone else seems fine?</p>
                    <p className="font-bold text-slate-900 text-xl mb-4">Why can’t I just get this?</p>
                    <p className="font-bold text-slate-900 text-2xl text-ryze">What’s wrong with me?</p>
                </div>

                <p className="mb-6">
                    I started to believe I wasn’t smart enough. That I wasn’t “a math person.” That maybe I just didn’t have what it took.
                </p>
                <p className="mb-6">
                    The truth—the one I couldn’t see then—was simpler:
                    <br/><strong className="text-slate-900 font-bold">Nothing was wrong with me. Something was wrong with the environment.</strong>
                </p>
                <p className="mb-6">
                    I wasn’t stupid. I wasn’t lazy. I just needed someone to actually see me, to notice where I was stuck, to teach in a way that made sense to <i>me</i>—not to some imaginary average student in the middle of the class.
                </p>
                <p className="text-lg font-medium text-slate-900">
                    That experience left me with a question: Why does so much tutoring fail to actually help?
                </p>
            </div>
        </div>
      </section>

      {/* The 4 Problems Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-sans font-bold text-slate-900 mb-4">Why Tutoring Fails</h2>
             <p className="text-slate-500">The systemic issues we identified and solved.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Problem 1 */}
            <div className="bg-slate-50 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-red-100 hover:shadow-lg transition-all duration-300 group">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-500 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                 <Microscope size={32} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">Problem 1 - Misdiagnosis</h3>
               <p className="text-slate-600 leading-relaxed">Most tutoring treats symptoms, not causes. A student struggles with quadratic equations, so they get drilled on quadratics. But often the real issue is three years back—incomplete understanding of fractions or basic algebra. Without diagnosing the foundational gap, you're building on sand.</p>
            </div>

            {/* Problem 2 */}
            <div className="bg-slate-50 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-purple-100 hover:shadow-lg transition-all duration-300 group">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-purple-500 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                 <BedDouble size={32} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">Problem 2 - Passive Learning</h3>
               <p className="text-slate-600 leading-relaxed">Sitting and watching someone solve problems doesn't create understanding. Real learning requires active struggle—attempting problems, making mistakes, getting immediate feedback, and trying again. Large classes default to passive learning because managing active learning for twenty different students simultaneously is nearly impossible.</p>
            </div>

            {/* Problem 3 */}
            <div className="bg-slate-50 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-500 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                 <BellOff size={32} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">Problem 3 - The Silence Problem</h3>
               <p className="text-slate-600 leading-relaxed">Students don't ask questions in large groups. Not because they're shy, but because the social cost is high and the benefit is uncertain. Will the tutor actually help, or will they give a rushed explanation before moving on? In my old tutoring centre, I asked maybe three questions across six months.</p>
            </div>

            {/* Problem 4 */}
            <div className="bg-slate-50 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-ryze hover:shadow-lg transition-all duration-300 group">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-ryze mb-8 shadow-sm group-hover:scale-110 transition-transform">
                 <Zap size={32} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">Problem 4 - Mismatched Pacing</h3>
               <p className="text-slate-600 leading-relaxed">Every student needs a different pace. In large classes, tutors teach to the middle. Advanced students waste time. Struggling students get left behind. Almost no one gets what they actually need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Small Groups Work */}
      <section className="py-24 px-4 bg-slate-900 text-white">
         <div className="max-w-4xl mx-auto">
           <h2 className="text-4xl font-sans font-bold mb-12 text-center">Why Small Groups Actually Work</h2>
           <div className="prose prose-lg prose-invert mx-auto">
             <p className="leading-relaxed mb-12 text-center text-xl text-slate-300">
                I’m not claiming small groups are magic. Bad teaching is bad teaching regardless of class size. But small groups enable something that large classes cannot: <span className="text-white font-bold">adaptive, individualised teaching.</span>
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                {[
                  { title: "Real Diagnosis", text: "I can assess each student individually. I can trace their confusion back to its source." },
                  { title: "Active Learning", text: "I watch them work. I see where they hesitate. Then I intervene at exactly the right moment." },
                  { title: "Questions Answered", text: "Asking questions feels normal. I can give thorough answers without others sitting idle." },
                  { title: "Flexible Pacing", text: "I can adjust the speed for each student. If someone needs more time, they get it." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 p-8 rounded-2xl border border-white/10">
                     <h4 className="text-ryze font-bold text-xl mb-3">{item.title}</h4>
                     <p className="text-slate-300 leading-relaxed">{item.text}</p>
                  </div>
                ))}
             </div>
           </div>
         </div>
      </section>

      {/* What This Actually Costs */}
      <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-4xl font-sans font-bold text-slate-900 mb-8">The Cost of Quality</h2>
              <div className="prose prose-lg prose-slate mx-auto font-light text-slate-600 leading-relaxed">
                  <p className="mb-6">
                    I need to be direct about pricing: small group tutoring costs more than large classes.
                  </p>
                  <p className="mb-6">
                    Here’s why: If I’m teaching six students instead of twenty, I need to charge more per student to make the business viable. That’s basic math.
                  </p>
                  <p className="mb-6">
                    We charge what we do because that’s what it costs to pay qualified tutors properly, maintain quality facilities, and limit class sizes to six students maximum.
                  </p>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mt-8">
                    <p className="font-medium text-slate-900">
                        This isn’t for everyone. If cost is your primary constraint, large group tutoring might be better. But if you’re looking for something that actually works — then the higher price reflects the actual value: individualised attention that produces results.
                    </p>
                  </div>
              </div>
          </div>
      </section>

      {/* What Results Look Like */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-5xl mx-auto px-4">
           <h2 className="text-4xl font-sans font-bold text-slate-900 mb-16 text-center">What Results Look Like</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-3xl shadow-sm border-t-4 border-green-500">
                   <h3 className="font-bold text-lg mb-4 text-slate-900">Confidence</h3>
                   <p className="text-slate-600 text-sm leading-relaxed">Students who came to us convinced they “weren’t math people” start consistently scoring B’s and A’s—not because we worked magic, but because we filled their gaps.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-sm border-t-4 border-blue-500">
                   <h3 className="font-bold text-lg mb-4 text-slate-900">Engagement</h3>
                   <p className="text-slate-600 text-sm leading-relaxed">Advanced students who felt bored get extension material. They start enjoying the subject again. Their teachers notice the difference.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-sm border-t-4 border-ryze">
                   <h3 className="font-bold text-lg mb-4 text-slate-900">Participation</h3>
                   <p className="text-slate-600 text-sm leading-relaxed">Students who went months without asking a single question now ask ten, fifteen, twenty questions in their first session. They finally feel safe to learn.</p>
               </div>
           </div>

           <p className="text-center text-slate-500 mt-12 italic">
             These aren’t miracles. They’re what happens when students get appropriate attention and teaching targeted to their actual needs.
           </p>
        </div>
      </section>

      {/* What We're Not / What We Are */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-red-50 p-12 rounded-[3rem]">
              <h2 className="text-3xl font-bold text-red-500 mb-8">What We're Not</h2>
              <ul className="space-y-6 text-slate-700 font-medium">
                <li className="flex gap-4 items-center"><XCircle className="text-red-400 shrink-0" size={24} /> We’re not a magic solution. We can’t fix everything.</li>
                <li className="flex gap-4 items-center"><XCircle className="text-red-400 shrink-0" size={24} /> We’re not the cheapest option. We can’t be.</li>
                <li className="flex gap-4 items-center"><XCircle className="text-red-400 shrink-0" size={24} /> We’re not promising straight A’s or admission.</li>
              </ul>
            </div>
            <div className="bg-green-50 p-12 rounded-[3rem]">
              <h2 className="text-3xl font-bold text-green-600 mb-8">What We Are</h2>
              <div className="space-y-6 text-slate-700 leading-relaxed">
                  <p>We’re a tutoring centre that deliberately limits class sizes to six students because that’s the threshold where individualised teaching becomes possible.</p>
                  <p>We diagnose where students actually struggle, not where the curriculum says they should be.</p>
                  <p>We charge accordingly because quality teaching at small ratios costs more to deliver.</p>
              </div>
            </div>
         </div>
      </section>

      {/* Conclusion Quote */}
      <section className="py-20 bg-[#FFF8E7] text-center px-4 border-y border-ryze/20">
          <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed font-sans">
                  "At Ryze, you’re not a number. You’re not a headcount.<br/>
                  You matter. Your questions matter.<br/>
                  Your progress matters."
              </p>
          </div>
      </section>

      {/* The Real Question CTA */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-sans font-bold text-ryze mb-8">The Real Question</h2>
          
           <p className="text-slate-900 text-xl mb-8 font-medium">
             The question isn’t whether small groups are better than large groups in some abstract sense.
             <br/>The question is: <span className="font-bold underline decoration-ryze decoration-4 underline-offset-4">has what you’re currently doing worked?</span>
           </p>
           <p className="text-slate-600 mb-12 leading-relaxed">
             If your child has been attending tutoring for months and nothing has changed, then something about that environment isn’t working for them.
             Maybe they need individual diagnosis. Maybe they need space to ask questions. Maybe they need a different pace.
           </p>
           
           <button 
             onClick={() => navigate('/contact')}
             className="px-12 py-5 bg-ryze text-white font-bold rounded-full shadow-xl hover:bg-ryze-600 transition-all transform hover:-translate-y-1 inline-flex items-center gap-3 text-lg"
           >
             Book a Trial Lesson <ArrowRight size={24} />
           </button>
           
           <p className="font-bold text-slate-400 text-sm mt-8 uppercase tracking-wide">
             If it works, continue. If it doesn’t, at least you’ll know.
           </p>
        </div>
      </section>
    </div>
  );
};

export default TheRyzeTruth;
