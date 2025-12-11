import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FanMoment } from "../data/mockData";

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

  const buildMoment = useCallback((imageUri?: string): FanMoment | null => {
    const trimmedCity = form.city.trim();
    const trimmedCaption = form.caption.trim();

    if (!trimmedCity && !trimmedCaption && !imageUri) {
      return null;
    }

    return {
      id: `local-${Date.now()}`,
      user: t("home.momentDefaults.user"),
      location: trimmedCity || t("home.momentDefaults.city"),
      caption: trimmedCaption || t("home.momentDefaults.caption"),
      time: t("home.momentDefaults.time"),
      source: "Tribun",
      image: imageUri ? { uri: imageUri } : undefined,
    };
  }, [form, t]);

  const submit = useCallback((imageUri?: string) => {
    const moment = buildMoment(imageUri);
    if (!moment) return null;
    reset();
    setVisible(false);
    return moment;
  }, [buildMoment, reset]);

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
