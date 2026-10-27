const authErrorTranslations: Record<string, string> = {
  form_identifier_not_found: "No encontramos una cuenta con esos datos.",
  form_password_incorrect: "La contraseña es incorrecta.",
  form_identifier_exists: "Ya existe una cuenta con esos datos.",
  form_code_incorrect: "El código ingresado no es válido.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) {
    return error instanceof Error ? error.message || fallback : fallback;
  }

  const apiErrors = Array.isArray(error.errors) ? error.errors : undefined;
  const clerkError = apiErrors?.[0] ?? error;
  const code =
    isRecord(clerkError) && typeof clerkError.code === "string"
      ? clerkError.code
      : undefined;

  if (code) {
    return authErrorTranslations[code] ?? fallback;
  }

  // Conserva mensajes de errores que no tengan el formato de Clerk.
  if (!apiErrors && error.clerkError !== true && error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

// export function getAuthErrorMessage(
//   error: unknown,
//   fallback: string,
// ): string {
//   if (error instanceof Error) {
//     const longMessage =
//       "longMessage" in error && typeof error.longMessage === "string"
//         ? error.longMessage
//         : undefined;
//     return longMessage || error.message || fallback;
//   }

//   return fallback;
// }

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
