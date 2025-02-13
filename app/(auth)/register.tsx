import { useState, useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import authService from "../services/auth-service";

interface RegisterFormState {
  email: string;
  name: string;
  password: string;
  password_confirm: string;
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>({
    email: "",
    name: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState<string>("");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = useCallback(() => {
    return (
      isValidEmail(form.email) &&
      form.password.length > 0 &&
      form.name.length > 0 &&
      form.password === form.password_confirm
    );
  }, [form]);

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    try {
      setError(""); // Clear any previous errors
      await authService.register(form);
      // After successful registration, automatically log in
      await authService.login(
        {
          email: form.email,
          password: form.password,
        },
        router
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "An error occurred while registering. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Create Account</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        autoCapitalize="words"
        autoComplete="name"
      />

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
        placeholder="Password"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        secureTextEntry
        autoComplete="password"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={form.password_confirm}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password_confirm: text }))
        }
        secureTextEntry
        autoComplete="password"
      />
      {form.password !== form.password_confirm && form.password_confirm && (
        <Text style={styles.errorText}>Passwords do not match</Text>
      )}

      <TouchableOpacity
        style={[styles.button, !isFormValid() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.back()}
      >
        <Text style={styles.loginButtonText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
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
  loginButton: {
    marginTop: 16,
    padding: 8,
  },
  loginButtonText: {
    color: "#007AFF",
    textAlign: "center",
    fontSize: 14,
  },
});
