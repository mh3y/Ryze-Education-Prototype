import React from 'react';
import ProgramLandingPage, { programLandingIcons } from '../components/programs/ProgramLandingPage';
import { ROUTES } from '../src/constants/routes';

const heroBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto';
const heroId = 'ryze/images/personalised';
const heroSrc = `${heroBase},w_768/${heroId}`;
const heroSrcSet = [
  `${heroBase},w_360/${heroId} 360w`,
  `${heroBase},w_480/${heroId} 480w`,
  `${heroBase},w_640/${heroId} 640w`,
  `${heroBase},w_768/${heroId} 768w`,
  `${heroBase},w_960/${heroId} 960w`,
  `${heroBase},w_1200/${heroId} 1200w`,
].join(', ');

const SelectiveOcProgram: React.FC = () => (
  <ProgramLandingPage
    config={{
      pageId: 'selective_oc_program',
      path: ROUTES.SELECTIVE_OC_PROGRAM,
      title: 'Selective & OC Sydney | Ryze Education',
      description: 'A selective and OC maths program for families who want structured reasoning, cleaner thinking, and stronger exam readiness.',
      ogTitle: 'Selective & OC Sydney | Ryze Education',
      ogDescription: 'Structured OC and selective preparation with explicit mathematical reasoning, weekly correction, and calmer exam execution.',
      heroBadge: 'Selective & OC | Sydney',
      heroTitle: 'Selective and OC preparation built on reasoning, not panic.',
      heroSubheading: 'For families who want sharper thinking, better question judgement, and a preparation program that builds confidence before the test, not just pressure near the end.',
      heroImageSrc: heroSrc,
      heroImageSrcSet: heroSrcSet,
      heroImageAlt: 'Selective and OC maths preparation at Ryze Education',
      heroImageClassName: 'object-[60%_center] sm:object-[58%_center] lg:object-[64%_center]',
      heroSignals: [
        { label: 'Best for', value: 'Years 4-6' },
        { label: 'Focus', value: 'Reasoning, pattern recognition, speed' },
        { label: 'Format', value: 'Private and small-group' },
        { label: 'Families', value: 'Clear weekly visibility' },
      ],
      proofEyebrow: 'Preparation quality',
      proofTitle: 'A calmer path into OC and selective entry.',
      proofBody: 'The strongest students do not just do more questions. They learn how to read patterns faster, organise working more cleanly, and stay composed when the problem looks unfamiliar.',
      metrics: [
        { value: 'Years 4-6', label: 'Built for students preparing early enough to improve properly.' },
        { value: 'Weekly', label: 'Correction, revision, and fresh sets matched to current weak spots.' },
        { value: 'Clear', label: 'Parents know what is improving and what still needs work.' },
      ],
      proofPillars: [
        { title: 'Reasoning taught explicitly', description: 'Students learn how to decode multi-step questions, not just chase the answer.', icon: programLandingIcons.BookOpenCheck },
        { title: 'Timed confidence built gradually', description: 'We increase pace and pressure in a way that sharpens judgement without creating panic.', icon: programLandingIcons.CalendarCheck2 },
        { title: 'Correction that changes habits', description: 'Errors are reviewed for pattern, not just marked wrong and forgotten.', icon: programLandingIcons.MessageCircle },
      ],
      tracksEyebrow: 'Program pillar',
      programTracks: [
        { title: 'Core mathematical reasoning', summary: 'Build number sense, logic, and precision so unfamiliar questions feel solvable instead of intimidating.', focus: ['Pattern recognition and number structure', 'Problem interpretation under time pressure', 'Working that stays organised and checkable'] },
        { title: 'OC exam preparation', summary: 'Prepare younger students for selective-style thinking with pace, confidence, and deliberate question selection.', focus: ['Short-form reasoning drills', 'Mental agility and written accuracy', 'Confidence before formal exam preparation peaks'] },
        { title: 'Selective school preparation', summary: 'For students aiming at stronger exam execution across harder reasoning tasks and denser paper conditions.', focus: ['Harder question sequencing', 'Multi-step problem solving', 'Exam rehearsal with review loops'] },
      ],
      weeklyEyebrow: 'Weekly structure',
      weeklyTitle: 'How the selective program runs each week.',
      weeklyIntro: 'The work is paced to build reasoning first, then speed, then exam confidence. That order matters.',
      weeklySystem: [
        { title: 'Baseline and target setting', description: 'We identify the student’s current reasoning level, likely exam timeline, and the most important pressure points.' },
        { title: 'Explicit weekly teaching', description: 'Lessons focus on how to think through difficult problems, not just what answer to write down.' },
        { title: 'Timed sets and review', description: 'Students practise under structured time pressure, then correct errors while the reasoning is still fresh.' },
        { title: 'Parent clarity', description: 'Families get a realistic view of progress, current bottlenecks, and what the next few weeks should achieve.' },
      ],
      resultEyebrow: 'Results and trust',
      resultTitle: 'Families stay when the preparation feels disciplined.',
      resultPoints: [
        { title: 'Thinking before speed', description: 'We stabilise logic and method before chasing artificial speed too early.', icon: programLandingIcons.BookOpenCheck },
        { title: 'Visible progress', description: 'Students feel clearer about what to do when the paper becomes more demanding.', icon: programLandingIcons.Users },
        { title: 'Parent communication', description: 'The process stays transparent rather than guess-driven.', icon: programLandingIcons.MessageCircle },
      ],
      testimonialBadge: 'Selective & OC',
      testimonialSummary: 'Students preparing for OC and selective entry who need reasoning strength, cleaner execution, and steadier confidence.',
      testimonialFilter: (item) => item.category === 'OC' || item.category === 'Selective',
      testimonialFallbackFilter: (item) =>
        item.category === 'OC' ||
        item.category === 'Selective' ||
        (item.category === 'NAPLAN' && (item.studentGrade === 'Year 7' || item.studentGrade === 'Year 9')) ||
        item.category === 'HSC',
      contactEyebrow: 'Book a consultation',
      contactTitle: 'Start with the right preparation pace for the student.',
      contactBody: 'Tell us the current year level, confidence, and target exam. We will recommend the right starting point and workload.',
      contactHighlights: ['Free consultation with a clear recommendation', 'Placement matched to OC or selective timeline', 'Private and small-group options available'],
      studentSegments: ['Year 4', 'Year 5', 'Year 6', 'OC Preparation', 'Selective Entry'],
      studentLevelOptions: ['Year 4', 'Year 5', 'Year 6', 'OC Preparation', 'Selective Preparation'],
      subjectPrefix: 'Selective and OC Program Enquiry',
    }}
  />
);

export default SelectiveOcProgram;
