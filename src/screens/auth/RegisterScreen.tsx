import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { fontSizes, typography } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Password validation: min 10 chars, at least 1 letter, at least 1 digit
 * Matches backend RegisterRequestValidator
 */
const validatePassword = (password: string): string | null => {
  if (password.length < 10) return 'Şifre en az 10 karakter olmalı.';
  if (!/[a-zA-Z]/.test(password)) return 'Şifre en az bir harf içermeli.';
  if (!/[0-9]/.test(password)) return 'Şifre en az bir rakam içermeli.';
  return null;
};

type Props = {
  onNavigateLogin: () => void;
};

const RegisterScreen: React.FC<Props> = ({ onNavigateLogin }) => {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Kullanıcı adı gerekli.';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalı.';
    }

    if (!email.trim()) {
      newErrors.email = 'E-posta gerekli.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Geçerli bir e-posta adresi girin.';
    }

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gerekli.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(
        username.trim(),
        email.trim(),
        password,
        confirmPassword,
        displayName.trim() || undefined,
      );
      setRegisteredEmail(email.trim());
      setEmailSent(true);
    } catch (err) {
      Alert.alert('Kayıt Başarısız', err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [register, username, email, password, confirmPassword, displayName]);

  const clearError = (field: string) => setErrors((e) => { const next = { ...e }; delete next[field]; return next; });

  // E-posta gönderildi ekranı
  if (emailSent) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['rgba(232,17,26,0.15)', 'rgba(0,0,0,0)']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emailSentContainer}>
            <LinearGradient colors={[colors.primary, '#C40E16']} style={styles.emailIconBadge}>
              <Ionicons name="mail" size={36} color={colors.white} />
            </LinearGradient>
            <Text style={styles.emailSentTitle}>E-posta Gönderildi!</Text>
            <Text style={styles.emailSentText}>
              <Text style={styles.emailSentEmail}>{registeredEmail}</Text>
              {' '}adresine doğrulama bağlantısı gönderildi.{'\n\n'}
              E-postanızdaki bağlantıya tıklayarak hesabınızı doğrulayın.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={onNavigateLogin} activeOpacity={0.85}>
              <LinearGradient colors={[colors.primary, '#C40E16']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButtonGradient}>
                <Text style={styles.primaryButtonText}>Giriş Yap</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['rgba(232,17,26,0.15)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onNavigateLogin} style={styles.backButton} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>
              <Text style={styles.subtitleGs}>GS Tribün</Text>
              {' topluluğuna katıl'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username */}
            <View>
              <Text style={styles.label}>Kullanıcı Adı *</Text>
              <View style={[styles.inputWrapper, errors.username ? styles.inputError : null]}>
                <Ionicons name="at-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="kullanici_adi"
                  placeholderTextColor={colors.mutedText}
                  value={username}
                  onChangeText={(t) => { setUsername(t); clearError('username'); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            {/* Display Name */}
            <View>
              <Text style={styles.label}>Görünen Ad</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Adın (opsiyonel)"
                  placeholderTextColor={colors.mutedText}
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text style={styles.label}>E-posta *</Text>
              <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.mutedText}
                  value={email}
                  onChangeText={(t) => { setEmail(t); clearError('email'); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View>
              <Text style={styles.label}>Şifre *</Text>
              <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="En az 10 karakter, harf ve rakam"
                  placeholderTextColor={colors.mutedText}
                  value={password}
                  onChangeText={(t) => { setPassword(t); clearError('password'); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : (
                <Text style={styles.hintText}>Min 10 karakter, en az 1 harf ve 1 rakam</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Text style={styles.label}>Şifre Tekrar *</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreyi tekrar girin"
                  placeholderTextColor={colors.mutedText}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)} style={styles.eyeButton}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[colors.primary, '#C40E16']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButtonGradient}>
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Kayıt Ol</Text>
                    <Ionicons name="checkmark" size={18} color={colors.white} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={onNavigateLogin} hitSlop={8}>
              <Text style={styles.footerLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

  // Email sent
  emailSentContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  emailIconBadge: {
    width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
    ...Platform.select({ ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12 }, android: { elevation: 8 } }),
  },
  emailSentTitle: { color: colors.text, fontFamily: typography.bold, fontSize: fontSizes.xxl ?? 26, textAlign: 'center' },
  emailSentText: { color: colors.textSecondary, fontFamily: typography.medium, fontSize: fontSizes.md, textAlign: 'center', lineHeight: 22 },
  emailSentEmail: { color: colors.accent, fontFamily: typography.semiBold },

  // Header
  header: { paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xs },
  backButton: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: fontSizes.xxl ?? 26 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.medium, fontSize: fontSizes.md },
  subtitleGs: { color: colors.accent, fontFamily: typography.semiBold },

  // Form
  form: { gap: spacing.md },
  label: { color: colors.textSecondary, fontFamily: typography.medium, fontSize: fontSizes.xs, marginBottom: spacing.xs / 2, letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md, height: 52,
  },
  inputError: { borderColor: colors.error, borderWidth: 1.5, backgroundColor: 'rgba(232,17,26,0.05)' },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, color: colors.text, fontFamily: typography.medium, fontSize: fontSizes.md, height: '100%' },
  eyeButton: { padding: spacing.xs },
  errorText: { color: colors.error, fontFamily: typography.medium, fontSize: fontSizes.xs, marginTop: spacing.xs / 2, paddingHorizontal: spacing.xs },
  hintText: { color: colors.textTertiary, fontFamily: typography.medium, fontSize: fontSizes.xs, marginTop: spacing.xs / 2, paddingHorizontal: spacing.xs },

  // Button
  primaryButton: {
    borderRadius: radii.lg, overflow: 'hidden', marginTop: spacing.sm,
    ...Platform.select({ ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 }, android: { elevation: 6 } }),
  },
  primaryButtonGradient: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  buttonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: colors.white, fontFamily: typography.semiBold, fontSize: fontSizes.md, letterSpacing: 0.3 },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  footerText: { color: colors.textSecondary, fontFamily: typography.medium, fontSize: fontSizes.sm },
  footerLink: { color: colors.accent, fontFamily: typography.semiBold, fontSize: fontSizes.sm },
});

export default RegisterScreen;
