import React from 'react';
import ProgramLandingPage, { programLandingIcons } from '../components/programs/ProgramLandingPage';
import { ROUTES } from '../src/constants/routes';

const heroBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto';
const heroId = 'ryze/images/onlinev4';
const heroSrc = `${heroBase},w_768/${heroId}`;
const heroSrcSet = [
  `${heroBase},w_360/${heroId} 360w`,
  `${heroBase},w_480/${heroId} 480w`,
  `${heroBase},w_640/${heroId} 640w`,
  `${heroBase},w_768/${heroId} 768w`,
  `${heroBase},w_960/${heroId} 960w`,
  `${heroBase},w_1200/${heroId} 1200w`,
].join(', ');

const PrimaryMathsProgram: React.FC = () => (
  <ProgramLandingPage
    config={{
      pageId: 'primary_maths_program',
      path: ROUTES.PRIMARY_MATHS_PROGRAM,
      title: 'Primary | Year 3 - 6 Sydney | Ryze Education',
      description: 'A Years 3-6 primary maths program focused on fluency, confidence, and strong early mathematical habits.',
      ogTitle: 'Primary | Year 3 - 6 Sydney | Ryze Education',
      ogDescription: 'A structured Years 3-6 maths program building confidence, fluency, and stronger habits before secondary years begin.',
      heroBadge: 'Primary | Year 3 - 6',
      heroTitle: 'Early confidence matters more than early pressure.',
      heroSubheading: 'Our primary maths program helps students in Years 3-6 build fluency, clearer reasoning, and better habits before gaps become identity-level problems later.',
      heroImageSrc: heroSrc,
      heroImageSrcSet: heroSrcSet,
      heroImageAlt: 'Primary maths learning program at Ryze Education',
      heroImageClassName: 'object-[68%_center] sm:object-[60%_center] lg:object-[62%_center]',
      heroSignals: [
        { label: 'Best for', value: 'Years 3-6' },
        { label: 'Focus', value: 'Fluency, confidence, habits' },
        { label: 'Format', value: 'Private and small-group' },
        { label: 'Parents', value: 'Clear communication' },
      ],
      proofEyebrow: 'Foundations first',
      proofTitle: 'The earlier maths feels clear, the stronger later years become.',
      proofBody: 'At this stage, the goal is not to overload students. It is to make number sense, written method, and reasoning feel stable enough that later topics do not pile pressure onto shaky ground.',
      metrics: [
        { value: 'Years 3-6', label: 'The period where confidence and mathematical identity are often formed.' },
        { value: 'Weekly', label: 'Students revisit core ideas until they feel easier, cleaner, and more familiar.' },
        { value: 'Steady', label: 'Progress comes from habit and consistency rather than short bursts of panic.' },
      ],
      proofPillars: [
        { title: 'Fluency built carefully', description: 'We strengthen number sense, working, and interpretation so school tasks feel less heavy.', icon: programLandingIcons.BookOpenCheck },
        { title: 'Correction without overwhelm', description: 'Students learn from mistakes in a calm way that improves confidence rather than damaging it.', icon: programLandingIcons.MessageCircle },
        { title: 'Parent visibility', description: 'Families understand what is improving and where more repetition is still needed.', icon: programLandingIcons.Users },
      ],
      tracksEyebrow: 'Program pillar',
      programTracks: [
        { title: 'Core number fluency', summary: 'Students strengthen arithmetic, fractions, place value, and written method so classroom work becomes more manageable.', focus: ['Reliable working habits', 'Cleaner written method', 'Fewer repeated foundational mistakes'] },
        { title: 'Reasoning and communication', summary: 'Students learn how to explain what they are doing instead of guessing their way through unfamiliar problems.', focus: ['Reading questions properly', 'Organising steps clearly', 'Speaking and writing mathematical thinking'] },
        { title: 'Confidence before pressure', summary: 'A calmer early relationship with maths changes how students approach the rest of school.', focus: ['Less avoidance and panic', 'Stronger lesson engagement', 'Better readiness for upper primary and early secondary maths'] },
      ],
      weeklyEyebrow: 'Weekly structure',
      weeklyTitle: 'How the primary program supports growth.',
      weeklyIntro: 'The work is designed to feel structured, encouraging, and repetitive in the right way so understanding becomes more secure over time.',
      weeklySystem: [
        { title: 'Starting point and gap check', description: 'We identify where confidence drops and which concepts need to become easier first.' },
        { title: 'Explicit weekly teaching', description: 'Students are taught through explanation, guided examples, and active practice rather than passive worksheet supervision.' },
        { title: 'Review until stable', description: 'Important skills are revisited so progress is retained, not forgotten by the following week.' },
        { title: 'Parent updates', description: 'Families know what is improving and which habits are worth reinforcing at home.' },
      ],
      resultEyebrow: 'Parent trust',
      resultTitle: 'Families usually notice the change before marks catch up fully.',
      resultPoints: [
        { title: 'Less resistance', description: 'Students approach maths with less dread and more willingness to try.', icon: programLandingIcons.Star },
        { title: 'Stronger habits', description: 'Written method, checking, and question reading improve together.', icon: programLandingIcons.BookOpenCheck },
        { title: 'Calmer family experience', description: 'Parents get clearer visibility into what is actually happening.', icon: programLandingIcons.MessageCircle },
      ],
      testimonialBadge: 'Primary pathway',
      testimonialSummary: 'Primary students building earlier fluency, stronger confidence, and better long-term mathematical habits.',
      testimonialFilter: (item) =>
        (item.category === 'NAPLAN' && (item.studentGrade === 'Year 3' || item.studentGrade === 'Year 4' || item.studentGrade === 'Year 5')) ||
        item.category === 'OC' ||
        item.category === 'Selective',
      testimonialFallbackFilter: (item) =>
        (item.category === 'NAPLAN' && (item.studentGrade === 'Year 3' || item.studentGrade === 'Year 4' || item.studentGrade === 'Year 5')) ||
        item.category === 'OC' ||
        item.category === 'Selective',
      contactEyebrow: 'Book a consultation',
      contactTitle: 'Find the right starting point before small issues become larger ones.',
      contactBody: 'Tell us the current year level, confidence, and where maths feels difficult. We will recommend the right entry point for the student.',
      contactHighlights: ['Free consultation with a clear recommendation', 'Placement across Years 3-6', 'Private and small-group options available'],
      studentSegments: ['Year 3', 'Year 4', 'Year 5', 'Year 6', 'Primary pathway'],
      studentLevelOptions: ['Year 3', 'Year 4', 'Year 5', 'Year 6'],
      subjectPrefix: 'Primary | Year 3 - 6 Program Enquiry',
    }}
  />
);

export default PrimaryMathsProgram;
