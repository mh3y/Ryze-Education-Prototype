
import { CourseData } from '../types';
import { Target, Users, TrendingUp, Brain, Award, BarChart3, GraduationCap, Layers, Check, PenTool, Timer, Lightbulb, MessageSquare, Calculator, Smile, FileText, Zap, Compass, GitBranch, Puzzle, Sparkles, BookOpen } from 'lucide-react';

export const courses: Record<string, CourseData> = {
  // --- PRIMARY: YEAR 3 ---
  'year-3-maths': {
    id: 'year-3-maths',
    title: 'Year 3 Mathematics',
    gradeLevel: 'Year 3',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Building deep number sense and problem-solving resilience. We move beyond rote counting to understanding the patterns that underpin all mathematics.',
    whyChoose: [
       { title: "Age-Appropriate Rigour", description: "Our materials are designed specifically for Stage 2 cognitive development.", icon: Layers },
       { title: "Small Group Immersion", description: "Maximum of 6 students ensures no student hides in the back.", icon: Users },
       { title: "Spiral Learning Model", description: "Key concepts are revisited with increasing complexity to reinforce neural pathways.", icon: Target }
    ],
    subjects: [
      {
        name: 'Mathematics',
        description: 'Building deep number sense and problem-solving resilience.',
        keyOutcomes: [
          // Term 1
          'Master place value to 10,000', 'Fluency in addition & subtraction', 'Identify number patterns', 'Measure length accurately',
          // Term 2
          'Recall multiplication facts (2, 3, 5, 10)', 'Understand division as sharing', 'Calculate area using grids', 'Identify 3D object properties',
          // Term 3
          'Model and compare fractions', 'Read analog and digital time', 'Measure mass and capacity', 'Identify angles as measures of turn',
          // Term 4
          'Conduct chance experiments', 'Create and interpret graphs', 'Solve multi-step word problems', 'Financial maths basics'
        ],
        topics: [
          // Term 1
          { title: 'Number & Place Value I', description: 'Reading, writing and ordering numbers to 10,000. Expanded notation.' },
          { title: 'Addition Strategies', description: 'Jump strategy, split strategy, and compensation for mental addition.' },
          { title: 'Subtraction Strategies', description: 'Mental subtraction techniques and relating subtraction to addition.' },
          { title: 'Written Addition', description: 'Column addition with trading (regrouping) for 3-digit numbers.' },
          { title: 'Written Subtraction', description: 'Column subtraction with trading (decomposition).' },
          { title: 'Patterns & Algebra', description: 'Identifying and continuing number patterns. Odd and even number properties.' },
          { title: 'Length & Distance', description: 'Measuring with metres, centimetres and millimetres. Estimating length.' },
          { title: 'Perimeter Intro', description: 'Calculating the perimeter of simple polygons.' },
          { title: 'Logic & Reasoning', description: 'Solving word problems involving addition and subtraction.' },
          { title: 'Term 1 Assessment', description: 'Comprehensive review of Number and Measurement concepts.' },
          
          // Term 2
          { title: 'Multiplication Concept', description: 'Groups of, arrays, and repeated addition.' },
          { title: 'Multiplication Facts', description: 'Fluency with 2x, 5x, and 10x tables. Commutative property.' },
          { title: 'Division Concept', description: 'Division as sharing and grouping. Inverse relationship with multiplication.' },
          { title: 'Division Facts', description: 'Fact families and dividing by 2, 5, and 10.' },
          { title: 'Area Fundamentals', description: 'Comparing area using uniform informal units. Introduction to square cm.' },
          { title: '2D Shapes', description: 'Properties of quadrilaterals, triangles, and regular polygons.' },
          { title: '3D Objects', description: 'Faces, edges, and vertices of prisms, pyramids, cones, and cylinders.' },
          { title: 'Volume & Capacity', description: 'Comparing volume using blocks. Measuring capacity in Litres.' },
          { title: 'Position', description: 'Grid references and interpreting simple maps.' },
          { title: 'Term 2 Assessment', description: 'Review of Multiplication, Division, and Space.' },

          // Term 3
          { title: 'Fractions Introduction', description: 'Halves, quarters, and eighths. Fractions as equal parts of a whole.' },
          { title: 'Comparing Fractions', description: 'Using diagrams and number lines to compare unit fractions.' },
          { title: 'Fractions of Collections', description: 'Finding a fraction of a group of objects.' },
          { title: 'Time: Analog', description: 'Reading time to the minute. Past and To the hour.' },
          { title: 'Time: Digital & Duration', description: ' converting between analog/digital. Calculating simple time elapsed.' },
          { title: 'Mass', description: 'Hefting and measuring mass with kilograms and grams.' },
          { title: 'Angles', description: 'Identifying angles as measures of turn. Right angles in shapes.' },
          { title: 'Symmetry', description: 'Line symmetry in the environment and 2D shapes.' },
          { title: 'Multiplication Facts II', description: 'Introduction to 3x and 4x tables. Doubling strategies.' },
          { title: 'Term 3 Assessment', description: 'Review of Fractions, Time, and Geometry.' },

          // Term 4
          { title: 'Money', description: 'Counting change and solving simple financial problems.' },
          { title: 'Chance', description: 'Language of probability (certain, impossible, likely). Simple experiments.' },
          { title: 'Data Collection', description: 'Tally marks, lists, and tables.' },
          { title: 'Data Representation', description: 'Creating and interpreting column graphs and picture graphs.' },
          { title: 'Number & Place Value II', description: 'Consolidation of 4-digit numbers and operations.' },
          { title: 'Operations Review', description: 'Mixed word problems involving + - x ÷.' },
          { title: 'Measurement Review', description: 'Consolidation of Length, Area, and Volume concepts.' },
          { title: 'Geometry Review', description: 'Properties of shapes and objects consolidation.' },
          { title: 'Problem Solving Strategy', description: 'Working backwards and drawing diagrams.' },
          { title: 'Final Examination', description: 'End of year assessment covering all strands.' }
        ]
      }
    ]
  },
  'year-3-english': {
    id: 'year-3-english',
    title: 'Year 3 English',
    gradeLevel: 'Year 3',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'A critical transition from learning to read, to reading to learn. We focus on structuring narratives and developing a rich vocabulary.',
    whyChoose: [
       { title: "Creative Expression", description: "Encouraging voice through structured creative writing tasks.", icon: PenTool },
       { title: "Small Group Immersion", description: "Reading aloud and discussing texts builds confidence and comprehension.", icon: Users },
       { title: "Growth Mindset", description: "Turning 'I can't write' into 'I can't write that yet'.", icon: GraduationCap }
    ],
    subjects: [
      {
        name: 'English',
        description: 'Developing fluency in reading and structure in writing.',
        keyOutcomes: [
          // Term 1
          'Structure narratives correctly', 'Use descriptive adjectives', 'Identify nouns and verbs', 'Reading for literal meaning',
          // Term 2
          'Write persuasive texts', 'Use high modality words', 'Correct punctuation usage', 'Inferential reading skills',
          // Term 3
          'Write information reports', 'Categorise information', 'Use technical vocabulary', 'Understand poetic devices',
          // Term 4
          'Analysing visual texts', 'Writing imaginative responses', 'Speaking clearly in presentations', 'Grammar mastery'
        ],
        topics: [
          // Term 1: Narrative
          { title: 'Narrative Structure', description: 'The story mountain: Orientation, Complication, Resolution.' },
          { title: 'Character Development', description: 'Describing appearance and personality traits.' },
          { title: 'Setting the Scene', description: 'Using the five senses to describe settings.' },
          { title: 'Grammar: Nouns & Pronouns', description: 'Common, proper, and collective nouns.' },
          { title: 'Grammar: Verbs & Adverbs', description: 'Action verbs and describing how actions happen.' },
          { title: 'Sentence Structure', description: 'Simple and compound sentences. Conjunctions.' },
          { title: 'Punctuation', description: 'Full stops, capital letters, and question marks mastery.' },
          { title: 'Spelling Strategies', description: 'Phonics, blends, and common sight words.' },
          { title: 'Reading Comprehension', description: 'Finding literal information in a text.' },
          { title: 'Creative Writing Task', description: 'Writing a complete narrative with a clear structure.' },

          // Term 2: Persuasive
          { title: 'Persuasive Structure', description: 'Introduction, arguments, and conclusion.' },
          { title: 'Brainstorming Arguments', description: 'Generating ideas for and against a topic.' },
          { title: 'High Modality Language', description: 'Using strong words to convince the reader.' },
          { title: 'Grammar: Adjectives', description: 'Descriptive and comparative adjectives.' },
          { title: 'Connectives', description: 'Linking ideas: Firstly, Furthermore, In conclusion.' },
          { title: 'Rhetorical Questions', description: 'Engaging the reader directly.' },
          { title: 'Reading: Inference', description: 'Reading between the lines to find meaning.' },
          { title: 'Editing Skills', description: 'Checking for spelling and punctuation errors.' },
          { title: 'Public Speaking', description: 'Presenting a persuasive argument to the class.' },
          { title: 'Persuasive Writing Task', description: 'Writing a persuasive text on a familiar topic.' },

          // Term 3: Informative & Poetry
          { title: 'Information Reports', description: 'Structure: Classification, Description, Conclusion.' },
          { title: 'Research Skills', description: 'Finding facts from books and safe websites.' },
          { title: 'Technical Vocabulary', description: 'Using subject-specific words for clarity.' },
          { title: 'Grammar: Paragraphing', description: 'Grouping related sentences into paragraphs.' },
          { title: 'Poetry: Rhyme & Rhythm', description: 'Exploring sound patterns in verse.' },
          { title: 'Poetry: Imagery', description: 'Similes and simple metaphors.' },
          { title: 'Acrostic & Haiku', description: 'Writing structured poems.' },
          { title: 'Reading: Summarising', description: 'Identifying the main idea of a text.' },
          { title: 'Visual Literacy', description: 'Interpreting images and illustrations.' },
          { title: 'Assessment Task', description: 'Writing an information report on an animal.' },

          // Term 4: Review & Extension
          { title: 'Review: Narrative', description: 'Advanced plot development and dialogue.' },
          { title: 'Speech Marks', description: 'Punctuating direct speech correctly.' },
          { title: 'Review: Persuasive', description: 'Strengthening arguments with evidence.' },
          { title: 'Grammar: Tense', description: 'Consistent use of past, present, and future tense.' },
          { title: 'Vocabulary Expansion', description: 'Synonyms and antonyms to improve word choice.' },
          { title: 'Reading: Prediction', description: 'Using clues to predict text outcomes.' },
          { title: 'Visual Media', description: 'Analysing short films and advertisements.' },
          { title: 'Handwriting', description: 'Developing fluent and legible joined handwriting.' },
          { title: 'Creative Response', description: 'Responding to visual stimuli.' },
          { title: 'Final Assessment', description: 'Comprehensive test on grammar, punctuation, and comprehension.' }
        ]
      }
    ]
  },

  // --- PRIMARY: YEAR 4 ---
  'year-4-maths': {
    id: 'year-4-maths',
    title: 'Year 4 Mathematics',
    gradeLevel: 'Year 4',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Advanced arithmetic and introduction to complex reasoning. We build the foundations required for the Opportunity Class placement test.',
    whyChoose: [
       { title: "OC Foundations", description: "Introducing mathematical reasoning questions early.", icon: Brain },
       { title: "Individual Attention", description: "Ensuring every misconception is caught immediately.", icon: Users },
       { title: "Exam Resilience", description: "Introduction to timed conditions and test strategies.", icon: Timer }
    ],
    subjects: [
      {
        name: 'Mathematics',
        description: 'Advanced arithmetic and introduction to complex reasoning.',
        keyOutcomes: [
          // Term 1
          'Recall all multiplication facts', 'Apply mental computation strategies', 'Measure perimeter and area', 'Read maps and grids',
          // Term 2
          'Perform long multiplication', 'Master short division', 'Compare volume and capacity', 'Identify geometric properties',
          // Term 3
          'Add and subtract fractions', 'Use decimal notation', 'Convert units of measurement', 'Solve time duration problems',
          // Term 4
          'Interpret advanced data displays', 'Calculate simple probability', 'Reason spatial problems', 'Solve multi-step problems'
        ],
        topics: [
          // Term 1
          { title: 'Place Value to 100,000', description: 'Ordering 5-digit numbers. Rounding to nearest 10, 100, 1000.' },
          { title: 'Addition & Subtraction', description: 'Formal algorithms with larger numbers and trading.' },
          { title: 'Multiplication Facts', description: 'Speed and accuracy with tables up to 10x10.' },
          { title: 'Mental Multiplication', description: 'Split strategy for multiplying 1-digit by 2-digit numbers.' },
          { title: 'Factors & Multiples', description: 'Finding factors of numbers. Identifying multiples.' },
          { title: 'Length Conversion', description: 'Converting between cm, m, km. Decimal representation of length.' },
          { title: 'Perimeter', description: 'Calculating perimeter of rectangles and composite shapes.' },
          { title: 'Area', description: 'Area of rectangles (L x W) and irregular shapes using grids.' },
          { title: 'Position', description: 'Compass points (N, S, E, W, NE, SE, etc) and scales on maps.' },
          { title: 'Term 1 Test', description: 'Assessment of Number and Measurement.' },

          // Term 2
          { title: 'Long Multiplication', description: 'Multiplying 2-digit by 1-digit and 3-digit by 1-digit numbers.' },
          { title: 'Short Division', description: 'Division with remainders using the short division algorithm.' },
          { title: 'Problem Solving: Operations', description: 'Choosing the correct operation for word problems.' },
          { title: 'Patterns', description: 'Number sentences and finding missing values in equations.' },
          { title: '2D Shapes', description: 'Classifying triangles (equilateral, isosceles, scalene).' },
          { title: 'Quadrilaterals', description: 'Properties of parallelogram, rhombus, trapezium, kite.' },
          { title: 'Angles', description: 'Measuring angles with a protractor. Classifying angles.' },
          { title: 'Volume', description: 'Volume of rectangular prisms using cubic cm.' },
          { title: 'Capacity', description: 'Millilitres and Litres. Reading scales.' },
          { title: 'Term 2 Test', description: 'Assessment of Operations and Geometry.' },

          // Term 3
          { title: 'Fractions: Equivalency', description: 'Finding equivalent fractions using diagrams and multiplication.' },
          { title: 'Fractions: Operations', description: 'Adding and subtracting fractions with like denominators.' },
          { title: 'Decimals Intro', description: 'Tenths and hundredths. Place value of decimals.' },
          { title: 'Decimals & Fractions', description: 'Converting between simple fractions and decimals.' },
          { title: 'Money', description: 'Calculating change and best buy. Rounding money.' },
          { title: 'Time: AM/PM', description: '12-hour and 24-hour time conversion.' },
          { title: 'Time: Duration', description: 'Calculating elapsed time in hours and minutes.' },
          { title: 'Mass', description: 'Tonnes, kilograms, and grams. Net and gross mass.' },
          { title: 'Temperature', description: 'Reading thermometers. Negative numbers intro.' },
          { title: 'Term 3 Test', description: 'Assessment of Fractions, Decimals, and Time.' },

          // Term 4
          { title: 'Data: Graphs', description: 'Constructing and interpreting column and line graphs.' },
          { title: 'Data: Surveying', description: 'Designing questions and collecting categorical data.' },
          { title: 'Chance', description: 'Probability as a fraction. Order of likelihood.' },
          { title: '3D Objects', description: 'Nets of prisms and pyramids. Cross-sections.' },
          { title: 'Transformations', description: 'Translation, reflection, and rotation (flip, slide, turn).' },
          { title: 'Mixed Operations', description: 'Order of operations introduction.' },
          { title: 'Mathematical Reasoning', description: 'Logic puzzles and spatial reasoning tasks.' },
          { title: 'OC Exam Preparation Intro', description: 'Introduction to multiple-choice reasoning questions.' },
          { title: 'Revision: Number', description: 'Consolidating all number concepts.' },
          { title: 'Final Exam', description: 'Year 4 comprehensive assessment.' }
        ]
      }
    ]
  },
  'year-4-english': {
    id: 'year-4-english',
    title: 'Year 4 English',
    gradeLevel: 'Year 4',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Refining writing style and vocabulary. We teach the mechanics of sentence variety and the structure of persuasive texts.',
    whyChoose: [
       { title: "Structured Writing", description: "Heavy emphasis on structuring complex narratives and persuasive texts.", icon: PenTool },
       { title: "Vocabulary Building", description: "Explicit instruction in sophisticated vocabulary.", icon: BookOpen },
       { title: "Feedback Loops", description: "Regular feedback on writing tasks helps students improve.", icon: MessageSquare }
    ],
    subjects: [
      {
        name: 'English',
        description: 'Refining writing style and vocabulary for the OC exam context.',
        keyOutcomes: [
          // Term 1
          'Use figurative language', 'Develop complex characters', 'Master direct speech', 'Identify text themes',
          // Term 2
          'Write persuasive expositions', 'Use rhetorical devices', 'Differentiate fact/opinion', 'Infer character motives',
          // Term 3
          'Structure informative texts', 'Summarise key information', 'Analyse poetic devices', 'Expand vocabulary',
          // Term 4
          'Respond to visual texts', 'Edit and refine writing', 'Comprehension strategies', 'Exam technique'
        ],
        topics: [
          // Term 1: Advanced Narrative
          { title: 'Show, Don\'t Tell', description: 'Using descriptive language to imply feelings and actions.' },
          { title: 'Figurative Language', description: 'Similes, metaphors, and personification.' },
          { title: 'Complex Sentences', description: 'Using dependent and independent clauses.' },
          { title: 'Dialogue', description: 'Punctuation and formatting of direct speech.' },
          { title: 'Character Arc', description: 'How characters change throughout a story.' },
          { title: 'Plot Tension', description: 'Building suspense in the complication.' },
          { title: 'Grammar: Homophones', description: 'Correct usage of there/their/they\'re, to/too/two.' },
          { title: 'Reading: Theme', description: 'Identifying the underlying message of a text.' },
          { title: 'Spelling Rules', description: 'Suffixes, prefixes, and root words.' },
          { title: 'Narrative Task', description: 'Writing a suspenseful narrative.' },

          // Term 2: Persuasive
          { title: 'Exposition Structure', description: 'Reviewing TEEL structure for body paragraphs.' },
          { title: 'Emotive Language', description: 'Choosing words to evoke feelings in the reader.' },
          { title: 'Modality', description: 'Low, medium, and high modality words.' },
          { title: 'Facts vs Opinion', description: 'Distinguishing between objective and subjective statements.' },
          { title: 'Persuasive Devices', description: 'Alliteration, Rule of Three, Exaggeration.' },
          { title: 'Audience Awareness', description: 'Tailoring tone and language to the reader.' },
          { title: 'Reading: Inference', description: 'Advanced inference strategies for comprehension tests.' },
          { title: 'Grammar: Pronouns', description: 'Subject and object pronouns. Possessive pronouns.' },
          { title: 'Debating', description: 'Oral persuasion and rebuttal skills.' },
          { title: 'Persuasive Task', description: 'Writing a letter to the editor.' },

          // Term 3: Informative & Poetry
          { title: 'Explanations', description: 'Structure of explanatory texts (How/Why things work).' },
          { title: 'Cause and Effect', description: 'Linking words for explanation (because, therefore, as a result).' },
          { title: 'Summarising', description: 'Extracting key points from a non-fiction text.' },
          { title: 'Vocabulary Expansion', description: 'Synonyms for common words (said, went, good).' },
          { title: 'Poetry: Alliteration', description: 'Repetition of consonant sounds for effect.' },
          { title: 'Poetry: Onomatopoeia', description: 'Words that imitate sounds.' },
          { title: 'Reading: Context', description: 'Understanding how context affects meaning.' },
          { title: 'Grammar: Prepositions', description: 'Words indicating place and time.' },
          { title: 'Research Project', description: 'Creating an explanatory poster.' },
          { title: 'Assessment', description: 'Reading comprehension and explanation writing.' },

          // Term 4: Media & Review
          { title: 'Visual Literacy', description: 'Analysing camera angles and colours in images.' },
          { title: 'Advertising', description: 'Persuasive techniques in ads.' },
          { title: 'News Reports', description: 'Structure of a news article (Who, What, Where, When).' },
          { title: 'Editing Strategy', description: 'COPS (Capitals, Omission, Punctuation, Spelling).' },
          { title: 'OC Comprehension', description: 'Introduction to multiple-choice reading tests.' },
          { title: 'Cloze Passages', description: 'Using context to fill in missing words.' },
          { title: 'Grammar Review', description: 'Comprehensive grammar rules revision.' },
          { title: 'Creative Writing', description: 'Writing from a stimulus image.' },
          { title: 'Exam Prep', description: 'Time management for writing tasks.' },
          { title: 'Final Exam', description: 'Year 4 English assessment.' }
        ]
      }
    ]
  },

  // --- PRIMARY: YEAR 5 ---
  'year-5-maths': {
    id: 'year-5-maths',
    title: 'Year 5 Mathematics',
    gradeLevel: 'Year 5',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Rigorous Stage 3 mastery. We accelerate learning to cover Year 6 concepts, providing a strong buffer for the Selective High School exam.',
    whyChoose: [
       { title: "Advanced Acceleration", description: "Introducing Year 6 and 7 concepts early.", icon: TrendingUp },
       { title: "Selective Strategy", description: "Targeted preparation for the exam format.", icon: Target },
       { title: "Problem Solving", description: "Focus on multi-step word problems.", icon: Lightbulb }
    ],
    subjects: [
      {
        name: 'Mathematics',
        description: 'Rigorous Stage 3 mastery and pre-secondary concepts.',
        keyOutcomes: [
          // Term 1
          'Identify prime and composite numbers', 'Master 2-digit multiplication', 'Calculate area of composite shapes', 'Solve perimeter problems',
          // Term 2
          'Operate with unlike fractions', 'Convert Fractions/Decimals/Percentages', 'Long division with remainders', 'Measure angles accurately',
          // Term 3
          'Calculate volume and capacity', 'Use 24-hour time and timetables', 'Introduction to Cartesian planes', 'Probability of events',
          // Term 4
          'Analyse data and mean/mode', 'Financial plans and budgets', 'Algebraic thinking and patterns', 'Selective Exam Reasoning'
        ],
        topics: [
          // Term 1
          { title: 'Number Theory', description: 'Primes, composites, square and triangular numbers.' },
          { title: 'Factors & Multiples', description: 'HCF (Highest Common Factor) and LCM (Lowest Common Multiple).' },
          { title: 'Order of Operations', description: 'Introduction to BODMAS/BIDMAS conventions.' },
          { title: 'Multiplication Ext', description: '2-digit by 2-digit multiplication algorithm.' },
          { title: 'Measurement Conversions', description: 'Converting mm, cm, m, km with decimals.' },
          { title: 'Area: Triangles', description: 'Introduction to area of triangles.' },
          { title: 'Area: Composite', description: 'Splitting shapes into rectangles to find total area.' },
          { title: 'Perimeter Problems', description: 'Finding missing sides given perimeter.' },
          { title: 'Directed Numbers', description: 'Introduction to negative numbers on a number line.' },
          { title: 'Term 1 Exam', description: 'Advanced Number and Measurement assessment.' },

          // Term 2
          { title: 'Division Ext', description: 'Long division algorithm (3-digit by 1-digit).' },
          { title: 'Fractions: Mixed', description: 'Converting between improper fractions and mixed numerals.' },
          { title: 'Fractions: Unlike', description: 'Adding and subtracting fractions with different denominators.' },
          { title: 'Decimals', description: 'Operations with decimals (+ - x). Rounding decimals.' },
          { title: 'Percentages', description: 'Introduction to % as out of 100. Common percentages (50%, 25%, 10%).' },
          { title: 'FDP Conversions', description: 'Converting between Fractions, Decimals, and Percentages.' },
          { title: 'Angles', description: 'Measuring reflex angles. Calculating missing angles on a line/point.' },
          { title: 'Triangles', description: 'Angle sum of a triangle (180 degrees).' },
          { title: 'Quadrilaterals', description: 'Angle sum of quadrilaterals. Properties of diagonals.' },
          { title: 'Term 2 Exam', description: 'Fractions, Decimals and Geometry assessment.' },

          // Term 3
          { title: 'Volume', description: 'Volume of prisms. Cubic centimetres and cubic metres.' },
          { title: 'Capacity', description: 'Relating volume to capacity (1000cm³ = 1 Litre).' },
          { title: 'Mass', description: 'Gross, net and tare mass concepts.' },
          { title: 'Time', description: 'Timetables, time zones, and 24-hour time calculations.' },
          { title: 'Cartesian Plane', description: 'Plotting points in the first quadrant. (x, y) coordinates.' },
          { title: 'Transformations', description: 'Rotational symmetry and order of rotation.' },
          { title: 'Chance', description: 'Probability as fractions, decimals, and percentages.' },
          { title: 'Data: Range', description: 'Finding the range of a dataset.' },
          { title: 'Data: Graphs', description: 'Side-by-side column graphs and dot plots.' },
          { title: 'Term 3 Exam', description: 'Measurement, Space and Data assessment.' },

          // Term 4
          { title: 'Data: Averages', description: 'Introduction to Mean, Median, and Mode.' },
          { title: 'Financial Maths', description: 'Simple interest intro, discounts, and budgets.' },
          { title: 'Patterns & Algebra', description: 'Finding the rule for geometric patterns.' },
          { title: 'Number Sentences', description: 'Balancing equations and finding unknown quantities.' },
          { title: 'Problem Solving I', description: 'Working backwards and trial & error strategies.' },
          { title: 'Problem Solving II', description: 'Drawing diagrams and logic puzzles.' },
          { title: 'Reasoning', description: 'Spatial reasoning tasks for Selective prep.' },
          { title: 'General Ability', description: 'Verbal and numerical reasoning practice.' },
          { title: 'Revision', description: 'Consolidation of Year 5 concepts.' },
          { title: 'Final Exam', description: 'Comprehensive Year 5 examination.' }
        ]
      }
    ]
  },
  'year-5-english': {
    id: 'year-5-english',
    title: 'Year 5 English',
    gradeLevel: 'Year 5',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Critical analysis and commanding writing styles. We focus on genre adaptation and deep text analysis.',
    whyChoose: [
       { title: "Genre Mastery", description: "Adapting voice and tone for different genres.", icon: PenTool },
       { title: "Visual Literacy", description: "Analysing static images and media for theme.", icon: Layers },
       { title: "Detailed Feedback", description: "Weekly marking ensures rapid improvement.", icon: Check }
    ],
    subjects: [
      {
        name: 'English',
        description: 'Critical analysis and commanding writing styles.',
        keyOutcomes: [
          // Term 1
          'Adapt writing for genre', 'Identify narrative themes', 'Use advanced punctuation', 'Comprehend complex texts',
          // Term 2
          'Write balanced discussions', 'Use evaluative language', 'Analyse advertising', 'Master spelling rules',
          // Term 3
          'Analyse poetic devices', 'Write informative explanations', 'Understand visual literacy', 'Build advanced vocabulary',
          // Term 4
          'Write extensive responses', 'Compare multiple texts', 'Selective test techniques', 'Edit for cohesion'
        ],
        topics: [
          // Term 1: Genre Writing
          { title: 'Genre: Science Fiction', description: 'Conventions of sci-fi. World building.' },
          { title: 'Genre: Historical', description: 'Weaving facts into fiction. Researching settings.' },
          { title: 'Narrative Voice', description: 'First, second, and third person perspectives.' },
          { title: 'Characterisation', description: 'Indirect characterisation (STEAL method).' },
          { title: 'Theme', description: 'Identifying themes like friendship, bravery, betrayal.' },
          { title: 'Punctuation', description: 'Colons, semi-colons, and parentheses.' },
          { title: 'Grammar: Clauses', description: 'Main, subordinate, and relative clauses.' },
          { title: 'Reading: Skimming', description: 'Techniques for speed reading.' },
          { title: 'Vocabulary', description: 'Latin and Greek roots.' },
          { title: 'Creative Writing Task', description: 'Writing a genre-specific short story.' },

          // Term 2: Discussion & Persuasion
          { title: 'Discussion Texts', description: 'Structure: Issue, Arguments For, Arguments Against.' },
          { title: 'Evaluative Language', description: 'Objective vs subjective language. Judgment words.' },
          { title: 'Persuasive Techniques', description: 'Anecdotes, Expert Opinion, Statistics.' },
          { title: 'Modality & Tone', description: 'Adjusting tone for formal and informal audiences.' },
          { title: 'Advertising Analysis', description: 'Deconstructing print advertisements.' },
          { title: 'Fallacies', description: 'Introduction to simple logical fallacies.' },
          { title: 'Reading: Scanning', description: 'Scanning for keywords in dense text.' },
          { title: 'Spelling', description: 'Silent letters and complex homophones.' },
          { title: 'Debating', description: 'Structuring a rebuttal.' },
          { title: 'Discussion Writing Task', description: 'Writing a balanced argument on a social issue.' },

          // Term 3: Poetry & Information
          { title: 'Poetic Devices', description: 'Metaphor, personification, hyperbole, oxymoron.' },
          { title: 'Poetry Analysis', description: 'Analysing a poem\'s mood, theme, and structure.' },
          { title: 'Ballads & Narrative Poetry', description: 'Storytelling through verse.' },
          { title: 'Explanations', description: 'Causal connectives and technical language review.' },
          { title: 'Visual Literacy', description: 'Salience, vectors, and framing in images.' },
          { title: 'Filmic Techniques', description: 'Camera shots (close up, long shot) and angles.' },
          { title: 'Reading: Synthesis', description: 'Combining information from two texts.' },
          { title: 'Grammar: Nominalisation', description: 'Turning verbs into nouns for formal writing.' },
          { title: 'Vocabulary', description: 'Synonyms for "show", "say", and "think".' },
          { title: 'Assessment', description: 'Visual literacy analysis and explanation writing.' },

          // Term 4: Selective Prep Focus
          { title: 'Selective Writing', description: 'Responding to abstract stimulus.' },
          { title: 'Narrative Tension', description: 'Pacing and climax management.' },
          { title: 'Comprehension: Multiple Choice', description: 'Strategies for elimination and best fit.' },
          { title: 'Cloze Passages', description: 'Advanced grammar and vocabulary cloze.' },
          { title: 'Text Comparison', description: 'Comparing themes across different texts.' },
          { title: 'Editing', description: 'Correcting sentence fragments and run-on sentences.' },
          { title: 'General Ability', description: 'Verbal reasoning and analogies.' },
          { title: 'Review: Grammar', description: 'Comprehensive grammar rules revision.' },
          { title: 'Review: Vocabulary', description: 'High-frequency academic words.' },
          { title: 'Final Exam', description: 'Year 5 English comprehensive assessment.' }
        ]
      }
    ]
  },

  // --- PRIMARY: YEAR 6 ---
  'year-6-maths': {
    id: 'year-6-maths',
    title: 'Year 6 Mathematics',
    gradeLevel: 'Year 6',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Bridging the gap to high school. We consolidate Primary knowledge and introduce Year 7 algebra and geometry to ensure a strong start.',
    whyChoose: [
       { title: "Algebraic Mastery", description: "Early mastery of algebra predicts high school success.", icon: Calculator },
       { title: "High School Readiness", description: "Shifting focus to independent study habits.", icon: GraduationCap },
       { title: "Confidence Building", description: "Entering Year 7 ahead of the cohort.", icon: Smile }
    ],
    subjects: [
      {
        name: 'Mathematics',
        description: 'Introduction to secondary mathematics concepts.',
        keyOutcomes: [
          // Term 1
          'Operations with integers', 'Use index notation', 'Apply order of operations', 'Solve decimal problems',
          // Term 2
          'Write algebraic expressions', 'Solve linear equations', 'Calculate circle properties', 'Interpret Cartesian planes',
          // Term 3
          'Calculate percentage discounts', 'Use unitary method', 'Convert metric units', 'Analyse sector graphs',
          // Term 4
          'High School numeracy prep', 'Problem solving strategies', 'Financial literacy', 'Data interpretation'
        ],
        topics: [
          // Term 1: Number Systems
          { title: 'Integers Intro', description: 'Positive and negative numbers. Ordering integers.' },
          { title: 'Operations with Integers', description: 'Adding and subtracting negative numbers.' },
          { title: 'Index Notation', description: 'Powers and square roots. Factor trees.' },
          { title: 'Prime Factors', description: 'Expressing numbers as products of prime factors.' },
          { title: 'BODMAS', description: 'Order of operations with brackets and indices.' },
          { title: 'Rational Numbers', description: 'Terminating and recurring decimals.' },
          { title: 'Decimals Operations', description: 'Multiplying and dividing decimals by integers.' },
          { title: 'Decimals by Decimals', description: 'Multiplying and dividing decimals by decimals.' },
          { title: 'Problem Solving', description: 'Multi-step number problems.' },
          { title: 'Term 1 Test', description: 'Integers and Decimals assessment.' },

          // Term 2: Algebra & Geometry
          { title: 'Intro to Algebra', description: 'Pronumerals, variables, coefficients, and constants.' },
          { title: 'Algebraic Expressions', description: 'Writing expressions from word descriptions.' },
          { title: 'Substitution', description: 'Substituting values into algebraic expressions.' },
          { title: 'Like Terms', description: 'Simplifying expressions by adding/subtracting like terms.' },
          { title: 'Linear Equations', description: 'Solving one-step equations using inverse operations.' },
          { title: 'The Cartesian Plane', description: 'Plotting points in all four quadrants.' },
          { title: 'Circle Geometry', description: 'Radius, diameter, circumference, arc, chord.' },
          { title: 'Circumference & Area', description: 'Using formulas C=2πr and A=πr².' },
          { title: 'Angles', description: 'Vertically opposite angles. Angles at a point.' },
          { title: 'Term 2 Test', description: 'Algebra and Geometry assessment.' },

          // Term 3: Ratio & Measure
          { title: 'Percentages', description: 'Finding percentage of a quantity. One amount as % of another.' },
          { title: 'Financial Maths', description: 'Calculating discounts and GST.' },
          { title: 'Ratios', description: 'Introduction to ratio. Simplifying ratios.' },
          { title: 'Rates', description: 'Speed, distance, time. The unitary method.' },
          { title: 'Length & Area', description: 'Converting square units (m² to cm²).' },
          { title: 'Volume & Capacity', description: 'Volume of composite prisms.' },
          { title: 'Data: Sector Graphs', description: 'Interpreting pie charts.' },
          { title: 'Data: Divided Bar Graphs', description: 'Constructing divided bar graphs.' },
          { title: 'Probability', description: 'Complementary events. Probability range 0 to 1.' },
          { title: 'Term 3 Test', description: ' Percentages, Ratio and Data assessment.' },

          // Term 4: High School Transition
          { title: 'Travel Graphs', description: 'Interpreting distance-time graphs.' },
          { title: 'Geometry: Triangles', description: 'Congruence concepts. Exterior angle theorem.' },
          { title: 'Algebra Extension', description: 'Solving two-step equations.' },
          { title: 'Measurement Extension', description: 'Surface area of rectangular prisms.' },
          { title: 'Financial Plans', description: 'Simple interest formula I=PRN.' },
          { title: 'Problem Solving', description: 'Logic puzzles and lateral thinking.' },
          { title: 'Study Skills', description: 'Note-taking and exam revision strategies.' },
          { title: 'High School Numeracy', description: 'Calculator skills and estimation.' },
          { title: 'Revision', description: 'Review of all Year 6 concepts.' },
          { title: 'Final Exam', description: 'End of primary school mathematics assessment.' }
        ]
      }
    ]
  },
  'year-6-english': {
    id: 'year-6-english',
    title: 'Year 6 English',
    gradeLevel: 'Year 6',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Transitioning to high school English. We focus on the analytical essay structure and advanced novel studies.',
    whyChoose: [
       { title: "Analytical Writing", description: "Transitioning to TEEL essay structure.", icon: PenTool },
       { title: "Literary Analysis", description: "In-depth study of themes and context.", icon: BookOpen },
       { title: "Shakespeare Intro", description: "Demystifying Shakespearean language.", icon: Layers }
    ],
    subjects: [
      {
        name: 'English',
        description: 'High school readiness in literature and composition.',
        keyOutcomes: [
          // Term 1
          'Write analytical paragraphs (TEEL)', 'Identify narrative voice', 'Analyse short stories', 'Use formal language',
          // Term 2
          'Understand Shakespearean context', 'Analyse dramatic techniques', 'Write creative adaptations', 'Compare media texts',
          // Term 3
          'Study a novel in depth', 'Analyse character development', 'Identify themes and symbols', 'Write extended essays',
          // Term 4
          'Critically analyse news', 'Detect bias in media', 'Refine creative writing', 'High school prep'
        ],
        topics: [
          // Term 1: Short Stories & Analysis
          { title: 'Analytical Writing Intro', description: 'Difference between storytelling and analysis.' },
          { title: 'TEEL Structure', description: 'Technique, Example, Effect, Link. Writing body paragraphs.' },
          { title: 'Short Story Study', description: 'Reading and deconstructing classic short stories.' },
          { title: 'Narrative Voice', description: 'Reliable and unreliable narrators.' },
          { title: 'Literary Devices', description: 'Symbolism, motif, and irony.' },
          { title: 'Formal Language', description: 'Writing in third person. Avoiding contractions.' },
          { title: 'Thesis Statements', description: 'Developing a strong argument for an essay.' },
          { title: 'Grammar: Complex Sentences', description: 'Subordinating conjunctions and clause structures.' },
          { title: 'Reading Comprehension', description: 'High school level reading passages.' },
          { title: 'Assessment', description: 'Writing an analytical paragraph on a short story.' },

          // Term 2: Shakespeare Intro
          { title: 'Shakespeare\'s World', description: 'Context: The Globe Theatre and Elizabethan England.' },
          { title: 'Language of Shakespeare', description: 'Understanding Thee, Thou, and archaic grammar.' },
          { title: 'Comedy vs Tragedy', description: 'Key features of Shakespearean genres.' },
          { title: 'Play Study: Midsummer Night', description: 'Plot summary and key characters.' },
          { title: 'Dramatic Techniques', description: 'Soliloquy, aside, and dramatic irony.' },
          { title: 'Modern Adaptations', description: 'Comparing the play to modern film versions.' },
          { title: 'Creative Adaptation', description: 'Retelling a scene in modern English.' },
          { title: 'Performance', description: 'Reading a scene with expression.' },
          { title: 'Visual Analysis', description: 'Costume and staging choices.' },
          { title: 'Assessment', description: 'Creative writing: Modern Shakespeare adaptation.' },

          // Term 3: Novel Study
          { title: 'Novel Context', description: 'Understanding the setting and author\'s purpose.' },
          { title: 'Character Arc', description: 'Tracking how a protagonist changes.' },
          { title: 'Theme Analysis', description: 'Identifying major themes (e.g. Good vs Evil).' },
          { title: 'Evidence Selection', description: 'Choosing the best quotes to support an argument.' },
          { title: 'Essay Planning', description: 'Structuring a full text response essay.' },
          { title: 'Introductions & Conclusions', description: 'Writing engaging intros and strong conclusions.' },
          { title: 'Vocabulary', description: 'Describing tone and atmosphere.' },
          { title: 'Discursive Writing', description: 'Exploring ideas without a rigid argument.' },
          { title: 'Peer Editing', description: 'Giving and receiving constructive feedback.' },
          { title: 'Assessment', description: 'Literary essay on the studied novel.' },

          // Term 4: Media & Transition
          { title: 'Media Literacy', description: 'Facts, opinions, and fake news.' },
          { title: 'Bias in News', description: 'How language shapes public opinion.' },
          { title: 'Feature Articles', description: 'Structure and language of journalism.' },
          { title: 'Speeches', description: 'Rhetorical devices in famous speeches.' },
          { title: 'High School Writing', description: 'Expectations for Year 7 English.' },
          { title: 'Grammar Bootcamp', description: 'Final review of parts of speech and punctuation.' },
          { title: 'Visual Texts', description: 'Analysing political cartoons and documentaries.' },
          { title: 'Creative Polish', description: 'Refining descriptive writing skills.' },
          { title: 'Reflection', description: 'Reviewing learning progress.' },
          { title: 'Final Exam', description: 'Reading comprehension and writing task.' }
        ]
      }
    ]
  },

  'oc-preparation': {
    id: 'oc-preparation',
    title: 'OC Exam Preparation',
    gradeLevel: 'Year 3-4',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Specialised preparation for the NSW Opportunity Class Placement Test.',
    whyChoose: [
      { title: "Exam Technique", description: "Strategies for multiple choice efficiency.", icon: Target },
      { title: "Reasoning Focus", description: "Heavy emphasis on mathematical and thinking skills.", icon: Brain },
      { title: "Mock Exams", description: "Regular simulation of exam conditions.", icon: FileText }
    ],
    subjects: [
      {
        name: 'Mathematical Reasoning',
        description: 'Logic-based maths problems.',
        keyOutcomes: ['Spatial reasoning', 'Logical deduction', 'Pattern recognition', 'Advanced arithmetic'],
        topics: [
          { title: 'Spatial Reasoning', description: 'Visualising 2D and 3D shapes. Nets, rotations, reflections, and block counting.' },
          { title: 'Logical Deduction', description: 'Venn diagrams, syllogisms, and truth tables. Deductive logic problems.' },
          { title: 'Numerical Patterns', description: 'Identifying complex sequences. Fibonacci, arithmetic, and geometric progressions.' },
          { title: 'Measurement Problems', description: 'Time zones, elapsed time, and complex perimeter/area scenarios.' }
        ]
      },
      {
        name: 'Thinking Skills',
        description: 'Critical thinking and problem solving.',
        keyOutcomes: ['Argument analysis', 'Identifying assumptions', 'Evaluating evidence', 'Logical puzzles'],
        topics: [
          { title: 'Critical Thinking', description: 'Strengthening and weakening arguments. Identifying conclusions and premises.' },
          { title: 'Problem Solving', description: 'Optimisation, scheduling, and arrangement problems. Determining "best fit" solutions.' },
          { title: 'Detecting Reasoning Errors', description: 'Identifying common logical fallacies (e.g., ad hominem, straw man).' },
          { title: 'Visual Logic', description: 'Matrix completion, figure analogies, and finding the odd one out.' }
        ]
      },
      {
        name: 'Reading',
        description: 'High-level text analysis.',
        keyOutcomes: ['Speed reading', 'Contextual vocabulary', 'Poetry analysis', 'Detail extraction'],
        topics: [
          { title: 'Cloze Passages', description: 'Choosing the correct word to complete a text based on grammar and semantic context.' },
          { title: 'Poetry Comprehension', description: 'Interpreting metaphorical language and themes in verse.' },
          { title: 'Classical Texts', description: 'Navigating archaic sentence structures and vocabulary.' },
          { title: 'Extracting Details', description: 'Scanning for specific information under time pressure.' }
        ]
      }
    ]
  },
  'selective-preparation': {
    id: 'selective-preparation',
    title: 'Selective Exam Preparation',
    gradeLevel: 'Year 5-6',
    category: 'Primary',
    heroImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Intensive preparation for the NSW Selective High School Placement Test.',
    whyChoose: [
      { title: "Cambridge Style", description: "Aligned with the new test format.", icon: Check },
      { title: "Writing Feedback", description: "Detailed feedback on creative and persuasive pieces.", icon: PenTool },
      { title: "Performance Tracking", description: "Benchmarking against cohort performance.", icon: BarChart3 }
    ],
    subjects: [
      {
        name: 'Mathematical Reasoning',
        description: 'Advanced problem solving speed.',
        keyOutcomes: ['Multi-step problems', 'Algebraic techniques', 'Data interpretation', 'Geometry proofs'],
        topics: [
          { title: 'Advanced Arithmetic', description: 'Speed techniques for mental maths. Estimation and approximation strategies.' },
          { title: 'Algebraic Application', description: 'Using variables to solve word problems (ages, numbers, coins).' },
          { title: 'Combinatorics', description: 'Systematic listing, permutations, combinations, and probability.' },
          { title: 'Geometry & Measurement', description: 'Circle theorems, composite areas, and volume of irregular solids.' }
        ]
      },
      {
        name: 'Thinking Skills',
        description: 'Mastering the Cambridge assessment style.',
        keyOutcomes: ['Deductive reasoning', 'Inductive reasoning', 'Spatial visualisation', 'Logical fallacies'],
        topics: [
          { title: 'Logic Puzzles', description: 'Knights and knaves, seating arrangements, and truth-teller problems.' },
          { title: 'Argumentation', description: 'Identifying flaws in reasoning and evaluating the impact of new evidence.' },
          { title: 'Visual Reasoning', description: 'Complex 3D rotation and folding (nets of cubes).' },
          { title: 'Numerical Logic', description: 'Coding, decoding, and number relationship puzzles.' }
        ]
      },
      {
        name: 'Writing',
        description: 'Structuring compelling narratives.',
        keyOutcomes: ['Originality', 'Vocabulary', 'Structure', 'Stimulus response'],
        topics: [
          { title: 'Creative Writing', description: 'Developing a unique authorial voice. Avoiding clichés.' },
          { title: 'Persuasive Writing', description: 'Structuring an argument with strong Ethos, Logos, and Pathos.' },
          { title: 'Stimulus Response', description: 'Interpreting visual and written prompts creatively.' },
          { title: 'Time Management', description: 'Planning, drafting, and editing within 20 minutes.' }
        ]
      }
    ]
  },

  // --- SECONDARY ---
  'year-7-maths': {
    id: 'year-7-maths',
    title: 'Year 7 Mathematics',
    gradeLevel: 'Year 7',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Transitioning to abstract mathematical thinking.',
    whyChoose: [
       { title: "Algebraic Foundation", description: "Year 7 is the year of Algebra. We ensure students don't just 'do' the steps, but understand the variable logic that underpins all high school maths.", icon: Layers },
       { title: "Small Groups", description: "The transition to high school is daunting. Our small groups provide a safe space to ask questions without fear of judgement.", icon: Users },
       { title: "Confidence", description: "We focus on quick wins and clear explanations to build a positive relationship with mathematics early on.", icon: Smile }
    ],
    subjects: [
      {
        name: 'Number & Algebra',
        description: 'Developing fluency with integers and introduction to algebraic variables.',
        keyOutcomes: ['Operations with Integers', 'Algebraic Expressions', 'Linear Equations', 'Fractions & Decimals'],
        topics: [
          { title: 'Integers', description: 'Directed numbers, number line, addition, subtraction, multiplication, and division of negative numbers.' },
          { title: 'Indices', description: 'Index notation, prime factorisation (factor trees), square and cube roots.' },
          { title: 'Fractions, Decimals & Percentages', description: 'Operations with fractions, terminating and recurring decimals, percentage of quantities.' },
          { title: 'Algebraic Techniques', description: 'Introduction to pronumerals, simplifying expressions, gathering like terms, substitution.' },
          { title: 'Linear Equations', description: 'Solving one-step and two-step equations. Introduction to inequalities.' }
        ]
      },
      {
        name: 'Measurement & Geometry',
        description: 'Understanding spatial relationships and geometric properties.',
        keyOutcomes: ['Angle Relationships', 'Properties of Shapes', 'Perimeter & Area', 'Time'],
        topics: [
          { title: 'Angle Relationships', description: 'Types of angles, complementary and supplementary angles, angles at a point, vertically opposite.' },
          { title: 'Parallel Lines', description: 'Transversals, alternate, corresponding, and co-interior angles.' },
          { title: 'Properties of Geometrical Figures', description: 'Classifying triangles and quadrilaterals based on side and angle properties.' },
          { title: 'Length & Area', description: 'Perimeter of simple and composite shapes. Area of rectangles, triangles, and parallelograms.' },
          { title: 'Time', description: '12/24 hour time, time zones, and calculating duration.' }
        ]
      },
      {
        name: 'Stats & Probability',
        description: 'Collecting, representing and analysing data.',
        keyOutcomes: ['Data Collection', 'Data Display', 'Measures of Centre', 'Simple Probability'],
        topics: [
          { title: 'Data Analysis', description: 'Frequency tables, dot plots, stem-and-leaf plots, and divided bar graphs.' },
          { title: 'Measures of Centre', description: 'Calculating mean, median, mode, and range for small datasets.' },
          { title: 'Probability', description: 'Language of chance, sample space, theoretical probability of simple events.' }
        ]
      }
    ]
  },
  'year-8-maths': {
    id: 'year-8-maths',
    title: 'Year 8 Mathematics',
    gradeLevel: 'Year 8',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Expanding algebraic skills and introducing deductive geometry.',
    whyChoose: [
       { title: "Advanced Algebra", description: "Factorisation and multi-step equations are where many students stumble. We dedicate extra time to these high-value topics.", icon: Calculator },
       { title: "Geometry Proofs", description: "Introduction to formal reasoning and proofs. We teach students how to construct a logical argument step-by-step.", icon: Brain },
       { title: "Problem Solving", description: "We shift focus from simple calculation to application questions, preparing students for the complexity of Year 9.", icon: Target }
    ],
    subjects: [
      {
        name: 'Algebra & Equations',
        description: 'Advancing algebraic manipulation and problem solving.',
        keyOutcomes: ['Expansion & Factorisation', 'Multi-step Equations', 'Linear Relationships', 'Index Laws'],
        topics: [
          { title: 'Algebraic Techniques', description: 'Expanding binomial products, factorising by HCF, simplifying algebraic fractions.' },
          { title: 'Equations & Inequalities', description: 'Solving equations with variables on both sides, equations with brackets/fractions.' },
          { title: 'Linear Relationships', description: 'The Cartesian plane, plotting lines from tables, gradient and y-intercept (y=mx+c).' },
          { title: 'Index Laws', description: 'Multiplication, division, and power of a power laws with zero index.' }
        ]
      },
      {
        name: 'Geometry & Measurement',
        description: 'Applying logic to spatial problems.',
        keyOutcomes: ['Pythagoras Theorem', 'Congruence', 'Volume & Capacity', 'Circles'],
        topics: [
          { title: 'Pythagoras Theorem', description: 'Finding the hypotenuse and short sides. Application in real-life problems.' },
          { title: 'Properties of Solids', description: 'Volume of right prisms (triangular, rectangular) and cylinders. Capacity conversions.' },
          { title: 'Circles', description: 'Circumference (C=2πr) and Area (A=πr²). Area of sectors and arc length.' },
          { title: 'Congruence', description: 'Conditions for triangle congruence (SSS, SAS, AAS, RHS). Writing formal geometric proofs.' }
        ]
      },
      {
        name: 'Ratios & Data',
        description: 'Analysing rates and statistical trends.',
        keyOutcomes: ['Ratios & Rates', 'Data Analysis', 'Venn Diagrams'],
        topics: [
          { title: 'Ratios & Rates', description: 'Simplifying ratios, dividing quantities in a ratio. Speed, distance, and time.' },
          { title: 'Financial Maths', description: 'Profit and loss, discounts, and GST. Simple interest introduction.' },
          { title: 'Data Analysis', description: 'Analyzing outliers. Effect of data on mean/median. Two-way tables and Venn diagrams.' }
        ]
      }
    ]
  },
  'year-9-maths': {
    id: 'year-9-maths',
    title: 'Year 9 Mathematics',
    gradeLevel: 'Year 9',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Mastery of Stage 5.3 content. Critical for students intending to take Advanced or Extension Mathematics.',
    whyChoose: [
      { 
        title: "Evidence-Based Curriculum", 
        description: "Our material isn't just a textbook. It's a scientifically designed roadmap. We utilise spiral learning, where key concepts are revisited with increasing complexity to ensure long-term retention.", 
        icon: Layers 
      },
      { 
        title: "Immersive Small Groups", 
        description: "We cap classes at 6 students to ensure a 'high-fidelity' classroom. Tutors engage in Socratic questioning, ensuring students are active participants, not passive listeners.", 
        icon: Users 
      },
      { 
        title: "The Ryze Practice Cycle", 
        description: "Learning happens when you do, not just when you watch. Our cycle of in-class guided practice, followed by independent consolidation and AI-driven error analysis, creates a robust feedback loop.", 
        icon: Check 
      },
      { 
        title: "Expert Mentorship", 
        description: "Our tutors are more than just smart students; they are trained mentors. We combine academic excellence with the emotional intelligence required to build student confidence.", 
        icon: GraduationCap 
      }
    ],
    subjects: [
      {
        name: 'Advanced Algebra',
        description: 'Foundations for calculus and higher mathematics.',
        keyOutcomes: ['Surds & Indices', 'Quadratics', 'Simultaneous Equations', 'Algebraic Fractions'],
        topics: [
          { title: 'Surds & Indices', description: 'Simplifying surds, operations with surds, rationalising the denominator. Fractional and negative indices.' },
          { title: 'Algebraic Expansion', description: 'Binomial expansion, perfect squares, difference of two squares.' },
          { title: 'Factorisation', description: 'Quadratic trinomials (monic and non-monic), grouping in pairs.' },
          { title: 'Equations', description: 'Solving quadratic equations. Simultaneous equations (substitution and elimination).' }
        ]
      },
      {
        name: 'Measurement & Geometry',
        description: 'Coordinate geometry and trigonometric ratios.',
        keyOutcomes: ['Trigonometry', 'Coordinate Geometry', 'Surface Area', 'Similarity'],
        topics: [
          { title: 'Trigonometry', description: 'SOH CAH TOA, finding unknown sides and angles. Angles of elevation/depression. Bearings.' },
          { title: 'Coordinate Geometry', description: 'Distance formula, midpoint, gradient, equation of a line (point-gradient, two-point).' },
          { title: 'Surface Area & Volume', description: 'SA of cylinders, cones, and spheres. Volume of pyramids and composite solids.' },
          { title: 'Similarity', description: 'Tests for similar triangles. Scale factors for length, area, and volume.' }
        ]
      },
      {
        name: 'Statistics',
        description: 'Interpreting complex datasets.',
        keyOutcomes: ['Bivariate Data', 'Box Plots', 'Standard Deviation'],
        topics: [
          { title: 'Single Variable Data', description: 'Box-and-whisker plots, interquartile range. Comparing datasets.' },
          { title: 'Probability', description: 'Relative frequency, multi-stage events, tree diagrams.' }
        ]
      }
    ]
  },
  'year-10-maths': {
    id: 'year-10-maths',
    title: 'Year 10 Mathematics',
    gradeLevel: 'Year 10',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Completing Stage 5.3 and bridging to Stage 6.',
    whyChoose: [
      { title: "Stage 6 Preparation", description: "We introduce Functions and Logarithms early, ensuring a smoother transition to the demands of Year 11 Advanced and Extension.", icon: TrendingUp },
      { title: "Advanced Geometry", description: "Formal proofs and circle geometry are major stumbling blocks. We tackle them with visual intuition and rigorous logic.", icon: Brain },
      { title: "Exam Focus", description: "Year 10 is when assessment difficulty spikes. We prepare students for rigorous timed assessments and multi-step problems.", icon: Target }
    ],
    subjects: [
      {
        name: 'Non-Linear Relationships',
        description: 'Study of curves and functions.',
        keyOutcomes: ['Parabolas', 'Hyperbolas', 'Circles', 'Exponentials'],
        topics: [
          { title: 'Quadratics', description: 'Graphing parabolas, vertex form, axis of symmetry, intercepts.' },
          { title: 'Other Graphs', description: 'Hyperbolas (y=k/x), Circles (x²+y²=r²), Exponentials (y=a^x), and Cubics.' },
          { title: 'Functions', description: 'Function notation f(x), domain and range.' }
        ]
      },
      {
        name: 'Advanced Geometry',
        description: 'Formal proofs and advanced trigonometry.',
        keyOutcomes: ['Sine & Cosine Rules', 'Circle Geometry', 'Proofs'],
        topics: [
          { title: 'Non-Right Angled Trig', description: 'The Sine Rule, Cosine Rule, and Area of a Triangle formula (1/2ab sinC).' },
          { title: 'Circle Geometry', description: 'Angle at centre, angles in same segment, cyclic quadrilaterals, tangent-secant theorem.' },
          { title: 'Deductive Geometry', description: 'Constructing formal proofs using theorems.' }
        ]
      },
      {
        name: 'Polynomials & Logs',
        description: 'Introduction to Stage 6 Advanced concepts.',
        keyOutcomes: ['Logarithms', 'Polynomials', 'Curve Sketching'],
        topics: [
          { title: 'Logarithms', description: 'Definition, log laws, and solving exponential equations.' },
          { title: 'Polynomials', description: 'Long division of polynomials, remainder theorem, factor theorem.' },
          { title: 'Bivariate Data', description: 'Scatter plots, line of best fit, correlation coefficient (r).' }
        ]
      }
    ]
  },
  'year-11-maths-advanced': {
    id: 'year-11-maths-advanced',
    title: 'Year 11 Mathematics Advanced',
    gradeLevel: 'Year 11',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'A calculus-based course focused on modelling and applied mathematics. We cover the Preliminary course with depth.',
    whyChoose: [
      { title: "Calculus Foundation", description: "Differentiation is the language of Year 12. We ensure students are fluent in it before they ever see an HSC paper.", icon: TrendingUp },
      { title: "Conceptual Depth", description: "We move beyond rote learning to deep understanding. Students learn 'why' the maths works, not just 'how' to do it.", icon: Brain },
      { title: "Exam Strategy", description: "We teach the art of deconstructing complex multi-topic questions, a key skill for the HSC.", icon: Target },
      { title: "Personal Feedback", description: "With only 6 students, we can provide the detailed marking feedback usually reserved for private tutoring.", icon: Users }
    ],
    subjects: [
      {
        name: 'Functions',
        description: 'Understanding mathematical relationships and their graphs.',
        keyOutcomes: ['Function Notation', 'Domain & Range', 'Transformations'],
        topics: [
          { title: 'Working with Functions', description: 'Algebraic and graphical relationships. Odd and even functions. Composite functions.' },
          { title: 'Graphs & Relations', description: 'Absolute value functions, inequalities, and region testing.' },
          { title: 'Transformations', description: 'Translations, dilations, and reflections of functions.' }
        ]
      },
      {
        name: 'Trigonometric Functions',
        description: 'Extending trigonometry to the unit circle and radians.',
        keyOutcomes: ['Radians', 'Trig Identities', 'Trig Equations'],
        topics: [
          { title: 'Radians', description: 'Converting degrees to radians. Arc length and area of sectors.' },
          { title: 'Unit Circle', description: 'Definitions of sin, cos, tan for all angles. Exact ratios.' },
          { title: 'Identities & Equations', description: 'Pythagorean identities. Solving trigonometric equations for a given domain.' }
        ]
      },
      {
        name: 'Calculus',
        description: 'The study of change. The most critical topic for Year 12.',
        keyOutcomes: ['Limits', 'Differentiation', 'Tangents & Normals'],
        topics: [
          { title: 'Introduction to Calculus', description: 'Limits, continuity, and the gradient of a curve.' },
          { title: 'Differentiation', description: 'First principles. The power rule. Tangents and normals.' },
          { title: 'Rules of Differentiation', description: 'Product rule, quotient rule, and chain rule.' }
        ]
      },
      {
        name: 'Exponentials & Logs',
        description: 'Modelling growth and decay.',
        keyOutcomes: ['Log Laws', 'Derivative of e^x', 'Modelling'],
        topics: [
          { title: 'Logarithms', description: 'Logarithmic laws and changing bases. Solving exponential equations.' },
          { title: 'The Exponential Function', description: 'The number e. Graphing exponentials and logs.' },
          { title: 'Calculus of Exponentials', description: 'Differentiating y=e^x and y=ln(x).' }
        ]
      }
    ]
  },
  'year-11-maths-ext1': {
    id: 'year-11-maths-ext1',
    title: 'Year 11 Maths Extension 1',
    gradeLevel: 'Year 11',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Extension 1 content runs parallel to Advanced. We delve into complex topics like Combinatorics and Inverse Functions.',
    whyChoose: [
      { title: "Specialised Content", description: "Topics like Combinatorics require a different way of thinking. We provide the structured frameworks needed to master them.", icon: Layers },
      { title: "University Prep", description: "This course is the gateway to engineering and physical sciences. We treat it with the academic rigour it deserves.", icon: GraduationCap },
      { title: "Small Group Advantage", description: "Extension 1 concepts often require individual explanation. Our 1:6 ratio makes this possible.", icon: Users },
      { title: "Band E4 Tutors", description: "Taught exclusively by educators who achieved the highest bands in these specific courses.", icon: Award }
    ],
    subjects: [
      {
        name: 'Further Functions',
        description: 'Complex functional relationships.',
        keyOutcomes: ['Inverse Functions', 'Parametric Forms', 'Polynomials'],
        topics: [
          { title: 'Inverse Functions', description: 'Existence of inverses. Graphical relationships.' },
          { title: 'Polynomials', description: 'Roots and coefficients relationships. The Factor and Remainder theorems. Graphing polynomials.' },
          { title: 'Parametric Equations', description: 'Parameters. The parabola in parametric form (x=2at, y=at²). Chords, tangents, and normals.' }
        ]
      },
      {
        name: 'Trigonometry',
        description: 'Advanced trigonometric identities and functions.',
        keyOutcomes: ['Inverse Trig', 'Compound Angles', 't-formulae'],
        topics: [
          { title: 'Inverse Trigonometry', description: 'Graphs of arcsin, arccos, arctan. Domain and range restrictions.' },
          { title: 'Compound Angles', description: 'Expansions for sin(A+B), cos(A+B), tan(A+B). Double angle formulae.' },
          { title: 't-formulae', description: 'Expressing trig ratios in terms of t = tan(x/2). Solving equations.' }
        ]
      },
      {
        name: 'Combinatorics',
        description: 'The mathematics of counting.',
        keyOutcomes: ['Permutations', 'Combinations', 'Pigeonhole Principle'],
        topics: [
          { title: 'Permutations', description: 'Arrangements with and without restrictions. Factorial notation.' },
          { title: 'Combinations', description: 'Selections where order does not matter. The nCr notation.' },
          { title: 'Pascal\'s Triangle', description: 'Binomial expansion and combinatorial identities. The Pigeonhole Principle.' }
        ]
      }
    ]
  },
  'year-12-maths-advanced': {
    id: 'year-12-maths-advanced',
    title: 'Year 12 Mathematics Advanced',
    gradeLevel: 'Year 12',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'The HSC Course. We focus on mastering Calculus, Financial Maths, and Statistics, with intense preparation for the final exams.',
    whyChoose: [
      { title: "HSC Focused", description: "Every lesson is backward-mapped from final HSC questions. We don't teach content in a vacuum; we teach it for the exam.", icon: Target },
      { title: "Syllabus Coverage", description: "We ensure systematic coverage of every single syllabus dot point so there are no surprises in the final exam.", icon: Check },
      { title: "Results Driven", description: "Our methodology has a proven track record of helping students move from Band 4/5 to Band 6.", icon: Award },
      { title: "Error Analysis", description: "We focus heavily on exam technique—minimising silly mistakes and maximising marks in multi-part questions.", icon: BarChart3 }
    ],
    subjects: [
      {
        name: 'Calculus',
        description: 'Integration and curve sketching.',
        keyOutcomes: ['Graphing Techniques', 'Integration', 'Applications of Calculus'],
        topics: [
          { title: 'Graphing Techniques', description: 'Curve sketching using first and second derivatives. Concavity and points of inflection.' },
          { title: 'Integration', description: 'Primitive functions. The fundamental theorem of calculus. Area under curves and between curves.' },
          { title: 'Trapezoidal Rule', description: 'Approximating areas.' }
        ]
      },
      {
        name: 'Financial Mathematics',
        description: 'Modelling financial situations using series.',
        keyOutcomes: ['Series & Sequences', 'Loans & Annuities'],
        topics: [
          { title: 'Series & Sequences', description: 'Arithmetic and geometric progressions. Summing series.' },
          { title: 'Investments', description: 'Compound interest as a geometric progression.' },
          { title: 'Annuities & Loans', description: 'Future value and present value of annuities. Loan repayments.' }
        ]
      },
      {
        name: 'Statistical Analysis',
        description: 'Continuous probability and data distribution.',
        keyOutcomes: ['Random Variables', 'Normal Distribution', 'Z-Scores'],
        topics: [
          { title: 'Bivariate Data', description: 'Correlation and regression lines.' },
          { title: 'Continuous Random Variables', description: 'Probability density functions. Cumulative distribution functions.' },
          { title: 'The Normal Distribution', description: 'Properties of the bell curve. Z-scores and empirical rule.' }
        ]
      }
    ]
  },
  'year-12-maths-ext1': {
    id: 'year-12-maths-ext1',
    title: 'Year 12 Maths Extension 1',
    gradeLevel: 'Year 12',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Advanced applications of calculus and vectors. Designed for students pursuing STEM at university.',
    whyChoose: [
      { title: "Rigorous Approach", description: "In Extension 1, knowing the answer isn't enough. We teach the 'why' behind complex proofs to ensure deep understanding.", icon: Brain },
      { title: "Vector Mastery", description: "Vectors are the language of modern physics. We dedicate significant time to ensuring students visualise and manipulate them fluently.", icon: Target },
      { title: "Hardest Questions", description: "We specifically target the Band E4 differentiator questions—the ones that separate the top 5% from the rest.", icon: BarChart3 },
      { title: "High Achievement", description: "Our environment is one of excellence. Students are surrounded by peers who are equally motivated to achieve top results.", icon: Award }
    ],
    subjects: [
      {
        name: 'Calculus Applications',
        description: 'Modelling the physical world.',
        keyOutcomes: ['Diff Equations', 'Projectile Motion', 'Rates of Change'],
        topics: [
          { title: 'Further Calculus', description: 'Integration by substitution. Integration of sin²x and cos²x.' },
          { title: 'Differential Equations', description: 'Introduction to slope fields. Solving first-order differential equations. Growth and decay models.' },
          { title: 'Projectile Motion', description: 'Equations of motion derived from calculus. Time of flight, range, and maximum height.' }
        ]
      },
      {
        name: 'Vectors',
        description: 'Geometric and algebraic vectors in 2D.',
        keyOutcomes: ['Vector Operations', 'Projections', 'Geometric Proofs'],
        topics: [
          { title: 'Introduction to Vectors', description: 'Magnitude, direction, and component form.' },
          { title: 'Vector Operations', description: 'Dot product. Projections of vectors.' },
          { title: 'Vector Geometry', description: 'Using vectors to prove geometric theorems.' }
        ]
      },
      {
        name: 'Statistics',
        description: 'Bernoulli trials and sample proportions.',
        keyOutcomes: ['Binomial Distribution', 'Sample Proportions'],
        topics: [
          { title: 'Binomial Distribution', description: 'Bernoulli trials. Probability mass function. Mean and variance.' },
          { title: 'Sample Proportions', description: 'Distribution of sample proportions. Normal approximation.' }
        ]
      }
    ]
  },
  'year-12-maths-ext2': {
    id: 'year-12-maths-ext2',
    title: 'Year 12 Maths Extension 2',
    gradeLevel: 'Year 12',
    category: 'Secondary',
    heroImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'The pinnacle of high school mathematics. Focused on abstract reasoning, complex numbers, and rigorous proof.',
    whyChoose: [
      { title: "Elite Preparation", description: "Designed for students aiming for the highest bands. We focus on elegance and efficiency in mathematical argument.", icon: Award },
      { title: "Abstract Reasoning", description: "Extension 2 requires a shift from calculation to proof. We help students make that cognitive leap.", icon: Brain },
      { title: "Expert Guidance", description: "This level of mathematics requires a mentor, not just a teacher. Our tutors have lived and breathed these problems.", icon: Users },
      { title: "Complex Mechanics", description: "From resisted motion to 3D vectors, we break down the most physically counter-intuitive topics into manageable steps.", icon: Layers }
    ],
    subjects: [
      {
        name: 'Complex Numbers',
        description: 'Extending the number system to the complex plane.',
        keyOutcomes: ['Arithmetic', 'Argand Diagrams', 'De Moivre\'s Theorem'],
        topics: [
          { title: 'Complex Arithmetic', description: 'Real and imaginary parts. Conjugates. Modulus-argument form.' },
          { title: 'Geometric Representation', description: 'Vectors in the complex plane. Curves and regions (circles, lines, rays).' },
          { title: 'De Moivre\'s Theorem', description: 'Powers and roots of complex numbers. Euler\'s formula.' }
        ]
      },
      {
        name: 'Proof',
        description: 'The language of mathematics.',
        keyOutcomes: ['Induction', 'Deduction', 'Inequalities'],
        topics: [
          { title: 'Nature of Proof', description: 'Direct proof, proof by contraposition, proof by contradiction.' },
          { title: 'Mathematical Induction', description: 'Proving series, divisibility, and inequality statements.' },
          { title: 'Inequalities', description: 'Arithmetic-Geometric Mean inequality. Triangle inequality.' }
        ]
      },
      {
        name: 'Further Vectors & Mechanics',
        description: 'Physics applications and 3D space.',
        keyOutcomes: ['3D Vectors', 'Resisted Motion', 'Simple Harmonic Motion'],
        topics: [
          { title: '3D Vectors', description: 'Vectors in three dimensions. Cartesian coordinates in space. Equation of lines and spheres.' },
          { title: 'Resisted Motion', description: 'Motion with air resistance (v and v²). Terminal velocity.' },
          { title: 'Simple Harmonic Motion', description: 'Equations of SHM. Period, amplitude, and frequency.' }
        ]
      }
    ]
  },
};
