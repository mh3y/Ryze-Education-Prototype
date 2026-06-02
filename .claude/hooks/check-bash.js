/**
 * Ryze Safety Hook — check-bash.js
 * Runs as PreToolUse on Bash commands.
 * Blocks destructive commands that require explicit user confirmation.
 */

try {
  const input = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
  const cmd = input.command || '';

  const BLOCKED = [
    { pattern: 'prisma migrate reset', reason: 'Drops and recreates the entire database.' },
    { pattern: 'push --force',         reason: 'Force-push to remote. Check the target branch.' },
    { pattern: 'push -f ',             reason: 'Force-push to remote. Check the target branch.' },
    { pattern: 'git reset --hard',     reason: 'Discards all uncommitted changes permanently.' },
    { pattern: 'migrate dev --name',   reason: 'Creates a migration file — Ryze uses db push, not migrate.' },
  ];

  const hit = BLOCKED.find(b => cmd.includes(b.pattern));
  if (hit) {
    console.error(
      `[Ryze Safety] BLOCKED: "${hit.pattern}" detected.\n` +
      `Reason: ${hit.reason}\n` +
      `This requires explicit confirmation from the user before proceeding.`
    );
    process.exit(2);
  }
} catch (_) {
  // Never crash the hook itself — fail open
  process.exit(0);
}
