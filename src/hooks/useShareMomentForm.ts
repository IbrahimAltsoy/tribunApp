import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FanMomentDto } from "../types/fanMoment";
import { fanMomentService } from "../services/fanMomentService";
import { getSession } from "../utils/sessionManager";

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

      // Send to backend
      const response = await fanMomentService.createFanMoment({
        nickname,
        city: trimmedCity || t("home.momentDefaults.city"),
        caption: trimmedCaption || t("home.momentDefaults.caption"),
        imageUrl: imageUri,
        source: "App",
      });

      if (response.success && response.data) {
        console.log("✅ Moment created successfully:", response.data);
        reset();
        setVisible(false);
        // Ensure the moment has isOwnMoment flag set
        return {
          ...response.data,
          isOwnMoment: true,
        };
      } else {
        console.error("❌ Failed to create moment:", response.error);
        // Fallback to local moment on error
        const localMoment = buildMoment(imageUri);
        reset();
        setVisible(false);
        return localMoment;
      }
    } catch (error) {
      console.error("❌ Error creating moment:", error);
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
