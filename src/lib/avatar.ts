// Generate unique avatar colors and patterns based on username

const AVATAR_COLORS = [
  ["#008cff", "#036ec6"], // Blue (brand)
  ["#00a67d", "#008060"], // Green
  ["#9333ea", "#7e22ce"], // Purple
  ["#ea580c", "#c2410c"], // Orange
  ["#0891b2", "#0e7490"], // Cyan
  ["#be185d", "#9d174d"], // Pink
  ["#4f46e5", "#4338ca"], // Indigo
  ["#059669", "#047857"], // Emerald
  ["#d97706", "#b45309"], // Amber
  ["#7c3aed", "#6d28d9"], // Violet
  ["#dc2626", "#b91c1c"], // Red
  ["#0284c7", "#0369a1"], // Sky
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getAvatarColors(username: string): { primary: string; secondary: string } {
  const hash = hashString(username);
  const colorPair = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return { primary: colorPair[0], secondary: colorPair[1] };
}

export function getAvatarGradient(username: string): string {
  const colors = getAvatarColors(username);
  return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
}

export function getInitials(name: string, username: string): string {
  // Try to get initials from display name first
  if (name && name !== username) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  // Fall back to username
  // Handle kebab-case and camelCase
  const cleaned = username.replace(/[-_]/g, " ");
  const parts = cleaned.split(/\s+|(?=[A-Z])/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return username.slice(0, 2).toUpperCase();
}

export function getAvatarStyle(username: string): React.CSSProperties {
  return {
    background: getAvatarGradient(username),
  };
}
