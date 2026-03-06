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
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { fontSizes, typography } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const IS_IOS = Platform.OS === 'ios';

type Props = {
  onNavigateRegister: () => void;
};

const LoginScreen: React.FC<Props> = ({ onNavigateRegister }) => {
  const { login, signInWithGoogle, signInWithApple } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ emailOrUsername?: string; password?: string }>({});

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!emailOrUsername.trim()) newErrors.emailOrUsername = 'E-posta veya kullanıcı adı gerekli.';
    if (!password) newErrors.password = 'Şifre gerekli.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(emailOrUsername.trim(), password);
    } catch (err) {
      Alert.alert('Giriş Başarısız', err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [login, emailOrUsername, password]);

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      Alert.alert('Google Girişi Başarısız', err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setGoogleLoading(false);
    }
  }, [signInWithGoogle]);

  const handleAppleSignIn = useCallback(async () => {
    try {
      await signInWithApple();
    } catch (err: any) {
      if (err?.code !== 'ERR_CANCELED') {
        Alert.alert('Apple Girişi Başarısız', err instanceof Error ? err.message : 'Bir hata oluştu.');
      }
    }
  }, [signInWithApple]);

  const handleForgotPassword = useCallback(async () => {
    if (!forgotEmail.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Bu e-posta adresi sistemde kayıtlı değil.');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotEmail]);

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['rgba(232,17,26,0.2)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={IS_IOS ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.inner,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Logo area */}
              <View style={styles.logoArea}>
                <View style={styles.shieldBadge}>
                  <LinearGradient
                    colors={[colors.primary, '#C40E16']}
                    style={styles.shieldGradient}
                  >
                    <Ionicons name="shield" size={36} color="rgba(255,255,255,0.15)" style={StyleSheet.absoluteFillObject as any} />
                    <Text style={styles.shieldGsText}>GS</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.title}>
                  <Text style={styles.titleGs}>GS Tribün</Text>
                  {"'e\nHoş Geldin"}
                </Text>
                <Text style={styles.subtitle}>Galatasaray taraftar deneyimini yaşa</Text>
              </View>

              {/* Form card */}
              <View style={styles.formCard}>
                {/* Email / Username */}
                <View style={styles.fieldGroup}>
                  <View style={[styles.inputWrapper, errors.emailOrUsername ? styles.inputError : null]}>
                    <Ionicons name="person-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="E-posta veya kullanıcı adı"
                      placeholderTextColor={colors.mutedText}
                      value={emailOrUsername}
                      onChangeText={(t) => { setEmailOrUsername(t); setErrors((e) => ({ ...e, emailOrUsername: undefined })); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.emailOrUsername && (
                    <View style={styles.errorRow}>
                      <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
                      <Text style={styles.errorText}>{errors.emailOrUsername}</Text>
                    </View>
                  )}
                </View>

                {/* Password */}
                <View style={styles.fieldGroup}>
                  <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Şifre"
                      placeholderTextColor={colors.mutedText}
                      value={password}
                      onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton} hitSlop={8}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
                    </Pressable>
                  </View>
                  {errors.password && (
                    <View style={styles.errorRow}>
                      <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
                      <Text style={styles.errorText}>{errors.password}</Text>
                    </View>
                  )}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.primary, '#C40E16']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Giriş Yap</Text>
                        <Ionicons name="arrow-forward" size={18} color={colors.white} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Forgot Password Link */}
                {!showForgot && (
                  <TouchableOpacity onPress={() => setShowForgot(true)} hitSlop={8} style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>Şifremi unuttum</Text>
                  </TouchableOpacity>
                )}

                {/* Forgot Password Inline Form */}
                {showForgot && (
                  <View style={styles.forgotBox}>
                    {forgotSent ? (
                      <>
                        <Text style={styles.forgotSentText}>
                          E-posta adresinize sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.
                        </Text>
                        <TouchableOpacity onPress={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }} hitSlop={8}>
                          <Text style={styles.forgotBackText}>← Geri dön</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.forgotLabel}>Şifre sıfırlama için e-postanı gir:</Text>
                        <TextInput
                          style={styles.forgotInput}
                          placeholder="ornek@email.com"
                          placeholderTextColor={colors.mutedText}
                          value={forgotEmail}
                          onChangeText={setForgotEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          autoCorrect={false}
                        />
                        <View style={styles.forgotActions}>
                          <TouchableOpacity onPress={() => setShowForgot(false)} hitSlop={8}>
                            <Text style={styles.forgotBackText}>İptal</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.forgotSubmitBtn, forgotLoading && { opacity: 0.6 }]}
                            onPress={handleForgotPassword}
                            disabled={forgotLoading}
                          >
                            {forgotLoading
                              ? <ActivityIndicator color={colors.white} size="small" />
                              : <Text style={styles.forgotSubmitText}>Gönder</Text>
                            }
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                )}

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>veya</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-In */}
                <TouchableOpacity
                  style={[styles.socialButton, googleLoading && styles.buttonDisabled]}
                  onPress={handleGoogleSignIn}
                  disabled={googleLoading}
                  activeOpacity={0.8}
                >
                  {googleLoading ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={18} color="#EA4335" />
                      <Text style={styles.socialButtonText}>Google ile Devam Et</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Apple Sign-In (iOS only) */}
                {IS_IOS && (
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={radii.lg}
                    style={styles.appleButton}
                    onPress={handleAppleSignIn}
                  />
                )}
              </View>

              {/* Register Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Hesabın yok mu? </Text>
                <TouchableOpacity onPress={onNavigateRegister} hitSlop={8}>
                  <Text style={styles.footerLink}>Kayıt Ol</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  inner: {
    flex: 1,
  },

  // Logo area
  logoArea: {
    alignItems: 'center',
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  shieldBadge: {
    marginBottom: spacing.sm,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },
  shieldGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldGsText: {
    fontSize: 26,
    fontFamily: typography.extraBold,
    color: colors.white,
    letterSpacing: 2,
  },
  title: {
    fontSize: fontSizes.xxl ?? 26,
    fontFamily: typography.bold,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 34,
  },
  titleGs: {
    color: colors.accent,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },

  // Form card
  formCard: {
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  fieldGroup: {
    gap: spacing.xs / 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    height: 54,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
    backgroundColor: 'rgba(232,17,26,0.05)',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    height: '100%',
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },

  // Buttons
  primaryButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  primaryButtonGradient: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 54,
  },
  socialButtonText: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
  },
  appleButton: {
    width: '100%',
    height: 54,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  footerText: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  footerLink: {
    color: colors.accent,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },

  // Forgot password
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    textDecorationLine: 'underline',
  },
  forgotBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  forgotLabel: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    marginBottom: 4,
  },
  forgotInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  forgotActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  forgotBackText: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  forgotSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  forgotSubmitText: {
    color: colors.white,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  forgotSentText: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default LoginScreen;
