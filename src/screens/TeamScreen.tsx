import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  SectionList,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import {
  mensManagement,
  womensManagement,
  mensCoachingStaff,
  womensCoachingStaff,
  mensSquad,
  womensSquad,
  type ManagementMember,
  type CoachingStaffMember,
  type SquadPlayer,
} from "../data/mockData";

type GenderTeam = "mens" | "womens";
type TabType = "management" | "coaching" | "squad";

const TeamScreen = () => {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<GenderTeam>("mens");
  const [selectedTab, setSelectedTab] = useState<TabType>("management");

  // Get current data based on gender
  const currentManagement = useMemo(
    () => (selectedGender === "mens" ? mensManagement : womensManagement),
    [selectedGender]
  );

  const currentCoachingStaff = useMemo(
    () => (selectedGender === "mens" ? mensCoachingStaff : womensCoachingStaff),
    [selectedGender]
  );

  const currentSquad = useMemo(
    () => (selectedGender === "mens" ? mensSquad : womensSquad),
    [selectedGender]
  );

  // Group squad players by position
  const squadSections = useMemo(() => {
    const positions = ["Kaleci", "Defans", "Orta Saha", "Forvet"];
    return positions.map((position) => ({
      title: position,
      data: currentSquad.filter((p) => p.position === position),
    }));
  }, [currentSquad]);

  const handleSocialMediaPress = (platform: "instagram" | "twitter", handle?: string) => {
    if (!handle) return;
    const url = platform === "instagram"
      ? `https://instagram.com/${handle}`
      : `https://twitter.com/${handle}`;
    Linking.openURL(url);
  };

  // Render Gender Selector
  const renderGenderSelector = () => (
    <View style={styles.genderSelector}>
      <Pressable
        style={[
          styles.genderButton,
          selectedGender === "mens" && styles.genderButtonActive,
        ]}
        onPress={() => setSelectedGender("mens")}
      >
        <Text
          style={[
            styles.genderButtonText,
            selectedGender === "mens" && styles.genderButtonTextActive,
          ]}
        >
          {t("team.genderSelector.mens")}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.genderButton,
          selectedGender === "womens" && styles.genderButtonActive,
        ]}
        onPress={() => setSelectedGender("womens")}
      >
        <Text
          style={[
            styles.genderButtonText,
            selectedGender === "womens" && styles.genderButtonTextActive,
          ]}
        >
          {t("team.genderSelector.womens")}
        </Text>
      </Pressable>
    </View>
  );

  // Render Tab Selector
  const renderTabSelector = () => (
    <View style={styles.tabSelector}>
      <Pressable
        style={[
          styles.tabButton,
          selectedTab === "management" && styles.tabButtonActive,
        ]}
        onPress={() => setSelectedTab("management")}
      >
        <Text
          style={[
            styles.tabButtonText,
            selectedTab === "management" && styles.tabButtonTextActive,
          ]}
        >
          {t("team.tabs.management")}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.tabButton,
          selectedTab === "coaching" && styles.tabButtonActive,
        ]}
        onPress={() => setSelectedTab("coaching")}
      >
        <Text
          style={[
            styles.tabButtonText,
            selectedTab === "coaching" && styles.tabButtonTextActive,
          ]}
        >
          {t("team.tabs.coaching")}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.tabButton,
          selectedTab === "squad" && styles.tabButtonActive,
        ]}
        onPress={() => setSelectedTab("squad")}
      >
        <Text
          style={[
            styles.tabButtonText,
            selectedTab === "squad" && styles.tabButtonTextActive,
          ]}
        >
          {t("team.tabs.squad")}
        </Text>
      </Pressable>
    </View>
  );

  // Render Management Member Card
  const renderManagementCard = (member: ManagementMember) => (
    <View key={member.id} style={styles.personCard}>
      <Image
        source={{ uri: member.photoUrl }}
        style={styles.personPhoto}
        defaultSource={require("../assets/footboll/1.jpg")}
      />
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{member.name}</Text>
        <Text style={styles.personRole}>{member.role}</Text>
        <Text style={styles.personBio} numberOfLines={3}>
          {member.bio}
        </Text>
        {member.socialMedia && (
          <View style={styles.socialMediaRow}>
            {member.socialMedia.instagram && (
              <Pressable
                style={styles.socialButton}
                onPress={() =>
                  handleSocialMediaPress("instagram", member.socialMedia?.instagram)
                }
              >
                <Ionicons name="logo-instagram" size={18} color={colors.primary} />
              </Pressable>
            )}
            {member.socialMedia.twitter && (
              <Pressable
                style={styles.socialButton}
                onPress={() =>
                  handleSocialMediaPress("twitter", member.socialMedia?.twitter)
                }
              >
                <Ionicons name="logo-twitter" size={18} color={colors.primary} />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );

  // Render Coaching Staff Card
  const renderCoachingCard = (member: CoachingStaffMember) => (
    <View key={member.id} style={styles.personCard}>
      <Image
        source={{ uri: member.photoUrl }}
        style={styles.personPhoto}
        defaultSource={require("../assets/footboll/1.jpg")}
      />
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{member.name}</Text>
        <Text style={styles.personRole}>{member.role}</Text>
        <Text style={styles.personBio} numberOfLines={3}>
          {member.bio}
        </Text>
        {member.socialMedia && (
          <View style={styles.socialMediaRow}>
            {member.socialMedia.instagram && (
              <Pressable
                style={styles.socialButton}
                onPress={() =>
                  handleSocialMediaPress("instagram", member.socialMedia?.instagram)
                }
              >
                <Ionicons name="logo-instagram" size={18} color={colors.primary} />
              </Pressable>
            )}
            {member.socialMedia.twitter && (
              <Pressable
                style={styles.socialButton}
                onPress={() =>
                  handleSocialMediaPress("twitter", member.socialMedia?.twitter)
                }
              >
                <Ionicons name="logo-twitter" size={18} color={colors.primary} />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );

  // Render Squad Player Card - Enhanced with rich football data
  const renderSquadPlayerCard = (player: SquadPlayer) => (
    <View style={styles.enhancedPlayerCard}>
      {/* Top Section: Circular Photo + Jersey Badge */}
      <View style={styles.playerCardHeader}>
        <View style={styles.playerPhotoCircleContainer}>
          <Image
            source={{ uri: player.photoUrl }}
            style={styles.playerPhotoCircle}
            defaultSource={require("../assets/footboll/1.jpg")}
          />
        </View>
        <View style={styles.jerseyBadgeTop}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.jerseyBadgeGradient}
          >
            <Text style={styles.jerseyNumberTop}>{player.jerseyNumber}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Player Name */}
      <Text style={styles.playerNameEnhanced}>{player.name}</Text>
      <Text style={styles.playerPositionEnhanced}>{player.detailedPosition}</Text>

      {/* Info Grid - 2 Columns */}
      <View style={styles.infoGridContainer}>
        {/* Left Column */}
        <View style={styles.infoColumn}>
          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="flag" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.nationality")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>{player.nationality}</Text>
          </View>

          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="calendar" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.birthDate")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>
              {player.birthDate} ({player.age})
            </Text>
          </View>

          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="resize" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.height")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>{player.height}</Text>
          </View>

          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="footsteps" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.preferredFoot")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>{player.preferredFoot}</Text>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.infoColumn}>
          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="location" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.birthPlace")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>{player.birthPlace}</Text>
          </View>

          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="shield" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.currentClub")}</Text>
            </View>
            <Text style={[styles.infoValueEnhanced, styles.clubHighlight]}>
              {player.currentClub}
            </Text>
          </View>

          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="barbell" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.weight")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>{player.weight}</Text>
          </View>

          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="trending-up" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.marketValue")}</Text>
            </View>
            <Text style={[styles.infoValueEnhanced, styles.marketValueText]}>
              {player.marketValue}
            </Text>
          </View>
        </View>
      </View>

      {/* Previous Clubs Section */}
      {player.previousClubs && player.previousClubs.length > 0 && (
        <View style={styles.previousClubsSection}>
          <Text style={styles.previousClubsTitle}>
            {t("team.player.previousClubs")}
          </Text>
          {player.previousClubs.map((club, index) => (
            <View key={index} style={styles.previousClubRow}>
              <Ionicons name="arrow-forward" size={10} color={colors.accent} />
              <Text style={styles.previousClubName}>
                {club.club}
              </Text>
              <Text style={styles.previousClubYears}>({club.years})</Text>
            </View>
          ))}
        </View>
      )}

      {/* Social Media */}
      {player.socialMedia && (
        <View style={styles.socialMediaFooter}>
          {player.socialMedia.instagram && (
            <Pressable
              style={styles.socialIconButton}
              onPress={() =>
                handleSocialMediaPress("instagram", player.socialMedia?.instagram)
              }
            >
              <Ionicons name="logo-instagram" size={22} color={colors.text} />
            </Pressable>
          )}
          {player.socialMedia.twitter && (
            <Pressable
              style={styles.socialIconButton}
              onPress={() =>
                handleSocialMediaPress("twitter", player.socialMedia?.twitter)
              }
            >
              <Ionicons name="logo-twitter" size={22} color={colors.text} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  // Render content based on selected tab
  const renderContent = () => {
    if (selectedTab === "management") {
      return (
        <View style={styles.contentContainer}>
          {currentManagement.map((member) => renderManagementCard(member))}
        </View>
      );
    }

    if (selectedTab === "coaching") {
      return (
        <View style={styles.contentContainer}>
          {currentCoachingStaff.map((member) => renderCoachingCard(member))}
        </View>
      );
    }

    if (selectedTab === "squad") {
      return (
        <SectionList
          sections={squadSections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderSquadPlayerCard(item)}
          renderSectionHeader={({ section: { title, data } }) =>
            data.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
                <View style={styles.sectionHeaderLine} />
              </View>
            ) : null
          }
          contentContainerStyle={styles.sectionListContent}
          stickySectionHeadersEnabled={false}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, "#0B111C", colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t("team.title")}</Text>
          <Text style={styles.subtitle}>{t("team.subtitle")}</Text>
        </View>

        {renderGenderSelector()}
        {renderTabSelector()}

        {selectedTab === "squad" ? (
          renderContent()
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.mutedText,
  },
  genderSelector: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.xs,
  },
  genderButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 8,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
  },
  genderButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.mutedText,
  },
  genderButtonTextActive: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  tabSelector: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  tabButtonActive: {
    backgroundColor: colors.accent,
  },
  tabButtonText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.mutedText,
  },
  tabButtonTextActive: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
  },
  personCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
  },
  personPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  personRole: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  personBio: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.mutedText,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  socialMediaRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  socialButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionHeaderText: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.text,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  playerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
  },
  playerPhotoContainer: {
    position: "relative",
  },
  playerPhoto: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  jerseyBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  jerseyNumber: {
    fontSize: fontSizes.sm,
    fontFamily: typography.bold,
    color: colors.text,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  playerMetaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  playerMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  playerMetaText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.mutedText,
  },
  playerBio: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.mutedText,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  previousClubs: {
    marginBottom: spacing.xs,
  },
  previousClubsLabel: {
    fontSize: fontSizes.xs,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  previousClubsText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.mutedText,
  },
  // Enhanced Player Card Styles
  enhancedPlayerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  playerCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  playerPhotoCircleContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: colors.background,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  playerPhotoCircle: {
    width: "100%",
    height: "100%",
  },
  jerseyBadgeTop: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: colors.card,
  },
  jerseyBadgeGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  jerseyNumberTop: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text,
  },
  playerNameEnhanced: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  playerPositionEnhanced: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.accent,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  infoGridContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  infoRowEnhanced: {
    gap: 4,
  },
  infoIconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  infoLabelEnhanced: {
    fontSize: fontSizes.xs,
    fontFamily: typography.semiBold,
    color: colors.mutedText,
  },
  infoValueEnhanced: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.text,
    paddingLeft: 18,
  },
  clubHighlight: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  marketValueText: {
    color: colors.accent,
    fontFamily: typography.bold,
  },
  previousClubsSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previousClubsTitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  previousClubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.xs,
  },
  previousClubName: {
    fontSize: fontSizes.xs,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  previousClubYears: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.mutedText,
  },
  socialMediaFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  socialIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TeamScreen;
