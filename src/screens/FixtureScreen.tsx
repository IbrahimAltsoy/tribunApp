import React, { useRef, useEffect } from "react";
import { StyleSheet, Text, View, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const FixtureScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, "#0A0A0A", colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Fikstür</Text>
              <View style={styles.titleUnderline} />
            </View>

            <View style={styles.card}>
              <LinearGradient
                colors={["rgba(15, 169, 88, 0.1)", "rgba(15, 169, 88, 0.02)"]}
                style={styles.cardGradient}
              >
                <Animated.View
                  style={[
                    styles.iconWrapper,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="calendar"
                      size={48}
                      color={colors.primary}
                    />
                  </View>
                </Animated.View>

                <Text style={styles.cardTitle}>Maç Takvimi</Text>
                <Text style={styles.cardSubtitle}>
                  Yakında tüm fikstür bilgilerine, maç skorlarına ve detaylı
                  istatistiklere buradan ulaşabileceksiniz.
                </Text>

                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Canlı Skorlar</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Maç Detayları</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Takım İstatistikleri</Text>
                  </View>
                </View>
              </LinearGradient>
              <View style={styles.cardBorder} />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
  titleUnderline: {
    marginTop: spacing.sm,
    height: 3,
    width: 80,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
    position: "relative",
  },
  cardGradient: {
    padding: spacing.xl,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  iconWrapper: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(15, 169, 88, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(15, 169, 88, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  cardSubtitle: {
    color: colors.mutedText,
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  featureList: {
    width: "100%",
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  featureText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});

export default FixtureScreen;
