import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

export type Post = {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
};

type PostCardProps = {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onPress?: (postId: string) => void;
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [localLikes, setLocalLikes] = useState(post.likes);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleLike = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log("Haptics not available");
    }

    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLocalLikes(newLikedState ? localLikes + 1 : localLikes - 1);
    onLike?.(post.id);
  };

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `${post.author}: ${post.content}`,
        title: "AMEDSPOR Paylaşımı",
      });
      onShare?.(post.id);
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleComment = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log("Haptics not available");
    }
    onComment?.(post.id);
  };

  return (
    <Pressable
      onPress={() => onPress?.(post.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.authorContainer}>
              <View style={styles.avatar}>
                {post.authorAvatar ? (
                  <Image
                    source={{ uri: post.authorAvatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {post.author.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
            </View>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.mutedText}
            />
          </View>

          {/* Content */}
          <Text style={styles.content}>{post.content}</Text>

          {/* Image if exists */}
          {post.image && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
                resizeMode="cover"
              />
              <View style={styles.imageBorder} />
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={handleLike}>
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={isLiked ? colors.accent : colors.mutedText}
                />
              </Animated.View>
              <Text
                style={[styles.actionText, isLiked && { color: colors.accent }]}
              >
                {localLikes}
              </Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleComment}>
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color={colors.mutedText}
              />
              <Text style={styles.actionText}>{post.comments}</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleShare}>
              <Ionicons
                name="share-outline"
                size={22}
                color={colors.mutedText}
              />
              <Text style={styles.actionText}>{post.shares}</Text>
            </Pressable>
          </View>
        </LinearGradient>
        <View style={styles.borderGlow} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    backgroundColor: colors.card,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15, 169, 88, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(15, 169, 88, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
  },
  authorName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
  },
  timestamp: {
    color: colors.mutedText,
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
  },
  content: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: spacing.md,
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  imageBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  actionText: {
    color: colors.mutedText,
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
  },
  borderGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});

export default PostCard;
