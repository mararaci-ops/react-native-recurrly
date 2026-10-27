import { AuthButton } from "@/components/auth/AuthButton";
import { AuthField } from "@/components/auth/AuthField";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { getAuthErrorMessage, isValidEmail } from "@/lib/auth";
import { useSignUp } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const [isVerifying, setIsVerifying] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const isLoading = fetchStatus === "fetching";

  const showError = (error: unknown, fallback: string) => {
    setErrorMessage(getAuthErrorMessage(error, fallback));
    setNotice("");
  };

  const finishSignUp = async () => {
    const { error } = await signUp.finalize();
    if (error) {
      showError(error, "No se pudo crear tu sesión. Inténtalo de nuevo.");
      return;
    }

    router.replace("/(tabs)");
  };

  const handleSignUp = async () => {
    if (!name.trim()) {
      setErrorMessage("Ingresa tu nombre para continuar.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage("Ingresa un correo electrónico válido.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
        unsafeMetadata: { displayName: name.trim() },
      });

      if (error) {
        showError(error, "No se pudo crear la cuenta. Revisa tus datos.");
        return;
      }

      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode();
      if (verificationError) {
        showError(
          verificationError,
          "No se pudo enviar el código de verificación.",
        );
        return;
      }

      setIsVerifying(true);
      setCode("");
      setNotice("Te enviamos un código para confirmar tu correo.");
    } catch (error) {
      showError(
        error,
        "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.",
      );
    }
  };

  const handleVerifyEmail = async () => {
    if (!code.trim()) {
      setErrorMessage("Ingresa el código que recibiste.");
      return;
    }

    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });
      if (error) {
        showError(
          error,
          "El código no es válido. Compruébalo e inténtalo de nuevo.",
        );
        return;
      }

      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }

      setErrorMessage(
        "La cuenta requiere pasos adicionales. Contacta con soporte.",
      );
    } catch (error) {
      showError(error, "No se pudo verificar el código. Inténtalo de nuevo.");
    }
  };

  const handleResendCode = async () => {
    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        showError(error, "No se pudo reenviar el código.");
        return;
      }
      setNotice("Te enviamos un nuevo código de verificación.");
    } catch (error) {
      showError(error, "No se pudo reenviar el código. Inténtalo de nuevo.");
    }
  };

  const handleBackToDetails = async () => {
    setErrorMessage("");
    setNotice("");
    setCode("");

    try {
      const { error } = await signUp.reset();
      if (error) {
        showError(error, "No se pudo reiniciar el registro.");
        return;
      }
      setIsVerifying(false);
    } catch (error) {
      showError(error, "No se pudo reiniciar el registro.");
    }
  };

  const footer = isVerifying ? (
    <Pressable
      className="mt-6 items-center py-2"
      onPress={handleBackToDetails}
      disabled={isLoading}
      accessibilityRole="button"
    >
      <Text className="font-sans-semibold text-sm text-primary">
        Cambiar los datos del registro
      </Text>
    </Pressable>
  ) : (
    <Text className="mt-6 text-center font-sans text-sm text-muted-foreground">
      ¿Ya tienes cuenta?{" "}
      <Link href="/(auth)/sign-in" className="font-sans-semibold text-primary">
        Inicia sesión
      </Link>
    </Text>
  );

  return (
    <AuthScreen
      title={isVerifying ? "Confirma tu correo" : "Crea tu cuenta"}
      subtitle={
        isVerifying
          ? `Escribe el código que enviamos a ${email.trim()}.`
          : "Empieza a tener tus suscripciones bajo control."
      }
      footer={footer}
    >
      <View className="gap-3 rounded-3xl border border-border bg-card p-5">
        {isVerifying ? (
          <>
            {notice ? (
              <Text className="font-sans text-sm leading-5 text-muted-foreground">
                {notice}
              </Text>
            ) : null}
            <AuthField
              label="Código de verificación"
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
              onSubmitEditing={handleVerifyEmail}
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
              label="Verificar correo"
              onPress={handleVerifyEmail}
              loading={isLoading}
            />
            <Pressable
              className="items-center py-2"
              onPress={handleResendCode}
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
              label="Nombre"
              value={name}
              onChangeText={(value) => {
                setName(value);
                setErrorMessage("");
              }}
              placeholder="Tu nombre"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="givenName"
              returnKeyType="next"
            />
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
            <AuthField
              label="Contraseña"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrorMessage("");
              }}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
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
                {passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
              </Text>
            </Pressable>
            <AuthField
              label="Confirmar contraseña"
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
              onSubmitEditing={handleSignUp}
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
              label="Crear cuenta"
              onPress={handleSignUp}
              loading={isLoading}
            />
            <Text className="text-center font-sans text-xs leading-5 text-muted-foreground">
              Protegemos tus datos y nunca compartimos tu información de acceso.
            </Text>
          </>
        )}
      </View>
    </AuthScreen>
  );
}
