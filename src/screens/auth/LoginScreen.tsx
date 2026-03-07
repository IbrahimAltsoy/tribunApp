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
  Dimensions,
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
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

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!emailOrUsername.trim()) e.emailOrUsername = 'E-posta veya kullanıcı adı gerekli.';
    if (!password) e.password = 'Şifre gerekli.';
    setErrors(e);
    return Object.keys(e).length === 0;
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
    if (!forgotEmail.trim()) { Alert.alert('Hata', 'E-posta adresinizi girin.'); return; }
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Bu e-posta sistemde kayıtlı değil.');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotEmail]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Background */}
      <LinearGradient
        colors={['rgba(200,15,25,0.18)', 'rgba(10,10,10,0)', 'rgba(10,10,10,0)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView behavior={IS_IOS ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ── */}
          <Animated.View style={[styles.hero, { opacity: heroAnim }]}>
            <View style={styles.brandRow}>
              <View style={styles.flameBadge}>
                <LinearGradient colors={[colors.primary, '#900010']} style={styles.flameGrad}>
                  <Ionicons name="flame" size={28} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.brandName}>GS Tribün</Text>
            </View>
            <Text style={styles.heroTitle}>Hoş Geldin</Text>
            <Text style={styles.heroSub}>Galatasaray taraftar deneyimini yaşa</Text>
          </Animated.View>

          {/* ── Form ── */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <View style={[styles.inputRow, errors.emailOrUsername ? styles.inputErr : null]}>
                <Ionicons name="person-outline" size={17} color={errors.emailOrUsername ? colors.error : '#666'} style={styles.inputIco} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta veya kullanıcı adı"
                  placeholderTextColor="#555"
                  value={emailOrUsername}
                  onChangeText={t => { setEmailOrUsername(t); setErrors(e => ({ ...e, emailOrUsername: undefined })); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
              {errors.emailOrUsername ? <Text style={styles.errText}>{errors.emailOrUsername}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <View style={[styles.inputRow, errors.password ? styles.inputErr : null]}>
                <Ionicons name="lock-closed-outline" size={17} color={errors.password ? colors.error : '#666'} style={styles.inputIco} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={10}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={17} color="#555" />
                </Pressable>
              </View>
              {errors.password ? <Text style={styles.errText}>{errors.password}</Text> : null}
            </View>

            {/* Forgot password */}
            {!showForgot ? (
              <TouchableOpacity onPress={() => setShowForgot(true)} hitSlop={8} style={styles.forgotLink}>
                <Text style={styles.forgotLinkText}>Şifremi unuttum</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.forgotBox}>
                {forgotSent ? (
                  <>
                    <Text style={styles.forgotSentText}>Sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.</Text>
                    <TouchableOpacity onPress={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }} hitSlop={8}>
                      <Text style={styles.forgotBack}>← Geri dön</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.forgotLabel}>Şifre sıfırlamak için e-postanı gir:</Text>
                    <TextInput
                      style={styles.forgotInput}
                      placeholder="ornek@email.com"
                      placeholderTextColor="#555"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <View style={styles.forgotActions}>
                      <TouchableOpacity onPress={() => setShowForgot(false)} hitSlop={8}>
                        <Text style={styles.forgotBack}>İptal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.forgotSendBtn, forgotLoading && { opacity: 0.6 }]}
                        onPress={handleForgotPassword}
                        disabled={forgotLoading}
                      >
                        {forgotLoading
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Text style={styles.forgotSendText}>Gönder</Text>}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primary, '#A00010']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.loginBtnGrad}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <><Text style={styles.loginBtnText}>Giriş Yap</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>veya</Text>
              <View style={styles.divLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={[styles.socialBtn, googleLoading && { opacity: 0.6 }]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
              activeOpacity={0.8}
            >
              {googleLoading
                ? <ActivityIndicator color={colors.text} size="small" />
                : <><Ionicons name="logo-google" size={18} color="#EA4335" /><Text style={styles.socialBtnText}>Google ile Devam Et</Text></>
              }
            </TouchableOpacity>

            {/* Apple */}
            {IS_IOS && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={radii.lg}
                style={styles.appleBtn}
                onPress={handleAppleSignIn}
              />
            )}
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu? </Text>
            <TouchableOpacity onPress={onNavigateRegister} hitSlop={8}>
              <Text style={styles.footerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    minHeight: SCREEN_HEIGHT * 0.88,
    justifyContent: 'center',
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  flameBadge: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  flameGrad: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 28,
    fontFamily: typography.extraBold ?? typography.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: (fontSizes.xxl ?? 26) + 6,
    fontFamily: typography.bold,
    color: colors.white,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: '#888',
    textAlign: 'center',
  },

  // Fields
  fieldWrap: {
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: spacing.md,
    height: 54,
  },
  inputErr: {
    borderColor: colors.error,
    backgroundColor: 'rgba(220,30,40,0.07)',
  },
  inputIco: { marginRight: spacing.sm },
  input: {
    flex: 1,
    color: colors.white,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    height: '100%',
  },
  errText: {
    color: colors.error,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    marginTop: 5,
    marginLeft: spacing.xs,
  },

  // Forgot
  forgotLink: { alignSelf: 'flex-end', marginBottom: spacing.md },
  forgotLinkText: {
    color: '#666',
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    textDecorationLine: 'underline',
  },
  forgotBox: {
    backgroundColor: '#141414',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  forgotLabel: { color: '#888', fontFamily: typography.medium, fontSize: fontSizes.sm },
  forgotInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.white,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  forgotActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotBack: { color: '#666', fontFamily: typography.medium, fontSize: fontSizes.sm },
  forgotSendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  forgotSendText: { color: '#fff', fontFamily: typography.semiBold, fontSize: fontSizes.sm },
  forgotSentText: { color: '#888', fontFamily: typography.medium, fontSize: fontSizes.sm, lineHeight: 20 },

  // Login button
  loginBtn: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  loginBtnGrad: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loginBtnText: {
    color: '#fff',
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    letterSpacing: 0.3,
  },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  divLine: { flex: 1, height: 1, backgroundColor: '#222' },
  divText: { color: '#555', fontFamily: typography.medium, fontSize: fontSizes.xs },

  // Social
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#181818',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    height: 54,
    marginBottom: spacing.sm,
  },
  socialBtnText: { color: colors.text, fontFamily: typography.medium, fontSize: fontSizes.md },
  appleBtn: { width: '100%', height: 54, marginBottom: spacing.sm },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  footerText: { color: '#666', fontFamily: typography.medium, fontSize: fontSizes.sm },
  footerLink: { color: colors.accent, fontFamily: typography.semiBold, fontSize: fontSizes.sm },
});

export default LoginScreen;
