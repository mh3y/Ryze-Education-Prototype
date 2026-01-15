
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaUsers, FaCalendar, FaCreditCard, FaSync, FaGift, FaComments, FaDollarSign, FaBrain, FaLaptop, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import { HelpCircle, Award, Zap, BarChart2, BookOpen, CheckCircle, Users, Clock, Star } from 'lucide-react';

const EarlyEnrolmentItem = ({ percentage, dateString }) => {
    const datePart = dateString.replace(/before /i, '').trim();
    const parsedDate = new Date(datePart);
    parsedDate.setDate(parsedDate.getDate() + 1);
    const now = new Date();
    const hasExpired = now >= parsedDate;

    return (
        <li className="flex items-center gap-4">
            <div
                className={`flex h-full w-20 items-center justify-center rounded font-bold text-sm shrink-0 py-1 ${
                    hasExpired
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-emerald-100 text-emerald-700'
                }`}
            >
                <span className={hasExpired ? 'line-through' : ''}>{percentage}</span>
            </div>
            <div
                className={`text-sm ${
                    hasExpired ? 'line-through text-slate-400' : 'text-slate-600'
                }`}
            >
                {dateString}
            </div>
        </li>
    );
};

const LearningStyle: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleToggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="pt-20 font-sans bg-slate-25 min-h-screen">
      <div className="bg-white pt-24 pb-24 px-4 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-slate-50 to-transparent opacity-50 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-sans font-bold mb-6 text-slate-900 tracking-tight">Choose Your Learning Style</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-20">
        <div className="flex flex-col lg:flex-row gap-10 justify-center items-stretch">
        <div className="w-full lg:w-1/2 bg-[#2a2021] text-white p-8 rounded-3xl border border-amber-800/50 shadow-2xl shadow-amber-900/20 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-900/40 via-transparent to-transparent"></div>
              <div className="relative z-10 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                      <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">Best Value</div>
                  </div>
                  <div className="text-center my-6">
                      <div className="inline-block p-5 bg-amber-800/30 rounded-2xl mb-6 border border-amber-700/50">
                          <FaUsers className="text-4xl text-amber-300" />
                      </div>
                      <h2 className="text-4xl font-bold text-white mb-2">Group Tutoring</h2>
                      <p className="text-lg text-amber-200/80">Collaborative learning with peers</p>
                  </div>
                  <div className="flex justify-center items-center gap-4 my-4">
                      <span className="flex items-center gap-2 bg-amber-900/60 text-amber-200 px-4 py-2 rounded-full text-sm font-medium"><FaLaptop /> Online</span>
                  </div>
                  <div className="space-y-5 mb-10 flex-grow mt-8">
                      <NewFeatureItem title="Cost-effective learning" subtitle="Share costs while maintaining quality" darkTheme={false} />
                      <NewFeatureItem title="Peer learning benefits" subtitle="Learn from classmates and their questions" darkTheme={false} />
                      <NewFeatureItem title="Social learning environment" subtitle="Build confidence through group interaction" darkTheme={false} />
                      <NewFeatureItem title="Small group sizes" subtitle="Maximum 6 students for optimal attention" darkTheme={false} />
                  </div>
                  <button onClick={() => handleToggle('group')} className="w-full py-4 rounded-xl font-bold text-lg text-slate-900 bg-amber-500 hover:bg-amber-600 transition-all duration-300 shadow-lg shadow-amber-900/30">Find Out More</button>
              </div>
          </div>

          <div className="w-full lg:w-1/2 bg-[#0f172a] text-white p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-600/30 transition-colors duration-500"></div>
              <div className="relative z-10 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Star size={14} className="text-[#FFB000]" /> Premium Choice
                     </div>
                      <motion.div
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
                          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-400 rounded-full px-4 py-1.5 shadow-lg shadow-orange-500/20"
                      >
                          <Zap className="w-4 h-4 text-white" />
                          <span className="text-white text-xs font-bold uppercase tracking-wider">Limited Availability</span>
                      </motion.div>
                  </div>
                  <div className="text-center my-6">
                      <div className="inline-block p-5 bg-white/10 rounded-2xl mb-6 border border-white/10">
                          <FaUser className="text-4xl text-white" />
                      </div>
                      <h2 className="text-4xl font-bold text-white mb-2">Private Mentorship</h2>
                      <p className="text-lg text-slate-400">One-on-one personalised learning</p>
                  </div>
                  <div className="flex justify-center items-center gap-4 my-4">
                      <span className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium"><FaHome /> Face-to-Face</span>
                      <span className="text-slate-500">or</span>
                      <span className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium"><FaLaptop /> Online</span>
                  </div>
                  <div className="space-y-5 mb-10 flex-grow mt-8">
                      <NewFeatureItem title="Mentored by the best" subtitle="Direct access to our industry leading executive team" darkTheme={true} />
                      <NewFeatureItem title="Flexible scheduling" subtitle="Sessions that fit your timetable" darkTheme={true} />
                      <NewFeatureItem title="100% personalised attention" subtitle="Full focus on your individual learning needs" darkTheme={true} />
                      <NewFeatureItem title="Targeted skill development" subtitle="Focus on your specific strengths and weaknesses" darkTheme={true} />
                  </div>
                  <button onClick={() => handleToggle('private')} className="w-full py-4 rounded-xl font-bold text-lg text-[#0f172a] bg-white hover:bg-slate-200 transition-all duration-300 shadow-lg">Find Out More</button>
              </div>
          </div>
        </div>

        <AnimatePresence>
          {openSection && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
              {openSection === 'private' ? <PrivateTutoringDetails /> : <GroupTutoringDetails />}
            </motion.div>
          )}
        </AnimatePresence>

        <DiscountsSection />
        <FAQSection />

      </div>
    </div>
  );
};

