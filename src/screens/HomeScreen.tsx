import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { mediaService } from "../services/mediaService";
import { newsService } from "../services/newsService";
import Header from "../components/Header";
import SectionHeader from "../components/home/SectionHeader";
import NewsCard from "../components/home/NewsCard";
import FixtureList from "../components/home/FixtureList";
import LiveTicker from "../components/home/LiveTicker";
import PollCard from "../components/home/PollCard";
import FanMomentsSection from "../components/home/FanMomentsSection";
import ShareMomentModal from "../components/home/ShareMomentModal";
import MomentDetailModal from "../components/home/MomentDetailModal";
import AllMomentsModal from "../components/home/AllMomentsModal";
import AllVideosModal from "../components/home/AllVideosModal";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { BottomTabParamList } from "../navigation/BottomTabs";
import { useShareMomentForm } from "../hooks/useShareMomentForm";
import { openURLSafely } from "../utils/urlValidator";
import { EXTERNAL_LINKS } from "../constants/app";
import { fanMomentService } from "../services/fanMomentService";
import { pollService } from "../services/pollService";
import type { PollDto } from "../types/poll";
import type { FanMomentDto } from "../types/fanMoment";
import type { NewsDto } from "../types/news";

const storeImage = require("../assets/footboll/1.jpg");

