export function initMainProcessLogger() {
  if (typeof window !== 'undefined' && window.desktop?.log?.onLog) {
    window.desktop.log.onLog((level, message) => {
      const prefix = '[Main]';
      if (level === 'error') {
        console.error(prefix, message);
      } else if (level === 'warn') {
        console.warn(prefix, message);
      } else {
        console.log(prefix, message);
      }
    });
  }
}
