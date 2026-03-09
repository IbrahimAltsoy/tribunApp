import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import type { FanMomentDto } from "../types/fanMoment";
import { fanMomentService } from "../services/fanMomentService";
import { mediaService } from "../services/mediaService";
import { useAuth } from "../contexts/AuthContext";
import { handlePossibleBanError } from "./useBanStatus";
import { logger } from "../utils/logger";

type ShareMomentFormState = {
  city: string;
  caption: string;
};

const initialState: ShareMomentFormState = {
  city: "",
  caption: "",
};

export const useShareMomentForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<ShareMomentFormState>(initialState);

  const setCity = useCallback(
    (city: string) => setForm((prev) => ({ ...prev, city })),
    []
  );

  const setCaption = useCallback(
    (caption: string) => setForm((prev) => ({ ...prev, caption })),
    []
  );

  const reset = useCallback(() => setForm(initialState), []);

  const close = useCallback(() => {
    setVisible(false);
    reset();
  }, [reset]);

  const open = useCallback(() => setVisible(true), []);

  const buildMoment = useCallback((imageUri?: string): FanMomentDto | null => {
    const trimmedCity = form.city.trim();
    const trimmedCaption = form.caption.trim();

    if (!trimmedCity && !trimmedCaption && !imageUri) {
      return null;
    }

    return {
      id: `local-${Date.now()}`,
      username: t("home.momentDefaults.user"),
      description: trimmedCaption || t("home.momentDefaults.caption"),
      status: 'Pending' as const,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      imageUrl: imageUri,
      isOwnMoment: true, // Local moments are always owned by current user
    };
  }, [form, t]);

  const submit = useCallback(async (imageUri?: string): Promise<FanMomentDto | null> => {
    const trimmedCity = form.city.trim();
    const trimmedCaption = form.caption.trim();

    if (!trimmedCity && !trimmedCaption && !imageUri) {
      return null;
    }

    try {
      // Use authenticated user's display name or fall back to default
      const nickname = user?.displayName || user?.username || t("home.momentDefaults.user");

      // Detect whether the selected file is a video based on extension
      const videoExtensions = ['mp4', 'mov', 'm4v', 'avi', 'webm', 'mkv', '3gp'];
      const fileExtension = imageUri?.split('.').pop()?.toLowerCase() ?? '';
      const isVideo = videoExtensions.includes(fileExtension);

      // Upload media file if provided
      let uploadedImageUrl: string | undefined = undefined;
      let uploadedVideoUrl: string | undefined = undefined;
      if (imageUri) {
        logger.log(`📤 Uploading ${isVideo ? 'video' : 'image'} before creating moment...`);
        const uploadResponse = await mediaService.uploadImageAnonymous(imageUri);

        if (uploadResponse.success && uploadResponse.data?.url) {
          if (isVideo) {
            uploadedVideoUrl = uploadResponse.data.url;
            logger.log("✅ Video uploaded:", uploadedVideoUrl);
          } else {
            uploadedImageUrl = uploadResponse.data.url;
            logger.log("✅ Image uploaded:", uploadedImageUrl);
          }
        } else {
          logger.warn("⚠️ Upload failed, creating moment without media:", uploadResponse.error);
        }
      }

      // Send to backend
      const response = await fanMomentService.createFanMoment({
        nickname,
        city: trimmedCity || t("home.momentDefaults.city"),
        caption: trimmedCaption || t("home.momentDefaults.caption"),
        imageUrl: uploadedImageUrl,
        videoUrl: uploadedVideoUrl,
        source: "App",
      });

      if (response.success && response.data) {
        logger.log("✅ Moment created successfully:", response.data);
        reset();
        setVisible(false);
        // Ensure the moment has isOwnMoment flag set
        return {
          ...response.data,
          isOwnMoment: true,
        };
      } else {
        logger.error("❌ Failed to create moment:", response.error);

        // Check if this is a ban error
        if (response.error && handlePossibleBanError(response.error)) {
          reset();
          setVisible(false);
          return null;
        }

        // Show generic error for other failures
        Alert.alert(
          t("error"),
          response.error || t("home.createMomentFailed"),
          [{ text: t("ok") }]
        );
        reset();
        setVisible(false);
        return null;
      }
    } catch (error: any) {
      logger.error("❌ Error creating moment:", error);

      // Check if this is a ban error
      if (error?.message && handlePossibleBanError(error.message)) {
        reset();
        setVisible(false);
        return null;
      }

      // Show generic error for other failures
      Alert.alert(
        t("error"),
        t("home.createMomentFailed"),
        [{ text: t("ok") }]
      );
      reset();
      setVisible(false);
      return null;
    }
  }, [form, buildMoment, reset, t, user]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.city.trim() || form.caption.trim()
      ),
    [form.caption, form.city]
  );

  return {
    visible,
    open,
    close,
    city: form.city,
    caption: form.caption,
    setCity,
    setCaption,
    canSubmit,
    submit,
    reset,
  };
};

export type UseShareMomentFormReturn = ReturnType<typeof useShareMomentForm>;