const HomeScreen: React.FC = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { t, i18n } = useTranslation();

  const [news, setNews] = useState<NewsDto[]>([]);
  const [moments, setMoments] = useState<FanMomentDto[]>([]);
  const [activePoll, setActivePoll] = useState<PollDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [allMomentsVisible, setAllMomentsVisible] = useState(false);
  const [allVideosVisible, setAllVideosVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<
    FanMomentDto | undefined
  >(undefined);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [momentToEdit, setMomentToEdit] = useState<FanMomentDto | undefined>(
    undefined
  );
  const [editCaption, setEditCaption] = useState("");
  const [editImage, setEditImage] = useState<string | undefined>(undefined);

  const {
    visible: shareModalVisible,
    open: openShareModal,
    close: closeShareModal,
    city: newCity,
    caption: newCaption,
    setCity: setNewCity,
    setCaption: setNewCaption,
    submit,
  } = useShareMomentForm();

  // Backend'den News yükle
  useEffect(() => {
    const loadNews = async () => {
      const response = await newsService.getLatestNews(5);
      if (response.success && response.data) {
        setNews(response.data);
      } else {
        setNews([]);
      }
    };
    loadNews();
  }, []);

  // Backend'den FanMoments yüklee
  useEffect(() => {
    const loadMoments = async () => {
      const response = await fanMomentService.getFanMoments(1, 10, "Approved");
      if (response.success && response.data) {
        setMoments(response.data);
      } else {
        setMoments([]);
      }
    };
    loadMoments();
  }, []);

  // Backend'den Poll yükle (dil değişikliğinde yeniden yükle)
  useEffect(() => {
    const loadPoll = async () => {
      const currentLanguage = i18n.language;
      pollService.setLanguage(currentLanguage);
      const response = await pollService.getActivePoll();

      if (response.success && response.data) {
        setActivePoll(response.data);
      } else {
        setActivePoll(null);
      }
    };
    loadPoll();
  }, [i18n.language]);

  const momentList = useMemo(() => moments, [moments]);

  const handleOpenDetail = useCallback((moment: FanMomentDto) => {
    setSelectedMoment(moment);
    setDetailModalVisible(true);
  }, []);

  const handleAddMoment = useCallback(
    async (imageUri?: string) => {
      const newMoment = await submit(imageUri);
      if (!newMoment) return;

      // Ensure new moment has isOwnMoment flag set to true
      const momentWithFlag: FanMomentDto = {
        ...newMoment,
        isOwnMoment: true,
      };

      setMoments((prev) => [momentWithFlag, ...prev]);
    },
    [submit]
  );

  const handleNewsPress = useCallback(
    (id: string) => {
      navigation.navigate("Feed", { newsId: id, origin: "Home" });
    },
    [navigation]
  );

  const handleLanguagePress = useCallback(() => {
    setLanguageModalVisible(true);
  }, []);

  const handleStorePress = useCallback(() => {
    openURLSafely(EXTERNAL_LINKS.STORE, {
      errorTitle: t("error"),
    });
  }, [t]);

  const handleEditMoment = useCallback((moment: FanMomentDto) => {
    setMomentToEdit(moment);
    setEditCaption(moment.description || "");
    setEditImage(moment.imageUrl);
    setEditModalVisible(true);
  }, []);

  // Pick image for edit
  const pickEditImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(t("shareMoment.galleryPermissionMessage"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditImage(result.assets[0].uri);
    }
  }, [t]);

  // Take photo for edit
  const takeEditPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert(t("shareMoment.cameraPermissionMessage"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditImage(result.assets[0].uri);
    }
  }, [t]);

  const handleDeleteMoment = useCallback(
    async (moment: FanMomentDto) => {
      try {
        const response = await fanMomentService.deleteOwnFanMoment(moment.id);
        if (response.success) {
          setMoments((prev) => prev.filter((m) => m.id !== moment.id));
        } else {
          alert(t("home.deleteFailed"));
        }
      } catch (error) {
        alert(t("home.deleteFailed"));
      }
    },
    [t]
  );

  const handleSaveEdit = useCallback(async () => {
    if (!momentToEdit) return;

    try {
      // Upload new image if changed
      let uploadedImageUrl: string | undefined = editImage;

      // Check if image was changed (editImage is different from original)
      if (
        editImage &&
        editImage !== momentToEdit.imageUrl &&
        editImage.startsWith("file://")
      ) {
        console.log("📤 Uploading new image for edit...");
        const uploadResponse =
          await mediaService.uploadImageAnonymous(editImage);

        if (uploadResponse.success && uploadResponse.data?.url) {
          uploadedImageUrl = uploadResponse.data.url;
          console.log("✅ New image uploaded:", uploadedImageUrl);
        } else {
          console.warn("⚠️ Image upload failed:", uploadResponse.error);
          alert(t("home.imageUploadFailed") || "Image upload failed");
          return;
        }
      }

      const response = await fanMomentService.updateOwnFanMoment(
        momentToEdit.id,
        {
          caption: editCaption,
          imageUrl: uploadedImageUrl,
        }
      );

      if (response.success && response.data) {
        // Ensure isOwnMoment flag is preserved after updat
        const updatedMoment: FanMomentDto = {
          ...response.data,
          isOwnMoment: true,
        };

        setMoments((prev) =>
          prev.map((m) => (m.id === momentToEdit.id ? updatedMoment : m))
        );

        setEditModalVisible(false);
        setMomentToEdit(undefined);
        setEditCaption("");
        setEditImage(undefined);
      } else {
        alert(t("home.updateFailed"));
      }
    } catch (error) {
      alert(t("home.updateFailed"));
    }
  }, [momentToEdit, editCaption, editImage, t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header onPressLanguage={handleLanguagePress} />

        <SectionHeader title={t("home.momentsTitle")} />
        <FanMomentsSection
          moments={momentList}
          onPressAdd={openShareModal}
          onPressMore={() => setAllMomentsVisible(true)}
          onSelectMoment={handleOpenDetail}
          onEditMoment={handleEditMoment}
          onDeleteMoment={handleDeleteMoment}
        />

        <SectionHeader
          title={t("home.newsTitle")}
          subtitle={t("home.newsSubtitle")}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newsRow}
        >
          {news.map((newsItem) => (
            <NewsCard
              key={newsItem.id}
              item={newsItem}
              onPress={handleNewsPress}
            />
          ))}
        </ScrollView>

        <SectionHeader
          title={t("fixture.liveTickerTitle")}
          subtitle={t("fixture.liveTickerSubtitle")}
        />
        <LiveTicker onPressMore={() => setAllVideosVisible(true)} />
        <SectionHeader
          title={t("home.poll.title")}
          subtitle={t("home.poll.weekMatch")}
        />
        {activePoll && (
          <PollCard
            poll={activePoll}
            onVoteSuccess={(updatedPoll) => setActivePoll(updatedPoll)}
          />
        )}

        <SectionHeader
          title={t("home.supportTitle")}
          subtitle={t("home.supportSubtitle")}
        />
        <Pressable
          onPress={handleStorePress}
          style={({ pressed }) => [
            styles.supportCard,
            pressed && styles.supportCardPressed,
          ]}
          accessibilityRole="button"
        >
          <ImageBackground
            source={storeImage}
            style={styles.supportImage}
            imageStyle={styles.supportImageStyle}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
              style={StyleSheet.absoluteFill}
            />
            <BlurView
              intensity={Platform.OS === "ios" ? 30 : 22}
              tint="dark"
              style={styles.supportContent}
            >
              <View style={styles.supportPillWrapper}>
                <Ionicons name="storefront" size={14} color={colors.primary} />
                <Text style={styles.supportPill}>{t("home.supportPill")}</Text>
              </View>
              <Text style={styles.supportTitle}>{t("home.supportStore")}</Text>
              <Text style={styles.supportSubtitle}>
                {t("home.supportSubtitle")}
              </Text>
              <View style={styles.supportArrowCircle}>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </View>
            </BlurView>
          </ImageBackground>
        </Pressable>
      </ScrollView>

      {/* PAYLAŞ / DETAY / TÜM ANLAR MODALLARI (ESKİ HALİYLE) */}
      <ShareMomentModal
        visible={shareModalVisible}
        newCity={newCity}
        newCaption={newCaption}
        onChangeCity={setNewCity}
        onChangeCaption={setNewCaption}
        onSubmit={handleAddMoment}
        onClose={closeShareModal}
      />

      <MomentDetailModal
        visible={detailModalVisible}
        moment={selectedMoment}
        onClose={() => setDetailModalVisible(false)}
      />

      <AllMomentsModal
        visible={allMomentsVisible}
        moments={momentList}
        onClose={() => setAllMomentsVisible(false)}
        onSelect={(moment) => {
          setSelectedMoment(moment);
          setAllMomentsVisible(false);
          setDetailModalVisible(true);
        }}
      />

      <AllVideosModal
        visible={allVideosVisible}
        onClose={() => setAllVideosVisible(false)}
      />

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <BlurView intensity={65} tint="dark" style={styles.modalOverlay}>
          <View style={styles.languageModal}>
            <View style={styles.languageHeaderRow}>
              <View style={styles.languageIconCircle}>
                <Ionicons name="globe-outline" size={20} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.languageTitle}>{t("change_language")}</Text>
                <Text style={styles.languageSubtitle}>{t("greeting")}</Text>
              </View>
            </View>

            <LanguageSwitcher onClose={() => setLanguageModalVisible(false)} />
          </View>
        </BlurView>
      </Modal>

      {/* Edit Moment Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setEditModalVisible(false);
          setMomentToEdit(undefined);
          setEditCaption("");
          setEditImage(undefined);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <BlurView intensity={65} tint="dark" style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
            >
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.editModal}>
                  <View style={styles.editHeaderRow}>
                    <View style={styles.editIconCircle}>
                      <Ionicons
                        name="pencil"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.editTitle}>
                        {t("home.editMoment")}
                      </Text>
                      <Text style={styles.editSubtitle}>
                        {t("home.editMomentSubtitle")}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        Keyboard.dismiss();
                        setEditModalVisible(false);
                        setMomentToEdit(undefined);
                        setEditCaption("");
                        setEditImage(undefined);
                      }}
                      style={({ pressed }) => [
                        styles.closeButton,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </Pressable>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ gap: spacing.md }}
                  >
                    <View style={styles.editInputContainer}>
                      <Text style={styles.editLabel}>{t("home.caption")}</Text>
                      <TextInput
                        style={styles.editInput}
                        value={editCaption}
                        onChangeText={setEditCaption}
                        placeholder={t("home.enterCaption")}
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        maxLength={200}
                      />
                      <Text style={styles.editCharCount}>
                        {editCaption.length}/200
                      </Text>
                    </View>

                    {/* Image Section */}
                    <View>
                      <Text style={styles.editLabel}>
                        {t("shareMoment.addPhoto")} ({t("shareMoment.optional")}
                        )
                      </Text>

                      {editImage ? (
                        <View style={styles.editImagePreview}>
                          <Image
                            source={{ uri: editImage }}
                            style={styles.editPreviewImage}
                            resizeMode="cover"
                          />
                          <Pressable
                            style={styles.editRemoveImage}
                            onPress={() => setEditImage(undefined)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={28}
                              color={colors.error}
                            />
                          </Pressable>
                          <Pressable
                            style={styles.editChangeImage}
                            onPress={() => {
                              Alert.alert(
                                t("shareMoment.selectImageSource"),
                                "",
                                [
                                  {
                                    text: t("shareMoment.camera"),
                                    onPress: takeEditPhoto,
                                  },
                                  {
                                    text: t("shareMoment.gallery"),
                                    onPress: pickEditImage,
                                  },
                                  { text: t("cancel"), style: "cancel" },
                                ]
                              );
                            }}
                          >
                            <Ionicons
                              name="camera"
                              size={20}
                              color={colors.white}
                            />
                            <Text style={styles.editChangeImageText}>
                              {t("shareMoment.changePhoto")}
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          style={styles.editImagePicker}
                          onPress={() => {
                            Alert.alert(
                              t("shareMoment.selectImageSource"),
                              "",
                              [
                                {
                                  text: t("shareMoment.camera"),
                                  onPress: takeEditPhoto,
                                },
                                {
                                  text: t("shareMoment.gallery"),
                                  onPress: pickEditImage,
                                },
                                { text: t("cancel"), style: "cancel" },
                              ]
                            );
                          }}
                        >
                          <Ionicons
                            name="camera-outline"
                            size={32}
                            color={colors.primary}
                          />
                          <Text style={styles.editImagePickerText}>
                            {t("shareMoment.selectPhoto")}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </ScrollView>

                  <View style={styles.editActions}>
                    <Pressable
                      onPress={() => {
                        Keyboard.dismiss();
                        setEditModalVisible(false);
                        setMomentToEdit(undefined);
                        setEditCaption("");
                        setEditImage(undefined);
                      }}
                      style={({ pressed }) => [
                        styles.editCancelButton,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.editCancelText}>
                        {t("home.cancel")}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Keyboard.dismiss();
                        handleSaveEdit();
                      }}
                      style={({ pressed }) => [
                        styles.editSaveButton,
                        pressed && {
                          opacity: 0.8,
                          transform: [{ scale: 0.98 }],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={["#0FA958", "#12C26A"]}
                        style={styles.editSaveGradient}
                      >
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.white}
                        />
                        <Text style={styles.editSaveText}>
                          {t("home.save")}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};;;;;;;;;;;;;;;;;;;;;;;;;;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  newsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  supportCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  supportCardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  supportImage: {
    height: 180,
    justifyContent: "flex-end",
  },
  supportImageStyle: {
    borderRadius: 20,
  },
  supportContent: {
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
    overflow: "hidden",
  },
  supportPillWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: "rgba(0, 191, 71, 0.2)",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  supportPill: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  supportTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.xl,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  supportSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  supportArrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // -------- Dil Modalı (yeni tasarım) --------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  languageModal: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(10,10,10,0.96)",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  languageHeaderRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  languageIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  languageTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
    marginBottom: spacing.xs / 2,
  },
  languageSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },

  // -------- Edit Modal Styles --------
  editModal: {
    width: "100%",
    maxHeight: "85%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(10,10,10,0.98)",
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg,
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  editHeaderRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  editIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 169, 88, 0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
    marginBottom: spacing.xs / 2,
  },
  editSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  editInputContainer: {
    gap: spacing.sm,
  },
  editLabel: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  editInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: fontSizes.md,
    minHeight: 100,
    textAlignVertical: "top",
  },
  editCharCount: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    textAlign: "right",
  },
  editActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  editCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  editCancelText: {
    color: colors.textSecondary,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  editSaveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  editSaveGradient: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  editSaveText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
  editImagePreview: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  editPreviewImage: {
    width: "100%",
    height: 180,
  },
  editRemoveImage: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 14,
  },
  editChangeImage: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  editChangeImageText: {
    color: colors.white,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  editImagePicker: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 120,
  },
  editImagePickerText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
  },
});

export default HomeScreen;
