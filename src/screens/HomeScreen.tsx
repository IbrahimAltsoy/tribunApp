import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  ImageBackground,
  Linking,
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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
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
import UserProfileModal from "../components/home/UserProfileModal";
import ReportBlockModal from "../components/ReportBlockModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import ShareMomentModal from "../components/home/ShareMomentModal";
import MomentDetailModal from "../components/home/MomentDetailModal";
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
import { userSafetyService } from "../services/userSafetyService";
import { logger } from "../utils/logger";
import { useAuth } from "../contexts/AuthContext";
import { useBanStatus, checkBanBeforeAction } from "../hooks/useBanStatus";
import type { PollDto } from "../types/poll";
import type { FanMomentDto } from "../types/fanMoment";

const storeImage = require("../assets/footboll/hagi.jpg");

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authState } = useAuth();

  const [moments, setMoments] = useState<FanMomentDto[]>([]);
  const [activePoll, setActivePoll] = useState<PollDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
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
  const [authorProfileVisible, setAuthorProfileVisible] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<{ userId: string; username: string } | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [momentToReport, setMomentToReport] = useState<FanMomentDto | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [momentToDelete, setMomentToDelete] = useState<FanMomentDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMoments, setHasMoreMoments] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Ban status for preventing banned users from creating content
  const { isBanned, showBanAlert } = useBanStatus();

  // Share moment hook
  const {
    shareCardRef,
    momentToShare,
    isSharing,
    shareMoment,
  } = useShareMoment();

  const PAGE_SIZE = 10;

  // Load all data function (used for initial load and refresh)
  const loadAllData = useCallback(async () => {
    // Load moments (reset to page 1)
    const momentsResponse = await fanMomentService.getFanMoments(1, PAGE_SIZE, "Approved");
    if (momentsResponse.success && momentsResponse.data) {
      const filtered = momentsResponse.data.filter(
        (m) => !userSafetyService.isBlocked(m.creatorSessionId, m.creatorUserId)
      );
      setMoments(filtered);
      setCurrentPage(1);
      setHasMoreMoments(momentsResponse.data.length >= PAGE_SIZE);
    } else {
      setMoments([]);
      setHasMoreMoments(false);
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

  // Load more moments (infinite scroll)
  const loadMoreMoments = useCallback(async () => {
    if (loadingMore || !hasMoreMoments) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const response = await fanMomentService.getFanMoments(nextPage, PAGE_SIZE, "Approved");
    if (response.success && response.data && response.data.length > 0) {
      const filtered = response.data.filter(
        (m) => !userSafetyService.isBlocked(m.creatorSessionId, m.creatorUserId)
      );
      setMoments((prev) => [...prev, ...filtered]);
      setCurrentPage(nextPage);
      setHasMoreMoments(response.data.length >= PAGE_SIZE);
    } else {
      setHasMoreMoments(false);
    }
    setLoadingMore(false);
  }, [currentPage, loadingMore, hasMoreMoments]);

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

  // Prevent double-like while API request is in-flight
  const likingMomentIds = useRef(new Set<string>());

  const handleOpenDetail = useCallback((moment: FanMomentDto) => {
    setSelectedMoment(moment);
    setDetailModalVisible(true);
  }, []);

  // Wrap openShareModal with ban check
  const handleOpenShareModal = useCallback(async () => {
    // Quick check from local state
    if (isBanned) {
      showBanAlert();
      return;
    }

    // Verify with server before allowing creation
    const canProceed = await checkBanBeforeAction();
    if (!canProceed) {
      return;
    }

    openShareModal();
  }, [isBanned, showBanAlert, openShareModal]);

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

  const handleNotificationPress = useCallback(() => {
    setNotificationModalVisible(true);
  }, []);

  const handlePressAuthor = useCallback((userId: string, username: string) => {
    setSelectedAuthor({ userId, username });
    setAuthorProfileVisible(true);
  }, []);

  const handleReportMoment = useCallback((moment: FanMomentDto) => {
    setMomentToReport(moment);
    setReportModalVisible(true);
  }, []);

  // Report triggered from the detail modal — close detail first, then open report
  const handleReportFromDetail = useCallback(() => {
    if (!selectedMoment) return;
    setDetailModalVisible(false);
    handleReportMoment(selectedMoment);
  }, [selectedMoment, handleReportMoment]);

  const handleReportBlockSuccess = useCallback(() => {
    if (momentToReport?.creatorUserId) {
      // Engellenen kullanıcının tüm paylaşımlarını listeden kaldır
      setMoments((prev) =>
        prev.filter((m) => m.creatorUserId !== momentToReport.creatorUserId)
      );
    }
    setReportModalVisible(false);
    setMomentToReport(null);
  }, [momentToReport]);

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
            onAuthRequired={() => navigation.navigate('Auth')}
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
          resizeMode="cover"
          style={styles.supportImage}
        >
          {/* Gradient: transparent top → dark bottom */}
          <LinearGradient
            colors={["rgba(0,0,0,0.05)", "transparent", "rgba(0,0,0,0.88)"]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Red top accent stripe */}
          <View style={styles.supportTopStripe} />
          {/* Bottom content */}
          <View style={styles.supportContent}>
            <View style={styles.supportHeaderRow}>
              <View style={styles.supportPillWrapper}>
                <Ionicons name="storefront-outline" size={12} color="#E8111A" />
                <Text style={styles.supportPill}>{t("home.supportPill")}</Text>
              </View>
              <View style={styles.supportArrowCircle}>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </View>
            </View>
            <Text style={styles.supportTitle} numberOfLines={1}>
              {t("home.supportStore")}
            </Text>
            <Text style={styles.supportSubtitle} numberOfLines={1}>
              {t("home.supportSubtitle")}
            </Text>
          </View>
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

  const showEditPermissionAlert = useCallback((message: string, canAskAgain: boolean) => {
    if (canAskAgain) {
      Alert.alert(t("shareMoment.permissionDenied"), message, [{ text: t("ok") }]);
    } else {
      Alert.alert(t("shareMoment.permissionDenied"), message, [
        { text: t("cancel"), style: "cancel" },
        { text: "Ayarları Aç", onPress: () => Linking.openSettings() },
      ]);
    }
  }, [t]);

  // Pick image for edit
  const pickEditImage = useCallback(async () => {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showEditPermissionAlert(t("shareMoment.galleryPermissionMessage"), canAskAgain);
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
  }, [t, showEditPermissionAlert]);

  // Take photo for edit
  const takeEditPhoto = useCallback(async () => {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showEditPermissionAlert(t("shareMoment.cameraPermissionMessage"), canAskAgain);
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
  }, [t, showEditPermissionAlert]);

  const handleDeleteMoment = useCallback(
    (moment: FanMomentDto) => {
      setMomentToDelete(moment);
      setDeleteConfirmVisible(true);
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!momentToDelete) return;
    setDeleteConfirmVisible(false);
    try {
      const response = await fanMomentService.deleteOwnFanMoment(momentToDelete.id);
      if (response.success) {
        setMoments((prev) => prev.filter((m) => m.id !== momentToDelete.id));
      } else {
        Alert.alert(t("home.deleteFailed"));
      }
    } catch {
      Alert.alert(t("home.deleteFailed"));
    } finally {
      setMomentToDelete(null);
    }
  }, [momentToDelete, t]);

  const handleLikeMoment = useCallback(
    async (moment: FanMomentDto) => {
      if (authState !== 'authenticated') {
        navigation.navigate('Auth');
        return;
      }

      // Spam koruması — aynı moment için in-flight istek varsa yoksay
      if (likingMomentIds.current.has(moment.id)) return;
      likingMomentIds.current.add(moment.id);

      // Optimistic update
      setMoments((prev) =>
        prev.map((m) =>
          m.id === moment.id
            ? { ...m, hasLiked: !m.hasLiked, likeCount: m.hasLiked ? m.likeCount - 1 : m.likeCount + 1 }
            : m
        )
      );

      try {
        const response = await fanMomentService.likeMoment(moment.id);

        if (!response.success) {
          // Optimistic update'i geri al
          setMoments((prev) =>
            prev.map((m) =>
              m.id === moment.id
                ? { ...m, hasLiked: moment.hasLiked, likeCount: moment.likeCount }
                : m
            )
          );
          if (response.error === 'unauthorized') {
            navigation.navigate('Auth');
          }
        } else if (response.data) {
          // Backend'den gelen kesin değerlerle senkronize et
          const synced = { hasLiked: response.data.liked, likeCount: response.data.likeCount };
          setMoments((prev) =>
            prev.map((m) => (m.id === moment.id ? { ...m, ...synced } : m))
          );
          // Açık detail modal'ı da güncelle
          setSelectedMoment((prev) =>
            prev?.id === moment.id ? { ...prev, ...synced } : prev
          );
        }
      } finally {
        likingMomentIds.current.delete(moment.id);
      }
    },
    [authState, navigation]
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
        <FanMomentsSection
          moments={moments}
          onPressAdd={handleOpenShareModal}
          onSelectMoment={handleOpenDetail}
          onEditMoment={handleEditMoment}
          onDeleteMoment={handleDeleteMoment}
          onShareMoment={shareMoment}
          onLikeMoment={handleLikeMoment}
          onPressAuthor={handlePressAuthor}
          slot={smartSlot}
          headerNode={
            <Header
              onPressNotifications={handleNotificationPress}
              notificationCount={unreadNotificationCount}
            />
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          onLoadMore={loadMoreMoments}
          loadingMore={loadingMore}
          hasMore={hasMoreMoments}
        />

      {/* Kullanıcı Profil Kartı */}
      <UserProfileModal
        visible={authorProfileVisible}
        userId={selectedAuthor?.userId ?? null}
        username={selectedAuthor?.username ?? ''}
        onClose={() => setAuthorProfileVisible(false)}
      />

      {/* Şikayet / Engelleme Modalı */}
      {momentToReport && (
        <ReportBlockModal
          visible={reportModalVisible}
          onClose={() => { setReportModalVisible(false); setMomentToReport(null); }}
          targetUserId={momentToReport.creatorUserId}
          contentType="FanMoment"
          contentId={momentToReport.id}
          onBlockSuccess={handleReportBlockSuccess}
          onReportSuccess={() => { setReportModalVisible(false); setMomentToReport(null); }}
        />
      )}

      {/* Silme Onay Modalı */}
      <ConfirmModal
        visible={deleteConfirmVisible}
        title={t("home.deleteConfirmTitle")}
        message={t("home.deleteConfirmMessage")}
        confirmText={t("home.deleteConfirm")}
        cancelText={t("home.cancel")}
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteConfirmVisible(false); setMomentToDelete(null); }}
      />

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
        onReport={selectedMoment && !selectedMoment.isOwnMoment ? handleReportFromDetail : undefined}
      />

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
                        colors={["#FFC72C", "#D97706"]}
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
    marginTop: spacing.md,
    overflow: "hidden",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(232,17,26,0.22)",
    ...Platform.select({
      ios: {
        shadowColor: "#E8111A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  supportCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  supportImage: {
    height: 210,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  supportTopStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#E8111A",
  },
  supportContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  supportHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  supportPillWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(232,17,26,0.15)",
    borderWidth: 1,
    borderColor: "rgba(232,17,26,0.35)",
  },
  supportPill: {
    color: "#E8111A",
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  supportTitle: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: 22,
  },
  supportSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  supportArrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8111A",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#E8111A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.55,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    width: "100%",
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
    backgroundColor: "rgba(232, 17, 26, 0.12)",
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
