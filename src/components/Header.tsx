import React, { useRef, useEffect } from "react";
import { StyleSheet, Text, View, Animated, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors"; // DÜZELTİLDİ: 'from' kalktı
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

type HeaderProps = {
  onPressNotifications?: () => void;
  onPressLanguage?: () => void;
};

const Header: React.FC<HeaderProps> = ({
  onPressNotifications,
  onPressLanguage,
}) => {
  const notificationScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const languageScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(notificationScale, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(notificationScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const handleLangPressIn = () => {
    Animated.spring(languageScale, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handleLangPressOut = () => {
    Animated.spring(languageScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>AMED PULSE</Text>
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={onPressLanguage}
            onPressIn={handleLangPressIn}
            onPressOut={handleLangPressOut}
            style={styles.iconPressable}
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.languageButton,
                { transform: [{ scale: languageScale }] },
              ]}
            >
              <Ionicons name="globe-outline" size={20} color={colors.text} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={onPressNotifications}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.iconPressable}
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.notificationButton,
                { transform: [{ scale: notificationScale }] },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text}
              />
              <View style={styles.notificationBadge} />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <View style={styles.underlineContainer}>
        <LinearGradient
          colors={[colors.accent, colors.primary]} // soldan saga: yesil -> sari/kirmizi
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.underline}
        />
        {/* <View style={styles.underlineGlow} /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    position: "relative",
    overflow: "hidden",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    letterSpacing: 1.2,
    textShadowColor: "rgba(15, 169, 88, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: 50,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconPressable: {
    borderRadius: 22,
  },
  languageButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
  },
  underlineContainer: {
    marginTop: spacing.md,
    position: "relative",
  },
  underline: {
    height: 4,
    width: "100%",
    borderRadius: 3,
  },
  // underlineGlow: {
  //   position: "absolute",
  //   top: -3,
  //   left: 0,
  //   height: 10,
  //   width: "1%",
  //   backgroundColor: colors.primary,
  //   borderRadius: 5,
  //   opacity: 0.4,
  //   shadowColor: colors.primary,
  //   shadowOffset: { width: 0, height: 0 },
  //   shadowOpacity: 1,
  //   shadowRadius: 12,
  //   elevation: 10,
  // },
});

export default Header;
