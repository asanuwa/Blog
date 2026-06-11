type EnvConfig = {
  apiUrl: string;
  siteUrl: string;
};

const requiredEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
} as const;

function requireEnv(name: keyof typeof requiredEnv): string {
  const value = requiredEnv[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireUrl(name: keyof typeof requiredEnv): string {
  const value = requireEnv(name);

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Invalid URL in environment variable: ${name}`);
  }
}

export const env: EnvConfig = {
  apiUrl: requireUrl("NEXT_PUBLIC_API_URL"),
  siteUrl: requireUrl("NEXT_PUBLIC_SITE_URL"),
};
