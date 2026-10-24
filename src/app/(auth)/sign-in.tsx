import { Link } from "expo-router";
import { useState } from "react";
import { fontFamilies } from "@/constants/fonts";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSignIn = () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Completa tus datos",
        "Ingresa tu correo y contraseña para continuar.",
      );
      return;
    }

    Alert.alert("Iniciar sesión", "Conecta aquí tu servicio de autenticación.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>R</Text>
          </View>

          <Text style={styles.eyebrow}>RECURLY</Text>
          <Text style={styles.title}>Qué bueno verte</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nombre@correo.com"
              placeholderTextColor="#98A2B3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Correo electrónico"
              returnKeyType="next"
            />

            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Contraseña</Text>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Recuperar contraseña",
                    "Pronto podrás recuperar tu contraseña.",
                  )
                }
                accessibilityRole="button"
              >
                <Text style={styles.link}>¿La olvidaste?</Text>
              </Pressable>
            </View>
            <View style={styles.passwordInputWrap}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#98A2B3"
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                accessibilityLabel="Contraseña"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <Pressable
                onPress={() => setPasswordVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                hitSlop={8}
              >
                <Text style={styles.showPassword}>
                  {passwordVisible ? "Ocultar" : "Mostrar"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignIn}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            ¿Aún no tienes una cuenta?{" "}
            <Link href={"/(auth)/sign-up"}>Regístrate</Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#E8F3F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  brandMarkText: {
    color: "#167D68",
    fontSize: 27,
    fontFamily: fontFamilies.extrabold,
  },
  eyebrow: {
    color: "#167D68",
    fontSize: 12,
    fontFamily: fontFamilies.bold,
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    color: "#101828",
    fontSize: 32,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.7,
  },
  subtitle: {
    color: "#667085",
    fontSize: 16,
    marginTop: 9,
    marginBottom: 34,
  },
  form: {
    gap: 10,
  },
  label: {
    color: "#344054",
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    color: "#101828",
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    marginBottom: 12,
  },
  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  link: {
    color: "#167D68",
    fontSize: 13,
    fontFamily: fontFamilies.semibold,
  },
  passwordInputWrap: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    color: "#101828",
    fontSize: 15,
    fontFamily: fontFamilies.regular,
  },
  showPassword: {
    color: "#667085",
    fontSize: 13,
    fontFamily: fontFamilies.semibold,
    marginLeft: 10,
  },
  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#167D68",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fontFamilies.bold,
  },
  footerText: {
    color: "#667085",
    fontSize: 14,
    fontFamily: fontFamilies.regular,
    textAlign: "center",
    marginTop: 28,
  },
});
