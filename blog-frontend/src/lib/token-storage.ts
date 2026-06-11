const ACCESS_TOKEN_KEY = "blog.accessToken";
const REFRESH_TOKEN_KEY = "blog.refreshToken";

function canUseBrowserStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (!canUseBrowserStorage()) {
      return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    if (!canUseBrowserStorage()) {
      return null;
    }

    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clear(): void {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
