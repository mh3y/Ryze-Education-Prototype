
import { Testimonial } from '../types';

export const testimonials: Testimonial[] = [
  // --- OC PLACEMENT (Min 5) ---
  {
    id: "oc-1",
    reviewerName: "Sarah Chen",
    reviewerType: "Parent",
    studentGrade: "Year 5",
    achievement: "Scored 246/300",
    message: "We're absolutely over the moon! Emma got her OC results today and she scored 246 so she's heading to Beecroft next year. Michael was very patient with her — he didn't just teach math, he taught her how to handle the pressure without panicking.",
    accent: "blue",
    category: "OC",
    successReason: "Emma's success came from shifting her mindset from 'getting it right' to 'understanding the logic,' combined with targeted stress-management drills."
  },
  {
    id: "oc-2",
    reviewerName: "Lisa Thompson",
    reviewerType: "Parent",
    studentGrade: "Year 5",
    achievement: "258/300 Score",
    message: "Just a quick note to say Ethan got into Beecroft with 258! He used to struggle with the wordier questions, but the structured approach Michael used really made things click for him. Seeing his confidence grow every week was the best part.",
    accent: "blue",
    category: "OC",
    successReason: "Ethan thrived by breaking down multi-step problems into smaller, manageable 'micro-tasks,' a strategy we practiced until it became second nature."
  },
  {
    id: "oc-3",
    reviewerName: "Patricia L.",
    reviewerType: "Parent",
    studentGrade: "Year 5",
    achievement: "Offer",
    message: "I can't thank the team enough. She actually came out of the exam room smiling because she'd seen similar problems in her sessions here. It made such a huge difference and I'm just so relieved we were able to secure her spot at Atarmon. Once again, huge thanks to the team for supporting us!",
    accent: "blue",
    category: "OC",
    successReason: "Grace benefitted from our 'pattern recognition' curriculum, which exposes students to variations of elite-level questions before they ever see them in an exam."
  },
  {
    id: "oc-4",
    reviewerName: "Karen Wu",
    reviewerType: "Parent",
    studentGrade: "Year 5",
    achievement: "Offer",
    message: "Thank you Michael for being so patient. She used to run out of time on the practice tests, but the time-management strategies she learned here were a game changer. She's so happy she got an offer from Ermington!",
    accent: "blue",
    category: "OC",
    successReason: "By identifying her 'time-sink' topics early, we taught Emma when to move on and when to dig in, maximising her score efficiency."
  },
  {
    id: "oc-5",
    reviewerName: "Hanson L.",
    reviewerType: "Parent",
    studentGrade: "Year 5",
    achievement: "Offer",
    message: "Leo got into Beecroft. Honestly, he was really finding the thinking skills section tough at the start. Michael's logic puzzles turned it into a game for him, and suddenly he just 'got' it. We're very proud.",
    accent: "blue",
    category: "OC",
    successReason: "Leo's breakthrough happened when we switched from rote learning to abstract logic games, helping him enjoy the 'puzzle' of mathematics."
  },

  // --- SELECTIVE ENTRY (Min 5) ---
  {
    id: "selective-1",
    reviewerName: "Jennifer Park",
    reviewerType: "Parent",
    studentGrade: "Year 6",
    achievement: "Sydney Girls HS",
    message: "She's really pleased with herself and mentioned how grateful she is to Ryze. The way Michael breaks down the harder concepts just made sense to her. She felt like she actually had a proper strategy going in.",
    accent: "green",
    category: "Selective",
    successReason: "Sophie prioritised high-yield question types and developed a 'decision-tree' approach to the most complex selective math problems."
  },
  {
    id: "selective-2",
    reviewerName: "Amanda L.",
    reviewerType: "Parent",
    studentGrade: "Year 6",
    achievement: "James Ruse HS",
    message: "Michael really helped him polish his skills and stay focused. The extra support in those final few weeks was exactly what he needed.",
    accent: "green",
    category: "Selective",
    successReason: "Daniel's success was built on rigorous error-analysis; he didn't just find the right answer, he dissected why the wrong answers were tempting."
  },
  {
    id: "selective-3",
    reviewerName: "Mark Stevens",
    reviewerType: "Parent",
    studentGrade: "Year 6",
    achievement: "Baulkham Hills HS",
    message: "She got 265 and she's so excited. The practice exams here were actually harder than the real thing, so she felt completely relaxed on the big day. Best investment we've made.",
    accent: "green",
    category: "Selective",
    successReason: "Olivia used our 'over-preparation' method, training on questions slightly above exam-level so that the actual test felt manageable and low-stress."
  },
  {
    id: "selective-4",
    reviewerName: "Helen Nguyen",
    reviewerType: "Parent",
    studentGrade: "Year 6",
    achievement: "Sydney Boys HS",
    message: "Thank you for pushing him just the right amount. He was very lazy and it was very hard to get him to sit down and focus, but he really looks up to you as a role model and your words really seem to reach him.",
    accent: "green",
    category: "Selective",
    successReason: "William's improvement was from adjusting the delivery in a way that resonated with him so that he would not only listen but understand."
  },
  {
    id: "selective-5",
    reviewerName: "Thomas Reid",
    reviewerType: "Parent",
    studentGrade: "Year 6",
    achievement: "Hurlstone AG HS",
    message: "Joshua got his place at Hurlstone! He's very proud of himself. We really appreciated the regular feedback — we always knew exactly where he stood and what he needed to work on.",
    accent: "green",
    category: "Selective",
    successReason: "Joshua's progress was tracked via granular data, allowing us to pivot his focus to his specific 'low-growth' areas every single week."
  },

  // --- NAPLAN (Min 5) ---
  {
    id: "naplan-1",
    reviewerName: "David Wong",
    reviewerType: "Parent",
    studentGrade: "Year 4",
    achievement: "Band 10 Numeracy",
    message: "Lucas just got his Year 3 results—Band 10! He's started thinking about math in a totally different way since he joined Ryze. He's even explaining things to me now!",
    accent: "purple",
    category: "NAPLAN",
    successReason: "Lucas moved beyond rote memorization into 'first principles' thinking, allowing him to derive solutions he hadn't explicitly been taught."
  },
  {
    id: "naplan-2",
    reviewerName: "Jenny Marshall",
    reviewerType: "Parent",
    studentGrade: "Year 3",
    achievement: "Exceeding Standards",
    message: "So proud of Maya! She's in the 'Exceeding' category for everything. She used to say she 'wasn't a math person,' but now she's the one asking for more homework. That shift in attitude is everything.",
    accent: "purple",
    category: "NAPLAN",
    successReason: "Maya's success was psychological; once we broke the 'not a math person' barrier with small wins, her academic performance naturally followed."
  },
  {
    id: "naplan-3",
    reviewerName: "Victor Zheng",
    reviewerType: "Parent",
    studentGrade: "Year 5",
    achievement: "Perfect Score (Numeracy)",
    message: "Arvin got every single question right in his NAPLAN numeracy. His teacher at school was shocked! Ryze's advanced classes really give the kids a huge head start over the standard curriculum.",
    accent: "purple",
    category: "NAPLAN",
    successReason: "Arvin mastered our 'Double-Check Framework,' a systematic way of verifying answers that eliminates the careless errors that usually plague top students."
  },
  {
    id: "naplan-4",
    reviewerName: "Sarah Phillips",
    reviewerType: "Parent",
    studentGrade: "Year 7",
    achievement: "Two Bands Progress",
    message: "Chloe moved up two full bands in her Year 7 NAPLAN. She'd really fallen behind during the lockdowns, but the targeted help here filled those gaps so quickly. She feels like she's finally caught up.",
    accent: "purple",
    category: "NAPLAN",
    successReason: "Chloe's 'gap analysis' identified specific Year 5 concepts that were missing; once those were reinforced, the Year 7 curriculum became easy."
  },
  {
    id: "naplan-5",
    reviewerName: "Benson Ng",
    reviewerType: "Parent",
    studentGrade: "Year 9",
    achievement: "Band 10 Result",
    message: "Jason hit Band 10 in Year 9. He was really worried about high school math getting too hard, but now he feels like he's actually ahead of his class. It's such a relief for us as parents.",
    accent: "purple",
    category: "NAPLAN",
    successReason: "Jason thrived in our 'Bridge Program,' which connects NAPLAN requirements with early senior high school algebra and geometry."
  },

  // --- HSC (Year 12 Only, Min 5) ---
  {
    id: "hsc-1",
    reviewerName: "Sophie W.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "97 in Advanced",
    message: "I was so stressed about my Trials, but getting 97 in Advanced Maths has given me such a boost. Mike's focus on exam technique — especially how to get those final 'hard' marks—was exactly what I needed.",
    accent: "orange",
    category: "HSC",
    successReason: "Sophie focused on the 'Mark-Per-Minute' rule, ensuring she never sacrificed easy marks for high-risk questions, stabilizing her overall average."
  },
  {
    id: "hsc-2",
    reviewerName: "Jameson K.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "99.85 ATAR & 98 in 4U",
    message: "I honestly couldn't have done it without the sessions at Ryze. Mike has a way of explaining the most abstract 4U concepts so they actually feel simple. Highly recommend Ryze to anyone looking for not just tutoring but also a mentor to guide them.",
    accent: "orange",
    category: "HSC",
    successReason: "Jameson's success was rooted in his mastery of 4U mechanics and complex numbers, where we spent months building deep intuition before doing papers."
  },
  {
    id: "hsc-3",
    reviewerName: "Claire M.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "98 in 2U HSC",
    message: "So happy with my 98! It was actually my best subject in the end. The weekly practice papers at Ryze were much harder than the actual HSC, so when I sat down for the exam, I didn't feel intimidated at all.",
    accent: "orange",
    category: "HSC",
    successReason: "Claire's 'Exam Stamina' training meant she was as fresh in the third hour of the paper as she was in the first ten minutes."
  },
  {
    id: "hsc-4",
    reviewerName: "Benjamin S.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "95 in 4U HSC",
    message: "4U math is a beast, but getting a 95 made all the late nights worth it. Gordon's deep knowledge of the syllabus is crazy — he knows exactly what the markers are looking for. It gave me a real edge.",
    accent: "orange",
    category: "HSC",
    successReason: "Benjamin learned to write 'marker-friendly' solutions—neat, logical, and clearly labeled—which secured him full marks on partial solutions."
  },
  {
    id: "hsc-5",
    reviewerName: "Zara P.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "93% after failing",
    message: "Just found out I'm ranked 3rd in my grade for Advanced Maths. After failing my first few assessments in Year 11, Mike helped me turn everything around. I actually understand the 'why' behind the formulas now.",
    accent: "orange",
    category: "HSC",
    successReason: "Zara's success was a lesson in resilience; we stripped back her knowledge to Year 10 foundations and rebuilt her understanding from the ground up."
  },
  {
    id: "hsc-6",
    reviewerName: "Jason Y.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "Rank 1 - 99 Internal",
    message: "Being ranked first at my tutoring school has been an incredible experience. The guidance and support I received from my tutors helped me build confidence and master challenging concepts. Their personalised approach made learning enjoyable and effective. I’m proud of my achievement and grateful for the quality education that made it possible!",
    accent: "orange",
    category: "HSC",
    successReason: "Jason is an extremely sharp thinker, so it was just a matter of paving the path for him down the right direction."
  },

  {
    id: "hsc-7",
    reviewerName: "Amelia R.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "From mid-80s to 96 2U HSC",
    message: "I went from mid-80s to a Band 6. Honestly didn’t think that was possible.",
    accent: "orange",
    category: "HSC",
    successReason: "Focused on exam patterns and timing."
  },
  {
    id: "hsc-8",
    reviewerName: "Liam T.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "1st in School | 97 4U HSC",
    message: "Pretty stoked with this result. The exam was tough, but the prep made it feel easy.",
    accent: "orange",
    category: "HSC",
    successReason: "Lots of practice and clear explanations."
  },
  {
    id: "hsc-9",
    reviewerName: "Olivia H.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "92 in Prelim",
    message: "My confidence went way up after prelims. Ready for Year 12 now.",
    accent: "orange",
    category: "HSC",
    successReason: "Built solid foundations early."
  },
  {
    id: "hsc-10",
    reviewerName: "Ethan V.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "98 in 4U HSC",
    message: "4U was brutal, but Ryze helped me stay calm and focused. That made all the difference.",
    accent: "orange",
    category: "HSC",
    successReason: "Weekly mocks and stress management tips."
  },
  {
    id: "hsc-11",
    reviewerName: "Charlotte B.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "95 in 3U HSC",
    message: "I kept losing marks on silly mistakes. Mike drilled me on accuracy and neat working. It paid off.",
    accent: "orange",
    category: "HSC",
    successReason: "Focused on structure and double-checking steps."
  },
  {
    id: "hsc-12",
    reviewerName: "Ryan C.",
    reviewerType: "Student",
    studentGrade: "Year 12",
    achievement: "99.40 ATAR",
    message: "It wasn’t just tutoring—it was strategy. I knew exactly how to play the exam game.",
    accent: "orange",
    category: "HSC",
    successReason: "Prioritized high-yield questions and avoided time traps."
  },


  // --- COMPETITIONS (Min 5) ---
  {
    id: "competitions-1",
    reviewerName: "Michelle Zhang",
    reviewerType: "Parent",
    studentGrade: "Year 4",
    achievement: "High Distinction",
    message: "He's always loved numbers, but the guidance here has really taught him how to think outside the box.",
    accent: "yellow",
    category: "Competitions",
    successReason: "Nathan thrived in our 'lateral thinking' workshops, which focus on solving problems with missing information — a key skill for success."
  },
  {
    id: "competitions-2",
    reviewerName: "Ryan G.",
    reviewerType: "Student",
    studentGrade: "Year 7",
    achievement: "Top 0.1% Result",
    message: "I actually won a medal for ICAS math this year! I've been coming to Ryze for two years now and their help and services have just been phenomenal.",
    accent: "yellow",
    category: "Competitions",
    successReason: "Ryan’s success is the result of long-term consistency; his intuition for complex number theory has been developed over hundreds of sessions."
  },
  {
    id: "competitions-3",
    reviewerName: "Chloe S.",
    reviewerType: "Student",
    studentGrade: "Year 6",
    achievement: "Distinction Award",
    message: "So happy with my Distinction! I love coming to classes because we get to solve problems that are actually challenging. It's way more interesting than what we do at school.",
    accent: "yellow",
    category: "Competitions",
    successReason: "Chloe's competitive edge comes from her genuine curiosity; she often explores three or four different ways to solve the same problem."
  },

  // --- PRIMARY (K-6 General) (Min 5) ---
  {
    id: "primary-1",
    reviewerName: "Robert Kumar",
    reviewerType: "Parent",
    studentGrade: "Year 3",
    achievement: "Top of Class",
    message: "Priya was really struggling with her confidence in Year 2. After six months here, her teacher says she's now leading her math group! The focus on number sense really made everything click for her.",
    accent: "pink",
    category: "Primary (K-6)",
    successReason: "By solidifying Priya's 'number bonds' and place-value intuition, we gave her the mental tools to tackle Year 3 work with zero hesitation."
  },
  {
    id: "primary-2",
    reviewerName: "Rebecca Foster",
    reviewerType: "Parent",
    studentGrade: "Year 3",
    achievement: "Accelerated Learning",
    message: "Math has gone from boring to exciting for Tyler. Being selected for the extension group has boosted his confidence, and now he can’t wait to show us his homework.",
    accent: "pink",
    category: "Primary (K-6)",
    successReason: "Tyler's engagement skyrocketed when we introduced 'gamified' challenges that rewarded his speed and creative thinking."
  },
  {
    id: "primary-3",
    reviewerName: "Sam L.",
    reviewerType: "Parent",
    studentGrade: "Year 4",
    achievement: "Improved 100%",
    message: "He used to get so frustrated with long division and times tables. We've seen such a change in Sam. Now he's doing it all in his head! His speed and accuracy have just increased immensely.",
    accent: "pink",
    category: "Primary (K-6)",
    successReason: "Sam mastered our 'Mental Visualization' technique, where he learns to manipulate numbers in a 3D mental space rather than on paper."
  },
  {
    id: "primary-4",
    reviewerName: "Angela Wu",
    reviewerType: "Parent",
    studentGrade: "Year 5",
    achievement: "A-Range Performance",
    message: "I think the best part is that he's stopped saying 'I can't do this.' He has a completely different mindset now. Leo went from a C to an A in just two terms.",
    accent: "pink",
    category: "Primary (K-6)",
    successReason: "Leo's transformation was driven by 'incremental mastery'—we proved to him he could solve small problems, which built the courage for big ones."
  },
  {
    id: "primary-5",
    reviewerName: "Marcus J.",
    reviewerType: "Parent",
    studentGrade: "Year 6",
    achievement: "Top Quartile",
    message: "We used to have tears over homework every night, but that's all gone. He's much more confident and his school marks show it.",
    accent: "pink",
    category: "Primary (K-6)",
    successReason: "Marcus's breakthrough came from our 'safe-fail' environment, where he learned that making mistakes is a critical part of solving hard problems."
  },

  // --- HIGH SCHOOL (7-12 General) (Min 5) ---
  {
    id: "high-school-1",
    reviewerName: "Ryan M.",
    reviewerType: "Student",
    studentGrade: "Year 9",
    achievement: "94% and Rank 2",
    message: "Got 94% on my yearly and came 2nd in the year.",
    accent: "indigo",
    category: "High School (7-12)",
    successReason: "Ryan excelled once he understood the 'grammar' of algebra—the rules that never change—rather than trying to memorize every possible question."
  },
  {
    id: "high-school-2",
    reviewerName: "Chloe A.",
    reviewerType: "Student",
    studentGrade: "Year 11",
    achievement: "97/100 Assessment",
    message: "Just got my first 3U assessment back — 97%! I was really worried about the jump from Year 10, but the prep sessions over the holidays really put me ahead of the rest of the class.",
    accent: "indigo",
    category: "High School (7-12)",
    successReason: "Chloe's success was due to her holiday 'pre-loading'—she had already mastered the first term's content before school even started."
  },
  {
    id: "high-school-3",
    reviewerName: "James C.",
    reviewerType: "Student",
    studentGrade: "Year 10",
    achievement: "97% and Rank 3rd",
    message: "I've moved up to 3rd overall. Really happy with my 97% as my end of year result",
    accent: "indigo",
    category: "High School (7-12)",
    successReason: "James focused on 'visual trigonometry,' learning to sketch every problem before calculating, which prevented simple orientation errors."
  },
  {
    id: "high-school-4",
    reviewerName: "Alex M.",
    reviewerType: "Student",
    studentGrade: "Year 8",
    achievement: "99% - Ranked 1st",
    message: "I came first in my grade with 99%! The algebra and geometry we did in a tutoring were exactly what came up in the exam. It felt so good knowing I was prepared.",
    accent: "indigo",
    category: "High School (7-12)",
    successReason: "Alex mastered our 'Predictive Practice' method, where he learned to anticipate how examiners would word questions based on the syllabus."
  },
  {
    id: "high-school-5",
    reviewerName: "Daniel K.",
    reviewerType: "Student",
    studentGrade: "Year 7",
    achievement: "94% Mathematics",
    message: "Year 7 math is a lot harder than primary school, but getting 94% on my first big exam was awesome.",
    accent: "indigo",
    category: "High School (7-12)",
    successReason: "Daniel's success came from early mastery of negative numbers and order of operations, the two biggest stumbling blocks in Year 7."
  }
];
