import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FanMomentDto } from "../types/fanMoment";
import { fanMomentService } from "../services/fanMomentService";
import { mediaService } from "../services/mediaService";
import { getSession } from "../utils/sessionManager";
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
      // Get session for nickname
      const session = await getSession();
      const nickname = session?.nickname || t("home.momentDefaults.user");

      // Upload image first if provided
      let uploadedImageUrl: string | undefined = undefined;
      if (imageUri) {
        logger.log("📤 Uploading image before creating moment...");
        const uploadResponse = await mediaService.uploadImageAnonymous(imageUri);

        if (uploadResponse.success && uploadResponse.data?.url) {
          uploadedImageUrl = uploadResponse.data.url;
          logger.log("✅ Image uploaded:", uploadedImageUrl);
        } else {
          logger.warn("⚠️ Image upload failed, creating moment without image:", uploadResponse.error);
        }
      }

      // Send to backend
      const response = await fanMomentService.createFanMoment({
        nickname,
        city: trimmedCity || t("home.momentDefaults.city"),
        caption: trimmedCaption || t("home.momentDefaults.caption"),
        imageUrl: uploadedImageUrl, // Use uploaded URL instead of local URI
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
        // Fallback to local moment on error
        const localMoment = buildMoment(imageUri);
        reset();
        setVisible(false);
        return localMoment;
      }
    } catch (error) {
      logger.error("❌ Error creating moment:", error);
      // Fallback to local moment on error
      const localMoment = buildMoment(imageUri);
      reset();
      setVisible(false);
      return localMoment;
    }
  }, [form, buildMoment, reset, t]);

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
