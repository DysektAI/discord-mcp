const REDACTED = "<redacted>";

function shouldRedactEnvValue(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 6) return false;
  if (/^(true|false)$/i.test(trimmed)) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}

function getSensitiveEnvValues(): Array<[string, string]> {
  return Object.entries(process.env)
    .filter((entry): entry is [string, string] => shouldRedactEnvValue(entry[1]))
    .map(([name, value]) => [name, value.trim()])
    .sort((left, right) => right[1].length - left[1].length);
}

function redactAuthorizationHeaders(text: string): string {
  return text.replace(
    /(authorization["']?\s*[:=]\s*["']?bearer\s+)[^"'\s,}]+/gi,
    `$1${REDACTED}`,
  );
}

export function redactSensitiveText(value: string): string {
  let sanitized = redactAuthorizationHeaders(value);

  for (const [name, envValue] of getSensitiveEnvValues()) {
    sanitized = sanitized.split(envValue).join(`<redacted:${name}>`);
  }

  return sanitized;
}

export function sanitizeForLog(value: unknown): string {
  if (value instanceof Error) {
    return redactSensitiveText(value.stack || `${value.name}: ${value.message}`);
  }

  if (typeof value === "string") {
    return redactSensitiveText(value);
  }

  try {
    return redactSensitiveText(JSON.stringify(value));
  } catch {
    return redactSensitiveText(String(value));
  }
}
