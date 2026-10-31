import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const isPostHogConfigured = Boolean(
  projectToken &&
    projectToken !== "phc_your_project_token_here" &&
    host &&
    host !== "your_posthog_host",
);

if (!isPostHogConfigured && __DEV__) {
  const missingVariable = projectToken
    ? "POSTHOG_HOST"
    : "POSTHOG_PROJECT_TOKEN";

  console.warn(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

export const posthog = isPostHogConfigured
  ? new PostHog(projectToken!, {
      host: host!,
      logs: {
        serviceName: "react_native_recurrly",
      },
      captureAppLifecycleEvents: true,
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
          console: [],
        },
      },
      preloadFeatureFlags: true,
    })
  : null;

let isSigningOut = false;
let hasPendingIdentityReset = false;

export async function signOutWithTracking(
  signOut: () => Promise<void>,
): Promise<void> {
  isSigningOut = true;

  try {
    await signOut();
    posthog?.capture("user_signed_out");
  } finally {
    isSigningOut = false;

    if (hasPendingIdentityReset) {
      posthog?.reset();
      hasPendingIdentityReset = false;
    }
  }
}

export function resetPostHogIdentity() {
  if (isSigningOut) {
    hasPendingIdentityReset = true;
    return;
  }

  posthog?.reset();
}

type PostHogLogAttributes = Record<string, boolean | number | string>;

export const posthogLogger = {
  info: (message: string, attributes: PostHogLogAttributes) => {
    posthog?.logger.info(message, attributes);
  },
};
