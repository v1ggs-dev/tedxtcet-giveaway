export function parseInstagramHandle(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  let str = raw.trim();
  if (!str) return undefined;

  // Ignore obvious non-handles
  const junkPatterns = /^(nil|na|n\/a|none|no|not|not on insta|yes|fg|\.|\.\.|\-|\_+)$/i;
  if (junkPatterns.test(str)) return undefined;

  // If email or forms link
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str) || /forms\.gle/i.test(str)) {
    return undefined;
  }

  // If full instagram URL: https://www.instagram.com/username/?...
  const urlMatch = str.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
  if (urlMatch && urlMatch[1]) {
    const handle = urlMatch[1].trim();
    if (!/^(p|reel|stories|explore|direct)$/i.test(handle)) {
      return handle;
    }
  }

  // Remove leading @ or trailing punctuation/whitespace
  str = str.replace(/^@+/, '').trim();
  // Strip trailing slashes or query params
  str = str.split('?')[0].replace(/\/+$/, '').trim();

  // If there are words or spaces (e.g. "@shardullll____. https://..."), extract handle
  if (str.includes(' ')) {
    const partWithHandle = str.split(/\s+/).find((p) => p.startsWith('@') || /^[a-zA-Z0-9._]{3,30}$/.test(p));
    if (partWithHandle) {
      str = partWithHandle.replace(/^@+/, '').replace(/[.,]+$/, '');
    } else {
      return undefined;
    }
  }

  // Valid Instagram handle format: 1-30 chars, alphanumeric + dots + underscores
  if (/^[a-zA-Z0-9._]{1,30}$/.test(str)) {
    return str;
  }

  return undefined;
}
