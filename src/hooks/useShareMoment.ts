import { useRef, useCallback, useState } from "react";
import * as Sharing from "expo-sharing";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Alert } from "react-native";
import type { FanMomentDto } from "../types/fanMoment";
import type { ShareableMomentCardRef } from "../components/home/ShareableMomentCard";
import { mediaService } from "../services/mediaService";

type UseShareMomentReturn = {
  shareCardRef: React.RefObject<ShareableMomentCardRef | null>;
  momentToShare: FanMomentDto | null;
  isSharing: boolean;
  shareMoment: (moment: FanMomentDto) => Promise<void>;
  clearMomentToShare: () => void;
};

/**
 * Hook for sharing fan moments as images
 * Handles video thumbnail generation for video moments
 */
export const useShareMoment = (): UseShareMomentReturn => {
  const shareCardRef = useRef<ShareableMomentCardRef | null>(null);
  const [momentToShare, setMomentToShare] = useState<FanMomentDto | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const shareMoment = useCallback(async (moment: FanMomentDto) => {
    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Paylaşım Kullanılamıyor",
          "Bu cihazda paylaşım özelliği kullanılamıyor."
        );
        return;
      }

      setIsSharing(true);

      // If video moment, generate thumbnail first
      let momentWithThumbnail = { ...moment };

      if (moment.videoUrl && !moment.imageUrl) {
        try {
          // Get signed URL if needed
          let videoUri = moment.videoUrl;
          if (!/^https?:\/\//i.test(videoUri)) {
            const result = await mediaService.getSignedUrl(videoUri);
            if (result.success && result.url) {
              videoUri = result.url;
            }
          }

          // Generate thumbnail from video at 1 second
          const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
            videoUri,
            {
              time: 1000, // 1 second into the video
              quality: 0.8,
            }
          );

          // Use thumbnail as imageUrl for the share card
          momentWithThumbnail = {
            ...moment,
            imageUrl: thumbnailUri,
          };
        } catch (thumbnailError) {
          console.warn("Could not generate video thumbnail:", thumbnailError);
          // Continue without thumbnail
        }
      }

      setMomentToShare(momentWithThumbnail);

      // Wait for the component to render and capture
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (!shareCardRef.current) {
        throw new Error("Share card not ready");
      }

      const uri = await shareCardRef.current.capture();

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Anını Paylaş",
        UTI: "public.png", // iOS
      });
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(
        "Paylaşım Hatası",
        "Anı paylaşılırken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsSharing(false);
      setMomentToShare(null);
    }
  }, []);

  const clearMomentToShare = useCallback(() => {
    setMomentToShare(null);
  }, []);

  return {
    shareCardRef,
    momentToShare,
    isSharing,
    shareMoment,
    clearMomentToShare,
  };
};
