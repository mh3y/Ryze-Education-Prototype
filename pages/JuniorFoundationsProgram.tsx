import React from 'react';
import ProgramLandingPage, { programLandingIcons } from '../components/programs/ProgramLandingPage';
import { ROUTES } from '../src/constants/routes';

const heroBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto,ar_5:4';
const heroId = 'ryze/images/tutor2';
const heroSrc = `${heroBase},w_768/${heroId}`;
const heroSrcSet = [
  `${heroBase},w_360/${heroId} 360w`,
  `${heroBase},w_480/${heroId} 480w`,
  `${heroBase},w_640/${heroId} 640w`,
  `${heroBase},w_768/${heroId} 768w`,
  `${heroBase},w_960/${heroId} 960w`,
  `${heroBase},w_1200/${heroId} 1200w`,
].join(', ');

const JuniorFoundationsProgram: React.FC = () => (
  <ProgramLandingPage
    config={{
      pageId: 'junior_foundations_program',
      path: ROUTES.JUNIOR_FOUNDATIONS_PROGRAM,
      title: 'Junior Foundations Sydney | Years 7-10 | Ryze Education',
      description: 'A Years 7-10 maths program aligned with the NSW curriculum and Ryze in-house content to build fluency, confidence, and stronger school performance.',
      ogTitle: 'Junior Foundations Sydney | Ryze Education',
      ogDescription: 'A Years 7-10 maths program aligned with NSW curriculum and Ryze in-house content for stronger fluency, confidence, and academic consistency.',
      heroBadge: 'Junior Foundations | Years 7-10',
      heroTitle: 'A stronger Years 7-10 maths base before senior pressure arrives.',
      heroSubheading: 'This program follows the NSW curriculum while using Ryze’s in-house content structure to keep students in pace with school, close gaps early, and build steadier mathematical confidence.',
      heroImageSrc: heroSrc,
      heroImageSrcSet: heroSrcSet,
      heroImageAlt: 'Junior foundations maths program at Ryze Education',
      heroImageClassName: 'scale-x-[-1] object-[38%_center] sm:object-[42%_center] lg:object-[48%_center]',
      heroSignals: [
        { label: 'Best for', value: 'Years 7-10' },
        { label: 'Curriculum', value: 'NSW aligned' },
        { label: 'Content', value: 'School pace plus Ryze system' },
        { label: 'Format', value: 'Private and small-group' },
      ],
      proofEyebrow: 'Curriculum alignment',
      proofTitle: 'School maths feels different when the foundations are stable.',
      proofBody: 'Junior Foundations is for students who need clearer fluency, better pacing with school, and a structured system that removes the feeling of constantly being behind.',
      metrics: [
        { value: 'Years 7-10', label: 'Designed for junior secondary students who need stronger consistency before senior mathematics.' },
        { value: 'NSW', label: 'Built in line with curriculum expectations and Ryze in-house sequencing.' },
        { value: 'Clear', label: 'Students know what they are learning, what they missed, and what needs to be fixed next.' },
      ],
      proofPillars: [
        { title: 'In pace with school', description: 'Students stay connected to what is happening in class while repairing weaker areas underneath it.', icon: programLandingIcons.CalendarCheck2 },
        { title: 'Ryze in-house sequencing', description: 'Content is structured so ideas arrive in a sensible order, not just the order a worksheet happens to present them.', icon: programLandingIcons.BookOpenCheck },
        { title: 'Habit and confidence repair', description: 'We rebuild accuracy, organisation, and follow-through so students feel less lost week to week.', icon: programLandingIcons.Star },
      ],
      tracksEyebrow: 'Program pillar',
      programTracks: [
        { title: 'Curriculum-linked teaching', summary: 'Students get support that reflects what school is asking while still cleaning up older misunderstandings.', focus: ['NSW syllabus alignment', 'Revision of prerequisite knowledge', 'Smoother classroom performance'] },
        { title: 'In-house Ryze structure', summary: 'We do not rely on school worksheets alone. Students are guided through a clearer internal sequence built for long-term fluency.', focus: ['Reinforced topic sequencing', 'Explicit worked examples', 'Correction-driven revision'] },
        { title: 'Preparation for senior years', summary: 'The point is not just to survive junior maths. It is to make Years 10 and 11 feel far less overwhelming later.', focus: ['Stronger algebra and geometry base', 'Cleaner mathematical communication', 'Reduced senior-year pressure later'] },
      ],
      weeklyEyebrow: 'Weekly structure',
      weeklyTitle: 'How Junior Foundations keeps students in step.',
      weeklyIntro: 'The rhythm is built to stabilise school performance while improving the underlying mathematics that school alone often leaves unresolved.',
      weeklySystem: [
        { title: 'Current school mapping', description: 'We identify what the student is doing at school, where they are slipping, and what still needs repair underneath it.' },
        { title: 'Explicit weekly teaching', description: 'Lessons connect current school content with the prerequisite concepts needed to actually understand it.' },
        { title: 'Correction and reinforcement', description: 'Students revisit weak spots until they become more automatic and less fragile under school pressure.' },
        { title: 'Longer-term progression', description: 'Families can see how junior work is building toward stronger senior readiness over time.' },
      ],
      resultEyebrow: 'Visible change',
      resultTitle: 'The goal is steadier school performance and less weekly confusion.',
      resultPoints: [
        { title: 'Stronger classroom readiness', description: 'Students arrive at school topics with more fluency and less panic.', icon: programLandingIcons.Users },
        { title: 'Fewer repeated errors', description: 'Correction starts to turn into better written habits and more reliable execution.', icon: programLandingIcons.BookOpenCheck },
        { title: 'More confidence over time', description: 'Students feel less behind because the system is finally making sense.', icon: programLandingIcons.MessageCircle },
      ],
      testimonialBadge: 'Junior pathway',
      testimonialSummary: 'Years 7-10 students rebuilding fluency, confidence, and steadier classroom performance.',
      testimonialFilter: (item) =>
        (item.category === 'NAPLAN' && (item.studentGrade === 'Year 7' || item.studentGrade === 'Year 9')) ||
        item.category === 'HSC',
      testimonialFallbackFilter: (item) =>
        (item.category === 'NAPLAN' && (item.studentGrade === 'Year 7' || item.studentGrade === 'Year 9')) ||
        item.category === 'HSC',
      contactEyebrow: 'Book a consultation',
      contactTitle: 'Start with a clearer junior pathway for the years that matter most.',
      contactBody: 'Tell us the student’s year level, school pace, and where maths currently feels unstable. We will recommend the right entry point.',
      contactHighlights: ['Free consultation with a clear recommendation', 'Aligned to NSW curriculum and Ryze in-house structure', 'Private and small-group options available'],
      studentSegments: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Junior Foundations'],
      studentLevelOptions: ['Year 7', 'Year 8', 'Year 9', 'Year 10'],
      subjectPrefix: 'Junior Foundations Program Enquiry',
    }}
  />
);

export default JuniorFoundationsProgram;