const NewFeatureItem = ({ title, subtitle, darkTheme = true }: { title: string, subtitle: string, darkTheme: boolean }) => (
    <div className="flex items-start gap-3">
        <CheckCircle className={`w-5 h-5 shrink-0 mt-1 ${darkTheme ? 'text-green-400' : 'text-amber-400'}`} />
        <div>
            <h4 className={`font-bold ${darkTheme ? 'text-white' : 'text-amber-200/80'}`}>{title}</h4>
            <p className={`text-sm font-light ${darkTheme ? 'text-slate-400' : 'text-slate-400'}`}>{subtitle}</p>
        </div>
    </div>
);

const SpecialFeatureCard = ({ icon, title, text, color }) => (
    <div className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm border-l-4" style={{ borderColor: color }}>
        <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}1A`}}>{icon}</div>
        <div>
            <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
            <p className="text-slate-600 text-sm font-light">{text}</p>
        </div>
    </div>
);

const StructureCard = ({ icon, title, subtitle, features, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-start gap-4 mb-4">
            <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}1A`}}>{icon}</div>
            <div>
                <h4 className="font-bold text-slate-800">{title}</h4>
                <p className="text-slate-500 text-sm font-light">{subtitle}</p>
            </div>
        </div>
        <ul className="space-y-3">
            {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-slate-600 font-light">{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

const PrivateTutoringDetails = () => (
  <div className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200">
    <h2 className="text-4xl font-bold text-slate-900 text-center mb-12 tracking-tight">How Our Private Mentorship Works</h2>
    <div className="bg-[#1a1a2e] rounded-2xl p-8 my-12">
        <div className="flex flex-col sm:flex-row items-center gap-8">
            <div>
                <span className="inline-block bg-gray-800 border border-amber-400 rounded-lg px-6 py-2">
                    <span className="text-amber-400 font-bold tracking-widest text-sm">PREMIUM</span>
                </span>
            </div>
            <div className="border-l-2 border-slate-700 pl-8">
                <p className="text-indigo-200/80 text-lg">
                    We deliberately limit our private intake to ensure the highest quality of service and mentor availability.
                </p>
            </div>
        </div>
    </div>
    <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center"><span className="text-indigo-500 text-3xl mr-3">•</span>What Makes Us Special</h3>
            <SpecialFeatureCard icon={<Award className="text-indigo-500 w-7 h-7" />} title="100% Personalised Learning Plans" text="Custom learning plans tailored to your unique style and goals." color="#6366F1" />
            <SpecialFeatureCard icon={<Zap className="text-indigo-500 w-7 h-7" />} title="Expert Tutor Matching" text="Matched with tutors who excel in your subject and connect with your personality." color="#6366F1" />
            <SpecialFeatureCard icon={<BarChart2 className="text-indigo-500 w-7 h-7" />} title="Continuous Progress Tracking" text="Regular assessments and detailed reports keep you on track to success." color="#6366F1" />
        </div>
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center"><span className="text-indigo-500 text-3xl mr-3">•</span>Choose How You Learn Best</h3>
            <StructureCard icon={<FaLaptop className="text-indigo-500 w-7 h-7" />} title="Online Tutoring" subtitle="Live sessions via Zoom" features={["Study from anywhere in Australia", "Digital whiteboard and screen sharing"]} color="#6366F1" />
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-start gap-4 mb-2">
                    <div className="p-2 rounded-lg bg-indigo-100">
                        <FaHome className="text-indigo-500 w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">In-Person Tutoring</h4>
                        <p className="text-slate-500 text-sm font-light">Face-to-face learning</p>
                    </div>
                </div>
                <p className="text-slate-500 text-sm font-light mt-3">
                    Due to high demand, we’re limiting in-person tutoring to select areas to maintain our quality standards.
                </p>
                <p className="text-slate-500 text-sm font-light mt-3">
                    <Link to="/contact" className="text-indigo-500 font-bold">Get in touch for more information.</Link>
                </p>
            </div>
        </div>
    </div>
    <div className="text-center mt-16">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to Start Your Success Story?</h3>
        <Link to="/contact">
          <button className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition-all">Book Private Mentorship</button>
        </Link>
    </div>
  </div>
);

const GroupTutoringDetails = () => (
    <div className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200">
      <h2 className="text-4xl font-bold text-slate-900 text-center mb-12 tracking-tight">How Our Group Tutoring Works</h2>
      <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center"><span className="text-amber-500 text-3xl mr-3">•</span>What Makes Us Special</h3>
              <SpecialFeatureCard icon={<FaComments className="text-amber-500 w-7 h-7" />} title="Collaborative Learning Environment" text="Learn with peers, share ideas, and gain multiple perspectives on concepts." color="#F59E0B" />
              <SpecialFeatureCard icon={<FaDollarSign className="text-amber-500 w-7 h-7" />} title="Excellent Value for Money" text="Share costs while getting quality and personalized attention." color="#F59E0B" />
              <SpecialFeatureCard icon={<FaBrain className="text-amber-500 w-7 h-7" />} title="Motivation & Accountability" text="Stay motivated with study partners and build lasting friendships." color="#F59E0B" />
          </div>
          <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center"><span className="text-amber-500 text-3xl mr-3">•</span>Our Group Structure</h3>
              <StructureCard icon={<Users className="text-amber-500 w-7 h-7" />} title="Small Group Sizes" subtitle="Maximum 4-6 students per group" features={["Optimal size for personalized attention", "Everyone gets to participate actively"]} color="#F59E0B" />
              <StructureCard icon={<Clock className="text-amber-500 w-7 h-7" />} title="Extended Sessions" subtitle="120-minute focused learning blocks" features={["More time for deep understanding", "Theory instruction combined with practice questions"]} color="#F59E0B" />
          </div>
      </div>
      <div className="text-center mt-16">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to Join a Learning Community?</h3>
        <Link to="/contact">
          <button className="bg-amber-500 text-slate-900 font-bold py-4 px-8 rounded-xl hover:bg-amber-600 transition-all">Book Group Tutoring</button>
        </Link>
    </div>
    </div>
  );

const DiscountsSection = () => (
    <div className="max-w-6xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Available Discounts</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto font-light">Save up to 50% through early enrolment, multiple subjects, upfront payments, and referrals. Reach out to us to discuss how we can help you!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><FaCalendar size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">Early Enrolments</h3>
          </div>
          <ul className="space-y-4">
            <EarlyEnrolmentItem percentage="7.5%" dateString="before Dec 31, 2025" />
            <EarlyEnrolmentItem percentage="5%" dateString="before Jan 31, 2026" />
          </ul>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><FaCreditCard size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">Pay Year Upfront</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">Receive a <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 rounded">15% discount</span> when you pay for the full year in advance.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><FaSync size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">Rebate Rewards</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">Alternatively, we offer <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 rounded">7.5% rebate</span> / cash back towards your next course if you decide to continue the following term.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><FaUsers size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">Sibling Discounts</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center gap-3"><span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-sm shrink-0">10% off</span><span className="text-slate-600 text-sm">for the second child</span></li>
            <li className="flex items-center gap-3"><span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-sm shrink-0">15% off</span><span className="text-slate-600 text-sm">for the 3rd child</span></li>
          </ul>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><FaGift size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">Referral Bonus</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">Refer a friend and you’ll both receive a <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 rounded">$100 credit</span> towards your enrolments.</p>
          <p className="text-xs text-slate-400 italic">*Conditions apply. Credits are applied after successful enrolment.</p>
        </div>
      </div>
    </div>
);

const FAQ_DATA = [
    { q: "What makes Ryze different from other tutoring centres?", a: "Ryze sets itself apart through a dedicated student mentorship model. Our team of tutors, each with an ATAR of 99.00 or above, focuses on delivering comprehensive, individualised feedback to ensure students receive the personalised guidance necessary for exceptional results. Our mission goes beyond traditional tutoring—we aim to empower and support every student on their academic journey. \n \nIn addition to extensive out-of-class assistance, including intensive exam preparation and one-on-one mentorship sessions, our curated course content is designed to maximise performance. We specialise in high-yield exam strategies for OC, Selective School, and high school Maths assessments—proven techniques that consistently help students achieve top marks." },
    { q: "Do you offer trial lessons?", a: "Yes. We believe it’s important to experience the Ryze difference before making a commitment. That’s why we offer a paid trial lesson, which is fully refundable if you choose not to continue. This trial gives your child the opportunity to meet their tutor and experience our small-group learning environment, ensuring it’s the right fit for their needs." },
    { q: "Are materials included in the fee?", a: "Definitely! All course fees include our comprehensive learning resources, which consist of proprietary theory books, workbooks, and full access to the Ryze AI online platform. We ensure complete transparency—there are no hidden charges or additional resource fees." },
    { q: "How can Ryze help beyond the classroom?", a: "Ryze offers weekly one-on-one mentorship sessions designed to provide guidance beyond our standard tutoring curriculum. These sessions give students and parents the opportunity to receive tailored advice on a wide range of topics, including university pathways, school selection, extracurricular activities, study strategies, scholarship interview preparation, and more. Our mentorship program is completely free for all enrolled Ryze students and parents. Sessions are available on a first-come, first-served basis, and we carefully match each participant with a member of our industry-leading executive team who is best suited to their needs. At Ryze, we believe in mentoring students for success that goes beyond academics—helping them build confidence and plan for the future."},
];

const FAQSection = () => (
    <div className="max-w-4xl mx-auto py-16">
      <h2 className="text-4xl font-bold text-slate-900 text-center mb-12 tracking-tight">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {FAQ_DATA.map((faq, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-start gap-3 text-lg">
                    <HelpCircle size={24} className="text-amber-500 shrink-0 mt-0.5" />
                    {faq.q}
                </h3>
                <p className="text-slate-600 leading-relaxed pl-9 font-light">
                    {faq.a}
                </p>
            </div>
        ))}
      </div>
    </div>
);

export default LearningStyle;
