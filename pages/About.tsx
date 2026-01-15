
import React from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, XCircle, MessageSquareOff, ZapOff, ArrowRight, Brain, Microscope, BedDouble, BellOff, Zap } from 'lucide-react';

const About: React.FC = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: "Mr Mike Nojiri",
      role: "Co-Founder & Head of Education",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105290/Screenshot_2025-11-20_at_11.13.56_pm_gwdxn2.png",
      fallbackImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      creds: [
        "Master of Teaching | UNSW",
        "BSc(Maths)/BCompSc",
        "NSW Certified Teacher",
        "Maths Teacher | Stella Maris College",
        "The King's School Alumni"
      ],
      quote: "Small groups aren't just better—they're how teaching should work. Every student deserves individual attention.",
      bio: "Mike leads all teaching operations at Ryze. As a NSW-certified teacher currently teaching at Stella Maris College in Manly, he brings formal qualifications and daily classroom experience to every session. His patient, methodical approach helps students build genuine understanding, not just memorise formulas."
    },
    {
      name: "Mr William Gong",
      role: "Co-Founder & Head of Technology",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/Screenshot_2025-11-26_at_12.50.43_am_plfzbu.png",
      fallbackImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      creds: [
        "PhD - AI & Machine Learning Candidate | UNSW",
        "BDataSci - First Class Honours | UNSW",
        "North Sydney Boys High School Alumni"
      ],
      bio: "William co-founded Ryze to demonstrate the effectiveness of small-group learning. As Head of Technology, he oversees Ryze AI and curriculum development, ensuring rigorous standards. Ranking among UNSW's highest performers, his PhD research in AI directly informs Ryze's evidence-driven design."
    },
    {
      name: "Mr Michael Yang",
      role: "Founder & CEO",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      hscMarks: {
        "Mathematics Extension 1": "98",
        "Mathematics Extension 2": "95",
        "Engineering Studies": "95",
        "English Advanced": "93",
        "Physics": "93"
      },
      wordsFromFounder: "Michael founded Ryze after recognising the limitations of large, standardised tutoring environments. He set out to design a model prioritizing meaningful interaction. He built the organisation around small-group learning, capping classes at six students, employing teachers who value personalised instruction.",
      bio: "Michael founded Ryze after recognising the limitations of large, standardised tutoring environments. He set out to design a model prioritizing meaningful interaction. He built the organisation around small-group learning, capping classes at six students, employing teachers who value personalised instruction."
    }
  ];

  return (
    <div className="pt-20 font-sans">
      {/* Header */}
      <div className="bg-white pt-16 pb-20 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-slate-900">The Ryze Truth</h1>
        </div>
      </div>

      {/* The Story Section */}
      <section className="py-20 px-4 max-w-3xl mx-auto">
        <div className="prose prose-lg prose-slate mx-auto">
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-8">I Know This Because I've Lived It</h2>
          
          <p className="text-slate-600 leading-relaxed mb-6">
            I still remember the feeling.
            <br/>Packing my bag after school, that weight settling in my chest. Not the weight of textbooks — the weight of knowing where I was headed next.
            <br/>The bus ride to tutoring. Twenty minutes of dread.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            I'd walk into that centre and become invisible. Just another student in a room of twenty others, 
            all of us sitting in rows, staring at a whiteboard while a tutor droned through problems like 
            they were reading a script they'd memorised years ago.
          </p>
          <p className="text-slate-900 font-medium italic mb-6">
            15 hours. Every week.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            I wasn't learning. I was enduring.
            <br/>The tutor didn't know my name. Didn't notice when I zoned out. Didn't see the confusion on my face 
            when they skipped steps I didn't understand. I was a seat filled, a number on their attendance sheet, 
            revenue on their spreadsheet.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            But the worst part wasn't the boredom. It was the guilt.
            <br/>Sitting there, watching the clock, knowing my parents were paying for this. Knowing they worked hard for that money. 
            Knowing they believed this was helping me. And feeling like I was the problem.
          </p>

          <div className="bg-slate-50 p-8 rounded-2xl border-l-4 border-ryze my-10">
            <h3 className="text-xl font-bold italic text-slate-900 mb-2">Why am I falling behind when everyone else seems fine?</h3>
            <h3 className="text-xl font-bold italic text-slate-900 mb-2">Why can't I just get this?</h3>
            <h3 className="text-xl font-bold italic text-slate-900">What's wrong with me?</h3>
          </div>

          <p className="text-slate-600 leading-relaxed mb-6">
             I started to believe I wasn't smart enough. That I wasn't "a math person." That maybe I just didn't have what it took.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
             The truth—the one I couldn't see then—was simpler:
             <br/><strong className="text-slate-900 block mt-4 text-lg">Nothing was wrong with me. Something was wrong with the environment.</strong>
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
             I wasn't stupid. I wasn't lazy. I just needed someone to actually see me, to notice where I was stuck, to teach in a way that made sense to <i>me</i>—not to some imaginary average student in the middle of the class.
          </p>
          <p className="text-slate-600 leading-relaxed">
             That experience left me with a question: Why does so much tutoring fail to actually help?
          </p>
        </div>
      </section>

      {/* The 4 Problems */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-16 text-center">What I Learned About Why Tutoring Fails</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Problem 1 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
               <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                 <Microscope size={28} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">Problem 1 - Misdiagnosis</h3>
               <p className="text-slate-600 leading-relaxed">Most tutoring treats symptoms, not causes. A student struggles with quadratic equations, so they get drilled on quadratics. But often the real issue is three years back—incomplete understanding of fractions or basic algebra. Without diagnosing the foundational gap, you're building on sand.</p>
            </div>

            {/* Problem 2 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
               <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
                 <BedDouble size={28} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">Problem 2 - Passive Learning</h3>
               <p className="text-slate-600 leading-relaxed">Sitting and watching someone solve problems doesn't create understanding. Real learning requires active struggle—attempting problems, making mistakes, getting immediate feedback, and trying again. Large classes default to passive learning because managing active learning for twenty different students simultaneously is nearly impossible.</p>
            </div>

            {/* Problem 3 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
               <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 mb-6">
                 <BellOff size={28} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">Problem 3 - The Silence Problem</h3>
               <p className="text-slate-600 leading-relaxed">Students don't ask questions in large groups. Not because they're shy, but because the social cost is high and the benefit is uncertain. Will the tutor actually help, or will they give a rushed explanation before moving on? In my old tutoring centre, I asked maybe three questions across six months.</p>
            </div>

            {/* Problem 4 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
               <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-ryze mb-6">
                 <Zap size={28} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">Problem 4 - Mismatched Pacing</h3>
               <p className="text-slate-600 leading-relaxed">Every student needs a different pace. In large classes, tutors teach to the middle. Advanced students waste time. Struggling students get left behind. Almost no one gets what they actually need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Small Groups Work */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
         <h2 className="text-3xl font-display font-bold text-slate-900 mb-8 text-center">Why Small Groups Actually Work</h2>
         <div className="prose prose-lg prose-slate mx-auto">
           <p className="leading-relaxed mb-8">
              I'm not claiming small groups are magic. Bad teaching is bad teaching regardless of class size. But small groups enable something that large classes cannot: adaptive, individualised teaching.
           </p>
           <p className="leading-relaxed mb-8 font-bold">Here's what changes when we cap our classes at six students:</p>
           
           <ul className="space-y-6 list-none pl-0">
             <li className="flex gap-4">
               <div className="shrink-0 mt-1 text-ryze font-bold">•</div>
               <div><span className="font-bold text-slate-900">Real Diagnosis:</span> I can assess each student individually. I can trace their confusion back to its source—whether that's last week's lesson or a concept from three years ago.</div>
             </li>
             <li className="flex gap-4">
               <div className="shrink-0 mt-1 text-ryze font-bold">•</div>
               <div><span className="font-bold text-slate-900">Active Learning:</span> Every student works through problems during the session. I watch them work. I see where they hesitate, where their logic breaks down.</div>
             </li>
             <li className="flex gap-4">
               <div className="shrink-0 mt-1 text-ryze font-bold">•</div>
               <div><span className="font-bold text-slate-900">Questions Get Answered:</span> With six students, asking questions feels normal. Students ask when they're confused.</div>
             </li>
             <li className="flex gap-4">
               <div className="shrink-0 mt-1 text-ryze font-bold">•</div>
               <div><span className="font-bold text-slate-900">Flexible Pacing:</span> I can adjust the speed for each student. If someone needs fifteen minutes on a concept, they get it.</div>
             </li>
           </ul>
         </div>
      </section>

      {/* What Results Look Like */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
           <h2 className="text-3xl font-display font-bold text-slate-900 mb-8 text-center">What Results Look Like</h2>
           <p className="text-slate-600 leading-relaxed mb-6">
             I won't promise transformation. Some students need more than tutoring — they need curriculum changes, learning assessments, or different educational approaches entirely.
           </p>
           <p className="text-slate-600 leading-relaxed mb-6">
             But here's what happens when students get the right environment:
           </p>
           <p className="text-slate-600 leading-relaxed mb-6">
             Students who came to us convinced they "weren't math people" start consistently scoring B's and A's—not because we worked magic, but because we identified where their understanding broke down years ago and filled those gaps.
           </p>
           <p className="text-slate-600 leading-relaxed mb-6">
             Advanced students who felt bored and disengaged get extension material while others work at their level. They start enjoying the subject again. Their teachers notice.
           </p>
           <p className="text-slate-600 leading-relaxed">
             Students who went months without asking a single question at their previous centre ask ten, fifteen, twenty questions in their first session with us.
           </p>
        </div>
      </section>

      {/* What We're Not / Are */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-red-500 mb-6">What We're Not</h2>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-3"><XCircle className="text-red-400 shrink-0" /> We're not a magic solution. We can't fix everything.</li>
                <li className="flex gap-3"><XCircle className="text-red-400 shrink-0" /> We're not the cheapest option. We can't be, given our model.</li>
                <li className="flex gap-3"><XCircle className="text-red-400 shrink-0" /> We're not promising straight A's or university admission.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-6">What We Are</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We're a tutoring centre that deliberately limits class sizes to six students because that's the threshold where individualised teaching becomes possible.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                We diagnose where students actually struggle, not where the curriculum says they should be.
              </p>
              <p className="text-slate-600 leading-relaxed">
                We charge accordingly because quality teaching at small ratios costs more to deliver.
              </p>
            </div>
         </div>
      </section>

      {/* The Real Question */}
      <section className="py-16 bg-ryze-50 border-t border-ryze/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-ryze-600 mb-6">The Real Question</h2>
          
           <p className="text-slate-800 text-lg mb-6">
             The question isn't whether small groups are better than large groups in some abstract sense.
             <br/>The question is: <span className="font-bold">has what you're currently doing worked?</span>
           </p>
           <p className="text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
             If your child has been attending tutoring for months and nothing has changed, then something about that environment isn't working for them.
             If you want to see whether our approach works for your child, book a trial session.
           </p>
           <p className="font-bold text-slate-900 text-lg mb-8">
             If it works, continue. If it doesn't, at least you'll know.
           </p>

           <button 
             onClick={() => navigate('/contact')}
             className="px-8 py-4 bg-ryze text-white font-bold rounded-xl shadow-lg hover:bg-ryze-600 transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
           >
             Book a Trial Lesson <ArrowRight size={20} />
           </button>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-slate-900">Meet Our Team</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
              Meet the tutors who make learning click. Our experienced educators are committed to helping every student thrive.
            </p>
          </div>

          <div className="space-y-20">
            {team.map((member, idx) => (
              <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-start`}>
                  <div className="w-full md:w-1/3 shrink-0">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl relative group">
                      <img 
                        src={member.image} 
                        onError={(e) => {e.currentTarget.src = member.fallbackImage}}
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                      <div className="absolute bottom-0 left-0 p-6 text-white">
                         <h3 className="text-2xl font-bold font-display">{member.name}</h3>
                         <p className="text-ryze-200 font-medium">{member.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3 space-y-6">
                    <h3 className="text-3xl font-bold text-slate-900">{member.name}</h3>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                       <h4 className="font-bold text-slate-800 mb-4">HSC Marks</h4>
                       <ul className="space-y-2">
                         {member.hscMarks && Object.entries(member.hscMarks).map(([subject, score]) => (
                           <li key={subject} className="flex justify-between items-center text-slate-700 font-medium">
                             <span>{subject}</span>
                             <span className="font-mono font-bold text-ryze">{score}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                    {member.wordsFromFounder && (
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 mb-4">Words from our Founder</h4>
                        <p className="text-slate-600 leading-relaxed">{member.wordsFromFounder}</p>
                      </div>
                    )}
                    {member.quote && (
                       <blockquote className="border-l-4 border-ryze pl-6 italic text-slate-600 text-lg">
                         "{member.quote}"
                       </blockquote>
                    )}
                    <div className="prose prose-slate">
                       <p className="text-slate-600 leading-relaxed">
                         {member.bio}
                       </p>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
