import { Link } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert(
        "Campos incompletos",
        "Completa todos los campos para continuar.",
      );
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Correo inválido", "Ingresa una dirección de correo válida.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Contraseña insegura", "Usa al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        "Las contraseñas no coinciden",
        "Verifica ambas contraseñas.",
      );
      return;
    }

    Alert.alert("Registro listo", "Tus datos se validaron correctamente.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ÚNETE A NOSOTROS</Text>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para comenzar.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#9298A5"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            accessibilityLabel="Nombre completo"
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="nombre@ejemplo.com"
            placeholderTextColor="#9298A5"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Correo electrónico"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#9298A5"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            accessibilityLabel="Contraseña"
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#9298A5"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
            accessibilityLabel="Confirmar contraseña"
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Crear cuenta</Text>
          </TouchableOpacity>
          <Text style={styles.footer}>
            Al registrarte, aceptas nuestros términos y condiciones.
          </Text>
          <Link href={"/(auth)/sign-in"}>Iniciar sesión</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F8FC" },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: { marginBottom: 30 },
  eyebrow: {
    color: "#6257D9",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  title: { color: "#171A2B", fontSize: 32, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#707687", fontSize: 16 },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#20264A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  label: { color: "#272B3A", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "#F8F9FC",
    borderColor: "#E5E7EF",
    borderRadius: 11,
    borderWidth: 1,
    color: "#171A2B",
    fontSize: 15,
    height: 50,
    marginBottom: 18,
    paddingHorizontal: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#6257D9",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footer: {
    color: "#858A98",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
    textAlign: "center",
  },
});
