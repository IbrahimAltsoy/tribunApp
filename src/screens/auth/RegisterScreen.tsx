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

const validatePassword = (p: string): string | null => {
  if (p.length < 10) return 'Şifre en az 10 karakter olmalı.';
  if (!/[a-zA-Z]/.test(p)) return 'Şifre en az bir harf içermeli.';
  if (!/[0-9]/.test(p)) return 'Şifre en az bir rakam içermeli.';
  return null;
};

type Props = { onNavigateLogin: () => void; onRegistered?: () => void };

const RegisterScreen: React.FC<Props> = ({ onNavigateLogin, onRegistered }) => {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const clearErr = (field: string) => setErrors(e => { const n = { ...e }; delete n[field]; return n; });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Kullanıcı adı gerekli.';
    else if (username.trim().length < 3) e.username = 'En az 3 karakter olmalı.';
    if (!email.trim()) e.email = 'E-posta gerekli.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Geçerli bir e-posta girin.';
    const pe = validatePassword(password);
    if (pe) e.password = pe;
    if (!confirmPassword) e.confirmPassword = 'Şifre tekrarı gerekli.';
    else if (password !== confirmPassword) e.confirmPassword = 'Şifreler eşleşmiyor.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password, confirmPassword, displayName.trim() || undefined);
      setRegisteredEmail(email.trim());
      setEmailSent(true);
    } catch (err) {
      Alert.alert('Kayıt Başarısız', err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [register, username, email, password, confirmPassword, displayName]);

  if (emailSent) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <LinearGradient
          colors={['rgba(200,15,25,0.15)', 'rgba(10,10,10,0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.sentContainer}>
          <View style={styles.sentIconWrap}>
            <LinearGradient colors={[colors.primary, '#900010']} style={styles.sentIconGrad}>
              <Ionicons name="mail" size={36} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.sentTitle}>E-posta Gönderildi!</Text>
          <Text style={styles.sentText}>
            <Text style={styles.sentEmail}>{registeredEmail}</Text>
            {' '}adresine doğrulama bağlantısı gönderildi.{'\n\n'}
            Bağlantıya tıklayarak hesabınızı doğrulayın, ardından giriş yapın.
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={onRegistered ?? onNavigateLogin} activeOpacity={0.85}>
            <LinearGradient colors={[colors.primary, '#A00010']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtnGrad}>
              <Ionicons name="home-outline" size={18} color="#fff" />
              <Text style={styles.loginBtnText}>Ana Sayfaya Dön</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginBtnSecondary} onPress={onNavigateLogin} activeOpacity={0.85}>
            <Text style={styles.loginBtnSecondaryText}>Giriş Yap</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['rgba(200,15,25,0.15)', 'rgba(10,10,10,0)', 'rgba(10,10,10,0)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={onNavigateLogin} style={styles.backBtn} hitSlop={8}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.headerTitle}>Hesap Oluştur</Text>
              <Text style={styles.headerSub}>
                <Text style={styles.headerSubAccent}>GS Tribün </Text>
                topluluğuna katıl
              </Text>
            </View>

            {/* Username */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Kullanıcı Adı *</Text>
              <View style={[styles.inputRow, errors.username ? styles.inputErr : null]}>
                <Ionicons name="at-outline" size={17} color={errors.username ? colors.error : '#666'} style={styles.inputIco} />
                <TextInput
                  style={styles.input}
                  placeholder="kullanici_adi"
                  placeholderTextColor="#555"
                  value={username}
                  onChangeText={t => { setUsername(t); clearErr('username'); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username ? <Text style={styles.errText}>{errors.username}</Text> : null}
            </View>

            {/* Display Name */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Görünen Ad</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={17} color="#666" style={styles.inputIco} />
                <TextInput
                  style={styles.input}
                  placeholder="Adın (opsiyonel)"
                  placeholderTextColor="#555"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>E-posta *</Text>
              <View style={[styles.inputRow, errors.email ? styles.inputErr : null]}>
                <Ionicons name="mail-outline" size={17} color={errors.email ? colors.error : '#666'} style={styles.inputIco} />
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor="#555"
                  value={email}
                  onChangeText={t => { setEmail(t); clearErr('email'); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? <Text style={styles.errText}>{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Şifre *</Text>
              <View style={[styles.inputRow, errors.password ? styles.inputErr : null]}>
                <Ionicons name="lock-closed-outline" size={17} color={errors.password ? colors.error : '#666'} style={styles.inputIco} />
                <TextInput
                  style={styles.input}
                  placeholder="En az 10 karakter, harf ve rakam"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={t => { setPassword(t); clearErr('password'); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={10}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={17} color="#555" />
                </Pressable>
              </View>
              {errors.password
                ? <Text style={styles.errText}>{errors.password}</Text>
                : <Text style={styles.hint}>Min 10 karakter, en az 1 harf ve 1 rakam</Text>
              }
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Şifre Tekrar *</Text>
              <View style={[styles.inputRow, errors.confirmPassword ? styles.inputErr : null]}>
                <Ionicons name="lock-closed-outline" size={17} color={errors.confirmPassword ? colors.error : '#666'} style={styles.inputIco} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreyi tekrar girin"
                  placeholderTextColor="#555"
                  value={confirmPassword}
                  onChangeText={t => { setConfirmPassword(t); clearErr('confirmPassword'); }}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowConfirm(v => !v)} hitSlop={10}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={17} color="#555" />
                </Pressable>
              </View>
              {errors.confirmPassword ? <Text style={styles.errText}>{errors.confirmPassword}</Text> : null}
            </View>

            {/* Register button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[colors.primary, '#A00010']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtnGrad}>
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <><Text style={styles.loginBtnText}>Kayıt Ol</Text><Ionicons name="checkmark" size={18} color="#fff" /></>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
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
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

  // Email sent
  sentContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  sentIconWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14 },
      android: { elevation: 10 },
    }),
  },
  sentIconGrad: { width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sentTitle: { color: colors.white, fontFamily: typography.bold, fontSize: (fontSizes.xxl ?? 26), textAlign: 'center' },
  sentText: { color: '#888', fontFamily: typography.medium, fontSize: fontSizes.md, textAlign: 'center', lineHeight: 22 },
  sentEmail: { color: colors.accent, fontFamily: typography.semiBold },

  // Header
  header: { paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xs },
  backBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#181818', borderRadius: radii.md, borderWidth: 1, borderColor: '#2A2A2A',
    marginBottom: spacing.sm,
  },
  headerTitle: { color: colors.white, fontFamily: typography.bold, fontSize: (fontSizes.xxl ?? 26) },
  headerSub: { color: '#888', fontFamily: typography.medium, fontSize: fontSizes.md },
  headerSubAccent: { color: colors.accent, fontFamily: typography.semiBold },

  // Fields
  fieldWrap: { marginBottom: spacing.md },
  label: { color: '#666', fontFamily: typography.medium, fontSize: fontSizes.xs, marginBottom: 6, letterSpacing: 0.3 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#181818', borderRadius: radii.lg,
    borderWidth: 1, borderColor: '#2A2A2A',
    paddingHorizontal: spacing.md, height: 54,
  },
  inputErr: { borderColor: colors.error, backgroundColor: 'rgba(220,30,40,0.07)' },
  inputIco: { marginRight: spacing.sm },
  input: { flex: 1, color: colors.white, fontFamily: typography.medium, fontSize: fontSizes.md, height: '100%' },
  errText: { color: colors.error, fontFamily: typography.medium, fontSize: fontSizes.xs, marginTop: 5, marginLeft: spacing.xs },
  hint: { color: '#555', fontFamily: typography.medium, fontSize: fontSizes.xs, marginTop: 5, marginLeft: spacing.xs },

  // Button
  loginBtn: {
    borderRadius: radii.lg, overflow: 'hidden', marginTop: spacing.sm,
    ...Platform.select({
      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  loginBtnGrad: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loginBtnText: { color: '#fff', fontFamily: typography.semiBold, fontSize: fontSizes.md, letterSpacing: 0.3 },
  loginBtnSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm, marginTop: spacing.xs },
  loginBtnSecondaryText: { color: colors.accent, fontFamily: typography.semiBold, fontSize: fontSizes.sm },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  footerText: { color: '#666', fontFamily: typography.medium, fontSize: fontSizes.sm },
  footerLink: { color: colors.accent, fontFamily: typography.semiBold, fontSize: fontSizes.sm },
});

export default RegisterScreen;
