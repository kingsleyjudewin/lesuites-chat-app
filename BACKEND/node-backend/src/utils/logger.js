const LEVELS = ['debug', 'info', 'warn', 'error'];

function log(level, ...args) {
  const ts = new Date().toISOString();
  console[level === 'debug' ? 'log' : level](`[${ts}] [${level.toUpperCase()}]`, ...args);
}
