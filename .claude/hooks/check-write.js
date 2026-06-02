/**
 * Ryze Safety Hook — check-write.js
 * Runs as PreToolUse on Write commands.
 * Blocks writes to .env files (credentials must never be committed).
 */

try {
  const input = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
  const filePath = (input.file_path || '').replace(/\\/g, '/');

  // Match .env, .env.local, .env.production, etc. — but not .env.example
  if (/\.env(\.[a-z]+)?$/.test(filePath) && !filePath.endsWith('.env.example')) {
    console.error(
      `[Ryze Safety] BLOCKED: Attempted write to "${filePath}".\n` +
      `Credentials must never be committed. Confirm explicitly with the user first.\n` +
      `If this is intentional (e.g. updating .env.example), confirm before proceeding.`
    );
    process.exit(2);
  }
} catch (_) {
  // Never crash the hook itself — fail open
  process.exit(0);
}
