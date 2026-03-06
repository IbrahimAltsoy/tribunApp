import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { mediaService } from "../services/mediaService";
import { colors } from "../theme/colors";
import { spacing, radii } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  // avatarObjectName: backend'e kaydedilecek objectName
  const [avatarObjectName, setAvatarObjectName] = useState<string | null>(user?.avatarUrl ?? null);
  // avatarPreviewUrl: ekranda gösterilecek signed/local URL
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mevcut avatarUrl varsa signed URL al
  React.useEffect(() => {
    const existing = user?.avatarUrl;
    if (!existing) return;
    if (existing.startsWith("http")) {
      // Tam URL — signed URL ile yenile
      const objectName = existing.replace(/^https?:\/\/[^/]+\/[^/]+\//, "");
      mediaService.getSignedUrl(objectName).then((r) => {
        if (r.success && r.url) setAvatarPreviewUrl(r.url);
      });
    } else {
      mediaService.getSignedUrl(existing).then((r) => {
        if (r.success && r.url) setAvatarPreviewUrl(r.url);
      });
    }
  }, []);

  const initials = (user?.displayName || user?.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri izni gerekiyor.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    setUploading(true);
    try {
      const uploaded = await mediaService.uploadImageAnonymous(uri);
      const objectName = (uploaded.data as any)?.objectName;
      if (uploaded.success && objectName) {
        setAvatarObjectName(objectName);
        // Signed URL ile önizle
        const signed = await mediaService.getSignedUrl(objectName);
        if (signed.success && signed.url) {
          setAvatarPreviewUrl(signed.url);
        } else {
          setAvatarPreviewUrl(uri); // fallback: local uri
        }
      } else {
        Alert.alert("Hata", "Fotoğraf yüklenemedi, tekrar dene.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarObjectName ?? undefined,
      };
      const updated = await authService.updateProfile(payload);
      updateUser(updated);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Hata", e.message || "Profil güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = uploading || saving;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn} disabled={isLoading}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <Pressable onPress={handleSave} style={styles.headerBtn} disabled={isLoading}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={styles.saveText}>Kaydet</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <Pressable onPress={handlePickImage} style={styles.avatarWrapper} disabled={isLoading}>
            {avatarPreviewUrl ? (
              <Image source={{ uri: avatarPreviewUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {/* Camera overlay */}
            <View style={styles.cameraOverlay}>
              {uploading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="camera" size={18} color={colors.white} />
              )}
            </View>
          </Pressable>
          <Text style={styles.changePhotoHint}>Fotoğrafı değiştir</Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Adın ne?"
                placeholderTextColor={colors.textTertiary}
                maxLength={50}
                editable={!isLoading}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Biyografi</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={bio}
                onChangeText={setBio}
                placeholder="Kendinden bahset..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                maxLength={160}
                editable={!isLoading}
              />
              <Text style={styles.charCount}>{bio.length}/160</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 60,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  saveText: {
    color: colors.accent,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
  content: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  avatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.xxl,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  changePhotoHint: {
    color: colors.accent,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  form: {
    width: "100%",
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: fontSizes.md,
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  charCount: {
    color: colors.textTertiary,
    fontFamily: typography.regular,
    fontSize: fontSizes.xs,
    alignSelf: "flex-end",
    marginRight: spacing.xs,
  },
});

export default ProfileEditScreen;
