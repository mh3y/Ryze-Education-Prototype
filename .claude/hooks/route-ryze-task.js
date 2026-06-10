/**
 * Ryze Routing Hook — route-ryze-task.js
 * Fires on UserPromptSubmit. Reads the user's prompt and injects a routing
 * hint when it matches a known Ryze skill domain.
 *
 * Text written to stdout is added to Claude's context before it processes
 * the prompt. This does NOT force a skill — it nudges Claude toward the
 * right workflow so you don't have to remember skill names manually.
 *
 * Exit 0 always — never block a prompt.
 */

let input = '';
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
  let data = {};
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const prompt = String(data.prompt || '').toLowerCase();

  // Order matters — more specific domains first to prevent false matches.
  // Attendance before CRM: "missing from the CRM" contains "crm" but is an attendance issue.
  // Performance before CRM: some performance prompts mention "admin" incidentally.
  const routes = [
    {
      skill: 'ryze-attendance-pipeline-triage',
      match: [
        'attendance', 'discord voice', 'voice session', 'bot sync',
        'voiceattendance', 'lesson matching', 'calendar sync',
        'attendanceengine', 'attendance engine', 'missing session',
        'backfill session', 'left early', 'left_early', 'partial attendance',
        'late attendance', 'bot offline', 'bot push',
      ],
    },
    {
      skill: 'ryze-performance-pass',
      match: [
        'pagespeed', 'psi', 'lcp', 'fcp', 'cls', 'core web vitals',
        'cloudinary', 'hero image', 'hero section', 'google fonts',
        'gtm', 'meta pixel', 'analytics deferral', 'third-party script',
        'render-blocking', 'mobile performance', 'mobile speed',
        'page load', 'bundle size', 'hsc-maths-program',
      ],
    },
    {
      skill: 'ryze-release-qa',
      match: [
        'pull request', 'pr #', 'merge', 'deploy', 'deployment',
        'release', 'safe to merge', 'regression', 'production readiness',
        'pre-deploy', 'qa check', 'build safety', 'before merging',
        'ready to ship', 'push to main',
      ],
    },
    {
      skill: 'ryze-crm-feature-implementation',
      match: [
        'admin page', 'crm feature', 'dashboard feature', 'api endpoint',
        'prisma', 'student management', 'tutor management',
        'parent portal', 'class management', 'lesson management',
        'homework', 'payments page', 'progress reports', 'leads pipeline',
        'messages page', 'alerts page', 'announcements', 'resources page',
        'audit log', 'role-gated',
      ],
    },
  ];

  const matched = routes.find(route =>
    route.match.some(term => prompt.includes(term))
  );

  if (!matched) {
    process.exit(0);
  }

  console.log(
    `[Ryze routing] This task matches the \`${matched.skill}\` skill. ` +
    `Invoke or follow that skill before planning or implementing. ` +
    `Skip the skill only if this is a trivial single-line or copy-only change.`
  );

  process.exit(0);
});
