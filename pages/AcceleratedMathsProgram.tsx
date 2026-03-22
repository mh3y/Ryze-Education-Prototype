import React from 'react';
import ProgramLandingPage, { programLandingIcons } from '../components/programs/ProgramLandingPage';
import { ROUTES } from '../src/constants/routes';

const heroBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_100,dpr_2.0,c_fill,g_auto';
const heroId = 'ryze/images/class4';
const heroSrc = `${heroBase},w_2560/${heroId}`;
const heroSrcSet = [
  `${heroBase},w_360/${heroId} 360w`,
  `${heroBase},w_480/${heroId} 480w`,
  `${heroBase},w_640/${heroId} 640w`,
  `${heroBase},w_768/${heroId} 768w`,
  `${heroBase},w_960/${heroId} 960w`,
  `${heroBase},w_1200/${heroId} 1200w`,
  `${heroBase},w_1440/${heroId} 1440w`,
  `${heroBase},w_1600/${heroId} 1600w`,
  `${heroBase},w_1920/${heroId} 1920w`,
  `${heroBase},w_2240/${heroId} 2240w`,
  `${heroBase},w_2560/${heroId} 2560w`,
  `${heroBase},w_2880/${heroId} 2880w`,
  `${heroBase},w_3200/${heroId} 3200w`,
].join(', ');

const AcceleratedMathsProgram: React.FC = () => (
  <ProgramLandingPage
    config={{
      pageId: 'accelerated_maths_program',
      path: ROUTES.ACCELERATED_MATHS_PROGRAM,
      title: 'Accelerated Pathways Sydney | Advanced Maths Program | Ryze Education',
      description: 'An accelerated maths program for ambitious students ready for deeper reasoning, faster progression, and a more demanding mathematical pathway.',
      ogTitle: 'Accelerated Pathways Sydney | Ryze Education',
      ogDescription: 'For highly capable students ready to move ahead with stronger fluency, sharper reasoning, and disciplined weekly progression.',
      heroBadge: 'Accelerated Pathways | Advanced Pathway',
      heroTitle: 'For students ready to work ahead of school, not just keep up.',
      heroSubheading: 'This program is built for ambitious, highly capable students who need stronger pace, deeper mathematical fluency, and a pathway that stretches them well beyond the standard school rhythm.',
      heroImageSrc: heroSrc,
      heroImageSrcSet: heroSrcSet,
      heroImageAlt: 'Accelerated secondary maths program at Ryze Education',
      heroImageClassName: 'object-[48%_center] sm:object-[54%_center] lg:object-[60%_center]',
      heroSignals: [
        { label: 'Best for', value: 'Ambitious, highly capable students' },
        { label: 'Approach', value: 'Ahead-of-school progression' },
        { label: 'Focus', value: 'Depth, pace, mathematical maturity' },
        { label: 'Format', value: 'Private and small-group' },
      ],
      proofEyebrow: 'Acceleration done properly',
      proofTitle: 'Getting ahead only works when the understanding is real.',
      proofBody: 'We do not rush students through harder content just to say they are advanced. The aim is durable fluency, stronger mathematical judgement, and an easier transition into senior work later.',
      metrics: [
        { value: 'Advanced', label: 'Designed for students who need more challenge, stronger pace, and more serious mathematical extension.' },
        { value: 'Ahead', label: 'Students work into upcoming topics with structure, not random extension sheets.' },
        { value: 'Stable', label: 'Understanding is kept secure so acceleration does not create future gaps.' },
      ],
      proofPillars: [
        { title: 'Future topics introduced cleanly', description: 'Students work ahead of school in a sequence that still protects understanding.', icon: programLandingIcons.BookOpenCheck },
        { title: 'Weekly structure prevents drift', description: 'Acceleration only compounds when the work is reviewed, corrected, and revisited consistently.', icon: programLandingIcons.CalendarCheck2 },
        { title: 'Confidence grows with fluency', description: 'Students feel stronger because they actually understand the harder work, not because they memorised steps.', icon: programLandingIcons.Star },
      ],
      tracksEyebrow: 'Program pillar',
      programTracks: [
        { title: 'Ahead-of-school syllabus work', summary: 'Students move into upcoming algebra, geometry, and problem-solving content before it appears in class.', focus: ['Pre-teaching of higher-difficulty topics', 'Smoother classroom confidence and participation', 'Less stress when school pace increases'] },
        { title: 'Depth and abstraction', summary: 'Capable students learn to reason more flexibly, not just finish easier exercises faster.', focus: ['Multi-step reasoning', 'Cleaner mathematical communication', 'More mature problem interpretation'] },
        { title: 'Senior preparation early', summary: 'The long-term goal is to make Advanced and Extension pathways feel more realistic later.', focus: ['Stronger algebra foundations', 'Earlier exposure to rigorous thinking', 'Confidence heading into Years 10-11'] },
      ],
      weeklyEyebrow: 'Weekly structure',
      weeklyTitle: 'How the accelerated pathway moves forward.',
      weeklyIntro: 'Students are moved ahead deliberately, with review built in, so speed never outruns understanding.',
      weeklySystem: [
        { title: 'Placement and pacing check', description: 'We identify whether the student should accelerate by topic, by year level, or by extension depth within current work.' },
        { title: 'Forward teaching each week', description: 'Lessons introduce upcoming concepts while connecting them carefully to what the student already knows.' },
        { title: 'Correction and consolidation', description: 'Mistakes are revisited so accelerated work becomes stable fluency, not a fragile first pass.' },
        { title: 'Longer-term direction', description: 'Families understand what the student is moving toward and why the pacing makes sense.' },
      ],
      resultEyebrow: 'Academic movement',
      resultTitle: 'The best acceleration feels calm, not theatrical.',
      resultPoints: [
        { title: 'Stronger class confidence', description: 'Students arrive at school already familiar with ideas that once felt intimidating.', icon: programLandingIcons.Users },
        { title: 'Better long-term readiness', description: 'Later years feel less compressed because foundational fluency was built earlier.', icon: programLandingIcons.BookOpenCheck },
        { title: 'Clear academic direction', description: 'Families can see whether the student is building toward senior advanced pathways.', icon: programLandingIcons.MessageCircle },
      ],
      testimonialBadge: 'Accelerated pathway',
      testimonialSummary: 'Highly capable students building stronger fluency, confidence, and a more ambitious mathematical pace.',
      testimonialFilter: (item) =>
        (item.category === 'NAPLAN' && (item.studentGrade === 'Year 7' || item.studentGrade === 'Year 9')) ||
        item.category === 'HSC',
      testimonialFallbackFilter: (item) =>
        (item.category === 'NAPLAN' && (item.studentGrade === 'Year 7' || item.studentGrade === 'Year 9')) ||
        item.category === 'HSC',
      contactEyebrow: 'Book a consultation',
      contactTitle: 'Find out whether acceleration is the right move now.',
      contactBody: 'Tell us about the student’s current level, pace, and appetite for harder work. We will recommend whether this accelerated pathway is the right fit.',
      contactHighlights: ['Free consultation with honest placement advice', 'Pacing matched to school readiness, not ego', 'Private and small-group options available'],
      studentSegments: ['Working ahead of school', 'Needs deeper challenge', 'Advanced problem solving', 'Accelerated pathway'],
      studentLevelOptions: ['Working ahead of school', 'Needs deeper challenge', 'Advanced problem solving', 'Not sure yet'],
      subjectPrefix: 'Accelerated Pathways Program Enquiry',
    }}
  />
);

export default AcceleratedMathsProgram;
