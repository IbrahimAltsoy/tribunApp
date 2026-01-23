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
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { mediaService } from "../services/mediaService";
import Header from "../components/Header";
import PollCard from "../components/home/PollCard";
import FanMomentsSection from "../components/home/FanMomentsSection";
import ShareMomentModal from "../components/home/ShareMomentModal";
import MomentDetailModal from "../components/home/MomentDetailModal";
import AllMomentsModal from "../components/home/AllMomentsModal";
import LanguageSwitcher from "../components/LanguageSwitcher";
import NotificationList from "../components/NotificationList";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { useShareMomentForm } from "../hooks/useShareMomentForm";
import { useShareMoment } from "../hooks/useShareMoment";
import ShareableMomentCard from "../components/home/ShareableMomentCard";
import { openURLSafely } from "../utils/urlValidator";
import { EXTERNAL_LINKS } from "../constants/app";
import { fanMomentService } from "../services/fanMomentService";
import { pollService } from "../services/pollService";
import { notificationService } from "../services/notificationService";
import { logger } from "../utils/logger";
import { initializeSession, UserSession } from "../utils/sessionManager";
import type { PollDto } from "../types/poll";
import type { FanMomentDto } from "../types/fanMoment";

const storeImage = require("../assets/footboll/1.jpg");

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [session, setSession] = useState<UserSession | null>(null);
  const [moments, setMoments] = useState<FanMomentDto[]>([]);
  const [activePoll, setActivePoll] = useState<PollDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [allMomentsVisible, setAllMomentsVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [selectedMoment, setSelectedMoment] = useState<
    FanMomentDto | undefined
  >(undefined);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [momentToEdit, setMomentToEdit] = useState<FanMomentDto | undefined>(
    undefined
  );
  const [editCaption, setEditCaption] = useState("");
  const [editImage, setEditImage] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

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

  // Share moment hook
  const {
    shareCardRef,
    momentToShare,
    isSharing,
    shareMoment,
  } = useShareMoment();

  // Initialize session on mount
  useEffect(() => {
    const loadSession = async () => {
      const userSession = await initializeSession();
      setSession(userSession);
    };
    loadSession();
  }, []);

  // Load all data function (used for initial load and refresh)
  const loadAllData = useCallback(async () => {
    // Load moments
    const momentsResponse = await fanMomentService.getFanMoments(1, 10, "Approved");
    if (momentsResponse.success && momentsResponse.data) {
      setMoments(momentsResponse.data);
    } else {
      setMoments([]);
    }

    // Load poll
    const pollResponse = await pollService.getActivePoll();
    if (pollResponse.success && pollResponse.data) {
      setActivePoll(pollResponse.data);
    } else {
      setActivePoll(null);
    }

    // Load notification count
    try {
      const notifResponse = await notificationService.getNotifications({
        unreadOnly: true,
        page: 1,
        pageSize: 1,
      });
      if (notifResponse.success) {
        setUnreadNotificationCount(notifResponse.unreadCount || 0);
        await notificationService.setBadgeCount(notifResponse.unreadCount || 0);
      }
    } catch (error) {
      logger.error('Failed to load notification count:', error);
    }
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadAllData(),
      new Promise(resolve => setTimeout(resolve, 800))
    ]);
    setRefreshing(false);
  }, [loadAllData]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Reload poll when language changes
  useEffect(() => {
    const loadPoll = async () => {
      const response = await pollService.getActivePoll();
      if (response.success && response.data) {
        setActivePoll(response.data);
      } else {
        setActivePoll(null);
      }
    };
    loadPoll();
  }, [i18n.language]);

  // Auto-refresh notification count every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await notificationService.getNotifications({
          unreadOnly: true,
          page: 1,
          pageSize: 1,
        });
        if (response.success) {
          setUnreadNotificationCount(response.unreadCount || 0);
          await notificationService.setBadgeCount(response.unreadCount || 0);
        }
      } catch (error) {
        logger.error('Failed to refresh notification count:', error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleLanguagePress = useCallback(() => {
    setLanguageModalVisible(true);
  }, []);

  const handleNotificationPress = useCallback(() => {
    setNotificationModalVisible(true);
  }, []);

  const handleNotificationModalClose = useCallback(async () => {
    setNotificationModalVisible(false);

    // Refresh notification count when modal closes
    try {
      const response = await notificationService.getNotifications({
        unreadOnly: true,
        page: 1,
        pageSize: 1,
      });

      if (response.success) {
        setUnreadNotificationCount(response.unreadCount || 0);
        await notificationService.setBadgeCount(response.unreadCount || 0);
      }
    } catch (error) {
      logger.error('Failed to refresh notification count:', error);
    }
  }, []);

  const handleStorePress = useCallback(() => {
    openURLSafely(EXTERNAL_LINKS.STORE, {
      errorTitle: t("error"),
    });
  }, [t]);

  const smartSlot = (
    <View style={styles.smartSlot}>
      {activePoll && (
        <>
          <PollCard
            poll={activePoll}
            onVoteSuccess={(updatedPoll) => setActivePoll(updatedPoll)}
          />
        </>
      )}
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
          {Platform.OS === "ios" ? (
            <View style={styles.supportContentIOS}>
              <View style={styles.supportPillWrapper}>
                <Ionicons name="storefront" size={14} color={colors.primary} />
                <Text style={styles.supportPill}>{t("home.supportPill")}</Text>
              </View>
              <Text
                style={styles.supportTitleIOS}
                allowFontScaling={false}
                numberOfLines={1}
              >
                {t("home.supportStore")}
              </Text>
              <Text style={styles.supportSubtitle}>
                {t("home.supportSubtitle")}
              </Text>
              <View style={styles.supportArrowCircle}>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </View>
            </View>
          ) : (
            <BlurView
              intensity={22}
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
          )}
        </ImageBackground>
      </Pressable>
    </View>
  );

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
        logger.log("📤 Uploading new image for edit...");
        const uploadResponse =
          await mediaService.uploadImageAnonymous(editImage);

        if (uploadResponse.success && uploadResponse.data?.url) {
          uploadedImageUrl = uploadResponse.data.url;
          logger.log("✅ New image uploaded:", uploadedImageUrl);
        } else {
          logger.warn("⚠️ Image upload failed:", uploadResponse.error);
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
      <View style={styles.screenContent}>
        <Header
          onPressLanguage={handleLanguagePress}
          onPressNotifications={handleNotificationPress}
          notificationCount={unreadNotificationCount}
        />

        <FanMomentsSection
          moments={momentList}
          onPressAdd={openShareModal}
          onPressMore={() => setAllMomentsVisible(true)}
          onSelectMoment={handleOpenDetail}
          onEditMoment={handleEditMoment}
          onDeleteMoment={handleDeleteMoment}
          onShareMoment={shareMoment}
          slot={smartSlot}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>

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
        sessionId={session?.sessionId}
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

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
          <View style={styles.languageModal}>
            <LanguageSwitcher onClose={() => setLanguageModalVisible(false)} />
          </View>
        </BlurView>
      </Modal>

      {/* Notification Modal */}
      <Modal
        visible={notificationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleNotificationModalClose}
      >
        <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
          <View style={styles.notificationModal}>
            <NotificationList onClose={handleNotificationModalClose} />
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

      {/* Hidden shareable card for capture */}
      {momentToShare && (
        <ShareableMomentCard
          ref={shareCardRef}
          moment={momentToShare}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
    paddingBottom: spacing.xxl,
  },
  smartSlot: {
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
  supportContentIOS: {
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.85)",
  },
  supportTitleIOS: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 24,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    flexShrink: 0,
    width: "100%",
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

  // -------- Dil Modalı (premium tasarım) --------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  languageModal: {
    width: "100%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(15, 20, 25, 0.98)",
    padding: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? spacing.xxl + spacing.lg : spacing.xl,
    gap: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  notificationModal: {
    width: "100%",
    height: "85%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: colors.background,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
    }),
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
