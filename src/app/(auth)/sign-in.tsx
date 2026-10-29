import { AuthButton } from "@/components/auth/AuthButton";
import { AuthField } from "@/components/auth/AuthField";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { getAuthErrorMessage, isValidEmail } from "@/lib/auth";
import { posthog, posthogLogger } from "@/lib/posthog";
import { useSignIn } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type AuthStep = "sign-in" | "mfa" | "reset-code" | "reset-password";

type MfaStrategy =
  | "email_code"
  | "phone_code"
  | "totp"
  | "backup_code"
  | "passkey";

function isMfaStrategy(strategy: string): strategy is MfaStrategy {
  return (
    strategy === "email_code" ||
    strategy === "phone_code" ||
    strategy === "totp" ||
    strategy === "backup_code" ||
    strategy === "passkey"
  );
}

function mfaDescription(strategy: MfaStrategy): string {
  switch (strategy) {
    case "email_code":
      return "Ingresa el código que enviamos a tu correo.";
    case "phone_code":
      return "Ingresa el código que enviamos por SMS.";
    case "totp":
      return "Ingresa el código de tu aplicación de autenticación.";
    case "backup_code":
      return "Ingresa uno de tus códigos de respaldo.";
    case "passkey":
      return "Confirma tu identidad con la llave de acceso de tu dispositivo.";
  }
}

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const [step, setStep] = useState<AuthStep>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [availableMfaStrategies, setAvailableMfaStrategies] = useState<
    MfaStrategy[]
  >([]);
  const [mfaStrategy, setMfaStrategy] = useState<MfaStrategy>("email_code");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const isLoading = fetchStatus === "fetching";

  const showError = (error: unknown, fallback: string) => {
    setErrorMessage(getAuthErrorMessage(error, fallback));
    setNotice("");
  };

  const finishSignIn = async (isPasswordReset = false) => {
    const { error } = await signIn.finalize();
    if (error) {
      showError(error, "No se pudo iniciar sesión. Inténtalo de nuevo.");
      return;
    }

    if (isPasswordReset) {
      posthog?.capture("password_reset_completed");
      posthogLogger.info("password reset completed", {
        authentication_outcome: "success",
      });
    } else {
      posthog?.capture("user_signed_in");
      posthogLogger.info("sign in completed", {
        authentication_outcome: "success",
      });
    }
    router.replace("/(tabs)");
  };

  const sendMfaCode = async (strategy: MfaStrategy) => {
    if (strategy === "email_code") return signIn.mfa.sendEmailCode();
    if (strategy === "phone_code") return signIn.mfa.sendPhoneCode();
    return { error: null };
  };

  const handleSignIn = async () => {
    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage("Ingresa un correo electrónico válido.");
      return;
    }
    if (!password) {
      setErrorMessage("Ingresa tu contraseña para continuar.");
      return;
    }

    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await signIn.password({
        emailAddress: normalizedEmail,
        password,
      });
      console.log(handleSignIn, error);
      if (error) {
        showError(error, "No se pudo iniciar sesión. Revisa tus datos.");
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      // Si se necesita un factor de verificación
      if (signIn.status === "needs_second_factor") {
        const strategies = signIn.supportedSecondFactors
          .map(({ strategy }) => strategy)
          .filter(isMfaStrategy);

        // Verificación por código enviado por Email "email_code"
        const nextStrategy = strategies[0];

        if (!nextStrategy) {
          setErrorMessage(
            "Tu método de verificación no está disponible en esta versión. Contacta con soporte.",
          );
          return;
        }
        // Pedir a Clerk que envie el código de verificación
        const result = await sendMfaCode(nextStrategy);

        if (result.error) {
          showError(result.error, "No se pudo enviar el código de seguridad.");
          return;
        }

        setAvailableMfaStrategies(strategies);
        setMfaStrategy(nextStrategy);
        setCode("");
        setStep("mfa");
        return;
      }

      if (signIn.status === "needs_client_trust") {
        const { error: codeError } = await signIn.mfa.sendEmailCode();
        if (codeError) {
          showError(codeError, "No se pudo enviar el código de seguridad.");
          return;
        }

        setAvailableMfaStrategies(["email_code"]);
        setMfaStrategy("email_code");
        setCode("");
        setStep("mfa");
        return;
      }

      setErrorMessage(
        "No se pudo completar el inicio de sesión. Inténtalo de nuevo o restablece tu contraseña.",
      );
    } catch (error) {
      showError(
        error,
        "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.",
      );
    }
  };

  const handleRequestPasswordReset = async () => {
    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage(
        "Ingresa tu correo para enviarte un código de recuperación.",
      );
      return;
    }

    setErrorMessage("");
    setNotice("");

    try {
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
      });
      if (createError) {
        showError(createError, "No se pudo iniciar la recuperación.");
        return;
      }

      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        showError(error, "No se pudo enviar el código de recuperación.");
        return;
      }

      posthog?.capture("password_reset_requested");
      setCode("");
      setStep("reset-code");
      setNotice("Te enviamos un código de recuperación a tu correo.");
    } catch (error) {
      showError(error, "No se pudo conectar. Inténtalo de nuevo.");
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setErrorMessage("Ingresa el código que recibiste.");
      return;
    }

    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });
      if (error) {
        showError(
          error,
          "El código no es válido. Compruébalo e inténtalo de nuevo.",
        );
        return;
      }

      setStep("reset-password");
    } catch (error) {
      showError(error, "No se pudo verificar el código. Inténtalo de nuevo.");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });
      if (error) {
        showError(error, "No se pudo actualizar la contraseña.");
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn(true);
        return;
      }

      setErrorMessage("No se pudo completar el cambio de contraseña.");
    } catch (error) {
      showError(
        error,
        "No se pudo actualizar la contraseña. Inténtalo de nuevo.",
      );
    }
  };

  const handleMfaVerification = async () => {
    if (mfaStrategy !== "passkey" && !code.trim()) {
      setErrorMessage("Ingresa el código para continuar.");
      return;
    }

    setErrorMessage("");

    try {
      let error: Awaited<
        ReturnType<typeof signIn.mfa.verifyEmailCode>
      >["error"];
      if (mfaStrategy === "email_code") {
        ({ error } = await signIn.mfa.verifyEmailCode({ code: code.trim() }));
      } else if (mfaStrategy === "phone_code") {
        ({ error } = await signIn.mfa.verifyPhoneCode({ code: code.trim() }));
      } else if (mfaStrategy === "totp") {
        ({ error } = await signIn.mfa.verifyTOTP({ code: code.trim() }));
      } else if (mfaStrategy === "passkey") {
        ({ error } = await signIn.mfa.passkey());
      } else {
        ({ error } = await signIn.mfa.verifyBackupCode({ code: code.trim() }));
      }

      if (error) {
        showError(
          error,
          "El código no es válido. Compruébalo e inténtalo de nuevo.",
        );
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      setErrorMessage("No se pudo verificar el código de seguridad.");
    } catch (error) {
      showError(error, "No se pudo verificar el código. Inténtalo de nuevo.");
    }
  };

  const handleChangeMfaStrategy = async (strategy: MfaStrategy) => {
    setErrorMessage("");
    setCode("");

    try {
      const { error } = await sendMfaCode(strategy);
      if (error) {
        showError(error, "No se pudo enviar el código de seguridad.");
        return;
      }
      setMfaStrategy(strategy);
    } catch (error) {
      showError(error, "No se pudo enviar el código de seguridad.");
    }
  };

  const handleResendResetCode = async () => {
    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        showError(error, "No se pudo reenviar el código.");
        return;
      }
      setNotice("Te enviamos un nuevo código de recuperación.");
    } catch (error) {
      showError(error, "No se pudo reenviar el código. Inténtalo de nuevo.");
    }
  };

  const handleBackToSignIn = async () => {
    setErrorMessage("");
    setNotice("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("sign-in");

    try {
      const { error } = await signIn.reset();
      if (error) {
        showError(error, "No se pudo reiniciar el formulario.");
      }
    } catch (error) {
      showError(error, "No se pudo reiniciar el formulario.");
    }
  };

  const title =
    step === "mfa"
      ? "Confirma que eres tú"
      : step === "reset-code"
        ? "Revisa tu correo"
        : step === "reset-password"
          ? "Crea una contraseña nueva"
          : step === "sign-in"
            ? "Qué alegría verte"
            : "Recupera tu cuenta";
  const subtitle =
    step === "mfa"
      ? mfaDescription(mfaStrategy)
      : step === "reset-code"
        ? `Escribe el código que enviamos a ${email.trim()}.`
        : step === "reset-password"
          ? "Elige una contraseña segura para proteger tu cuenta."
          : step === "sign-in"
            ? "Inicia sesión para seguir tus suscripciones."
            : "Te enviaremos un código para que puedas cambiar tu contraseña.";
  const footer =
    step === "sign-in" ? (
      <Text className="mt-6 text-center font-sans text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link
          href="/(auth)/sign-up"
          className="font-sans-semibold text-primary"
        >
          Regístrate
        </Link>
      </Text>
    ) : (
      <Pressable
        className="mt-6 items-center py-2"
        onPress={handleBackToSignIn}
        disabled={isLoading}
        accessibilityRole="button"
      >
        <Text className="font-sans-semibold text-sm text-primary">
          Volver a iniciar sesión
        </Text>
      </Pressable>
    );

  return (
    <AuthScreen title={title} subtitle={subtitle} footer={footer}>
      <View className="gap-4 rounded-3xl border border-border bg-card p-5">
        {step === "sign-in" ? (
          <>
            <AuthField
              label="Correo electrónico"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErrorMessage("");
              }}
              placeholder="nombre@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-semibold text-sm text-primary">
                  Contraseña
                </Text>
                <Pressable
                  onPress={() => {
                    setErrorMessage("");
                    setNotice("");
                    void handleRequestPasswordReset();
                  }}
                  disabled={isLoading}
                  accessibilityRole="button"
                >
                  <Text className="font-sans-semibold text-xs text-primary">
                    ¿La olvidaste?
                  </Text>
                </Pressable>
              </View>
              <AuthField
                label=""
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setErrorMessage("");
                }}
                placeholder="Ingresa tu contraseña"
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
                accessibilityLabel="Contraseña"
              />
              <Pressable
                className="self-end py-1"
                onPress={() => setPasswordVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <Text className="font-sans-semibold text-xs text-muted-foreground">
                  {passwordVisible
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"}
                </Text>
              </Pressable>
            </View>

            {errorMessage ? (
              <Text
                className="font-sans text-sm text-destructive"
                accessibilityRole="alert"
              >
                {errorMessage}
              </Text>
            ) : null}
            <AuthButton
              label="Iniciar sesión"
              onPress={handleSignIn}
              loading={isLoading}
            />
          </>
        ) : step === "mfa" ? (
          <>
            {availableMfaStrategies.length > 1 ? (
              <View className="flex-row flex-wrap gap-2">
                {availableMfaStrategies.map((strategy) => (
                  <Pressable
                    key={strategy}
                    className={`rounded-full border px-3 py-2 ${
                      mfaStrategy === strategy
                        ? "border-accent bg-accent"
                        : "border-border bg-background"
                    }`}
                    onPress={() => handleChangeMfaStrategy(strategy)}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityState={{ selected: mfaStrategy === strategy }}
                  >
                    <Text
                      className={`font-sans-semibold text-xs ${
                        mfaStrategy === strategy ? "text-white" : "text-primary"
                      }`}
                    >
                      {strategy === "email_code"
                        ? "Correo"
                        : strategy === "phone_code"
                          ? "SMS"
                          : strategy === "totp"
                            ? "Autenticador"
                            : strategy === "backup_code"
                              ? "Respaldo"
                              : "Llave de acceso"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {mfaStrategy === "passkey" ? (
              <Text className="font-sans text-sm leading-5 text-muted-foreground">
                {mfaDescription(mfaStrategy)}
              </Text>
            ) : (
              <AuthField
                label="Código de seguridad"
                value={code}
                onChangeText={(value) => {
                  setCode(value);
                  setErrorMessage("");
                }}
                placeholder="Ingresa el código"
                keyboardType={
                  mfaStrategy === "backup_code" ? "default" : "number-pad"
                }
                autoCapitalize="none"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                returnKeyType="done"
                onSubmitEditing={handleMfaVerification}
              />
            )}
            {errorMessage ? (
              <Text
                className="font-sans text-sm text-destructive"
                accessibilityRole="alert"
              >
                {errorMessage}
              </Text>
            ) : null}
            <AuthButton
              label={
                mfaStrategy === "passkey"
                  ? "Usar llave de acceso"
                  : "Verificar código"
              }
              onPress={handleMfaVerification}
              loading={isLoading}
            />
          </>
        ) : step === "reset-code" ? (
          <>
            {notice ? (
              <Text className="font-sans text-sm leading-5 text-muted-foreground">
                {notice}
              </Text>
            ) : null}
            <AuthField
              label="Código de recuperación"
              value={code}
              onChangeText={(value) => {
                setCode(value);
                setErrorMessage("");
              }}
              placeholder="Ingresa el código"
              keyboardType="number-pad"
              autoCapitalize="none"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              returnKeyType="done"
              onSubmitEditing={handleVerifyCode}
            />
            {errorMessage ? (
              <Text
                className="font-sans text-sm text-destructive"
                accessibilityRole="alert"
              >
                {errorMessage}
              </Text>
            ) : null}
            <AuthButton
              label="Continuar"
              onPress={handleVerifyCode}
              loading={isLoading}
            />
            <Pressable
              className="items-center py-2"
              onPress={handleResendResetCode}
              disabled={isLoading}
              accessibilityRole="button"
            >
              <Text className="font-sans-semibold text-sm text-primary">
                Reenviar código
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <AuthField
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setErrorMessage("");
              }}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <AuthField
              label="Confirma tu contraseña"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setErrorMessage("");
              }}
              placeholder="Repite tu contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleResetPassword}
            />
            {errorMessage ? (
              <Text
                className="font-sans text-sm text-destructive"
                accessibilityRole="alert"
              >
                {errorMessage}
              </Text>
            ) : null}
            <AuthButton
              label="Guardar contraseña"
              onPress={handleResetPassword}
              loading={isLoading}
            />
          </>
        )}
      </View>
    </AuthScreen>
  );
}
