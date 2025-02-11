import { useState } from "react";
import { useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import authService from "./services/auth-service";

interface FormState {
  email: string;
  password: string;
}

export default function Index() {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = useCallback(() => {
    return isValidEmail(form.email) && form.password.length > 0;
  }, [form]);

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    try {
      setError(""); // Clear any previous errors
      await authService.login({
        email: form.email,
        password: form.password,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "An error occurred while logging in. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <View style={styles.formContainer}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      {form.email && !isValidEmail(form.email) && (
        <Text style={styles.errorText}>Please enter a valid email</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        secureTextEntry
        autoComplete="password"
      />

      <TouchableOpacity
        style={[styles.button, !isFormValid() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 32,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    fontSize: 12,
  },
  button: {
    backgroundColor: "#007AFF",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
