/**
 * Device identification for multi-device sync
 *
 * Generates and persists a unique device ID in localStorage.
 * This ID is used to track which device owns the workout session lock.
 */

const DEVICE_ID_KEY = "gympepz.deviceId";

/**
 * Get or generate a unique device ID
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Generate a new device ID
 */
function generateDeviceId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `device_${crypto.randomUUID()}`;
  }

  // Fallback for older browsers
  return `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Clear the device ID (for testing or logout)
 */
export function clearDeviceId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEVICE_ID_KEY);
}

/**
 * Get device info for display (browser + platform)
 */
export function getDeviceInfo(): { browser: string; platform: string } {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { browser: "Unknown", platform: "Unknown" };
  }

  const ua = navigator.userAgent;
  let browser = "Unknown";
  let platform = "Unknown";

  // Detect browser
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    browser = "Chrome";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
  } else if (ua.includes("Edg")) {
    browser = "Edge";
  }

  // Detect platform
  if (ua.includes("Mac")) {
    platform = "Mac";
  } else if (ua.includes("Windows")) {
    platform = "Windows";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    platform = "iOS";
  } else if (ua.includes("Android")) {
    platform = "Android";
  } else if (ua.includes("Linux")) {
    platform = "Linux";
  }

  return { browser, platform };
}

/**
 * Get a friendly device label
 */
export function getDeviceLabel(): string {
  const { browser, platform } = getDeviceInfo();
  return `${browser} on ${platform}`;
}
