import { ApiResponse } from "@/types/api";

/** Dispatched after login / logout / profile patch so UI (e.g. header) can re-read auth */
export const AUTH_CHANGED_EVENT = "mu-events-auth-changed";

export function notifyAuthChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  }
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    rollNumber?: string | null;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    college?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

/** Payload aligned with Spring `RegisterRequest` */
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  /** Optional 10-digit mobile */
  phone?: string;
  roleId: number;
  collegeId?: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
  verified: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export function getApiBaseUrl(): string {
  if (
    typeof import.meta !== "undefined" &&
    (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL
  ) {
    return (import.meta as ImportMeta & { env: { VITE_API_URL: string } }).env.VITE_API_URL;
  }
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://localhost:8081/api";
}

/** Parse Spring / RFC7807 error bodies from failed fetch responses */
function extractHttpErrorMessage(raw: unknown): string {
  if (raw == null || typeof raw !== "object") return "Request failed";
  const r = raw as Record<string, unknown>;
  if (typeof r.message === "string" && r.message.trim()) return r.message;
  if (typeof r.detail === "string" && r.detail.trim()) return r.detail;
  if (r.errors && typeof r.errors === "object") {
    const errs = r.errors as Record<string, unknown>;
    const parts: string[] = [];
    for (const [, v] of Object.entries(errs)) {
      if (Array.isArray(v) && v.length > 0) parts.push(String(v[0]));
      else if (typeof v === "string") parts.push(v);
    }
    if (parts.length) return parts.join("; ");
  }
  return "Request failed";
}

class AuthService {
  private baseURL = getApiBaseUrl();

  private mapAuthPayload(raw: Record<string, unknown> | null | undefined): LoginResponse | null {
    if (!raw) return null;
    const u = raw.user as Record<string, unknown> | undefined;
    return {
      token: (raw.accessToken ?? raw.token) as string,
      refreshToken: raw.refreshToken as string,
      tokenType: (raw.tokenType as string) || "Bearer",
      expiresIn: (raw.expiresIn as number) || 0,
      user: {
        id: u ? String(u.id ?? "") : "",
        email: (u?.email as string) || "",
        firstName: (u?.firstName as string) || "",
        lastName: (u?.lastName as string) || "",
        role: (u?.role as string) || "",
        isActive: true,
        emailVerified: Boolean(u?.emailVerified),
        college: u?.collegeName ? { id: "", name: String(u.collegeName), code: "" } : undefined,
      },
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(extractHttpErrorMessage(errorData) || `HTTP error! status: ${response.status}`);
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const wrapped =
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Object.prototype.hasOwnProperty.call(payload, "success");
      const inner = (wrapped ? payload.data : payload) as T;
      return {
        success: (payload.success as boolean | undefined) !== false,
        data: inner,
        message: (payload.message as string) || "Success",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
        data: null as T,
      };
    }
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  private setRefreshToken(refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  private setUser(user: LoginResponse["user"]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  private clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<Record<string, unknown>>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!response.success || response.data == null) {
      return { ...response, data: null as LoginResponse | null };
    }

    const mapped = this.mapAuthPayload(response.data as Record<string, unknown>);
    if (mapped) {
      this.setToken(mapped.token);
      this.setRefreshToken(mapped.refreshToken);
      this.setUser(mapped.user);
      notifyAuthChanged();
      return { ...response, data: mapped };
    }

    return { ...response, data: null as LoginResponse | null };
  }

  /** Register; session tokens are issued only after email verification and login. */
  async register(payload: RegisterPayload): Promise<ApiResponse<LoginResponse | null>> {
    const body: Record<string, unknown> = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      password: payload.password,
      roleId: payload.roleId,
    };
    const digits = payload.phone?.replace(/\D/g, "") ?? "";
    if (digits.length >= 10) {
      body.phone = digits.slice(-10);
    }
    if (payload.collegeId != null) {
      body.collegeId = payload.collegeId;
    }

    const response = await fetch(`${this.baseURL}/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = extractHttpErrorMessage(raw) || `Registration failed (${response.status})`;
      return { success: false, message: msg, data: null };
    }

    const envelope = raw as Record<string, unknown>;
    const inner = (envelope?.data ?? envelope) as Record<string, unknown>;
    const mapped = this.mapAuthPayload(inner);
    const message =
      (envelope.message as string) ||
      "Registration received. Check your email to verify your account before signing in.";

    if (mapped?.token) {
      this.setToken(mapped.token);
      this.setRefreshToken(mapped.refreshToken);
      this.setUser(mapped.user);
      notifyAuthChanged();
    }

    return {
      success: true,
      message,
      data: mapped?.token ? mapped : null,
    };
  }

  async forgotPassword(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    return this.request<ForgotPasswordResponse>("/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> {
    return this.request<ResetPasswordResponse>("/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: data.token, newPassword: data.newPassword }),
    });
  }

  /** Confirm email via link token (no auth header required). */
  async verifyEmailToken(token: string): Promise<ApiResponse<VerifyEmailResponse>> {
    const url = `${this.baseURL}/v1/auth/verify-email?token=${encodeURIComponent(token)}`;
    const response = await fetch(url, { method: "GET" });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = (raw as { message?: string }).message || "Verification failed";
      return { success: false, message: msg, data: null as VerifyEmailResponse | null };
    }
    const envelope = raw as Record<string, unknown>;
    return {
      success: true,
      message: (envelope.message as string) || "Verified",
      data: { message: "OK", verified: true },
    };
  }

  async resendVerification(email: string): Promise<ApiResponse<ResendVerificationResponse>> {
    return this.request<ResendVerificationResponse>("/v1/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    });
  }

  async refreshSession(): Promise<ApiResponse<LoginResponse | null>> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return {
        success: false,
        message: "No refresh token available",
        data: null,
      };
    }

    const response = await fetch(`${this.baseURL}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Refresh-Token": refreshToken,
      },
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = (raw as { message?: string }).message || "Could not refresh session";
      return { success: false, message: msg, data: null };
    }

    const envelope = raw as Record<string, unknown>;
    const inner = (envelope?.data ?? envelope) as Record<string, unknown>;
    const mapped = this.mapAuthPayload(inner);
    if (mapped) {
      this.setToken(mapped.token);
      this.setRefreshToken(mapped.refreshToken);
      this.setUser(mapped.user);
      notifyAuthChanged();
      return { success: true, message: "OK", data: mapped };
    }

    return { success: false, message: "Invalid refresh response", data: null };
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>("/v1/auth/logout", {
      method: "POST",
    });

    this.clearAuth();
    notifyAuthChanged();
    return response;
  }

  getCurrentUser(): LoginResponse["user"] | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? (JSON.parse(userStr) as LoginResponse["user"]) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isEmailVerified(): boolean {
    const user = this.getCurrentUser();
    return user?.emailVerified || false;
  }

  /** After successful email verification without a fresh login */
  patchCurrentUser(partial: Partial<LoginResponse["user"]>): void {
    const u = this.getCurrentUser();
    if (!u || typeof window === "undefined") return;
    this.setUser({ ...u, ...partial });
    notifyAuthChanged();
  }

  async getProfile(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/v1/auth/profile", {
      method: "GET",
    });
  }

  async updateProfile(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/v1/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();
