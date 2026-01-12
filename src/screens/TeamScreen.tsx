import React, { useEffect, useMemo, useState } from "react";
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
import { staffService, type StaffDto } from "../services/staffService";
import { playerService, type PlayerDto } from "../services/playerService";

// Type definitions
type SocialMedia = {
  platform: string;
  url: string;
};

type ManagementMember = {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  bio?: string;
  social?: SocialMedia[];
};

type CoachingStaffMember = {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  bio?: string;
  social?: SocialMedia[];
};

type SquadPlayer = {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  imageUrl?: string;
  bio?: string;
  social?: SocialMedia[];
};

type GenderTeam = "mens" | "womens";
type TabType = "management" | "coaching" | "squad";

const MANAGEMENT_KEYWORDS = [
  "baskan",
  "yonetim",
  "sekreter",
  "asbaskan",
  "chairman",
  "president",
  "director",
  "board",
];

const COACHING_KEYWORDS = [
  "teknik",
  "antrenor",
  "coach",
  "trainer",
  "kondisyoner",
  "kaleci",
  "analist",
  "fizyoterapist",
  "fitness",
  "goalkeeper",
  "assistant",
];

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");

const extractHandle = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (!/^https?:\/\//i.test(trimmed) && !trimmed.includes("/")) {
    return trimmed.replace(/^@/, "");
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  const withoutWww = withoutProtocol.replace(/^www\./i, "");
  const parts = withoutWww.split("/").filter(Boolean);
  if (parts.length === 0) return undefined;

  const host = parts[0];
  const handleCandidate =
    host.includes("instagram.com") ||
    host.includes("twitter.com") ||
    host.includes("x.com")
      ? parts[1]
      : parts[0];

  if (!handleCandidate) return undefined;
  return handleCandidate.replace(/^@/, "").split("?")[0];
};

const getStaffRoleText = (member: StaffDto) =>
  normalizeText(
    [member.title, member.profession].filter(Boolean).join(" ").trim()
  );

const buildSocialMedia = (member: {
  instagramUrl?: string | null;
  twitterUrl?: string | null;
}): SocialMedia | undefined => {
  const instagram = extractHandle(member.instagramUrl);
  const twitter = extractHandle(member.twitterUrl);
  if (!instagram && !twitter) return undefined;
  return { instagram, twitter };
};

const mapStaffMember = (
  member: StaffDto
): ManagementMember | CoachingStaffMember => ({
  id: member.id,
  name: member.name,
  role: member.title || member.profession || "",
  bio: member.biography || "",
  photoUrl: member.imageUrl || undefined,
  socialMedia: buildSocialMedia(member),
});

const splitStaffMembers = (staff: StaffDto[]) => {
  const sortedStaff = [...staff].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );
  const management: ManagementMember[] = [];
  const coaching: CoachingStaffMember[] = [];

  sortedStaff.forEach((member) => {
    const roleText = getStaffRoleText(member);
    const isManagement = MANAGEMENT_KEYWORDS.some((keyword) =>
      roleText.includes(keyword)
    );
    const isCoaching = COACHING_KEYWORDS.some((keyword) =>
      roleText.includes(keyword)
    );
    const mapped = mapStaffMember(member);

    if (isCoaching && !isManagement) {
      coaching.push(mapped);
      return;
    }

    if (isManagement) {
      management.push(mapped);
      return;
    }

    management.push(mapped);
  });

  return { management, coaching };
};

const formatDateWithAge = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatHeight = (value?: number | null) => {
  if (!value) return "-";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  if (numeric >= 100) {
    return `${(numeric / 100).toFixed(2)} m`;
  }
  if (numeric >= 3) {
    return `${numeric.toFixed(2)} m`;
  }
  return `${numeric} m`;
};

const formatWeight = (value?: number | null) => {
  if (!value) return "-";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return `${numeric} kg`;
};

const mapPositionGroup = (position?: string | null, detailed?: string | null) => {
  const combined = normalizeText(
    [position || "", detailed || ""].join(" ").trim()
  );
  if (!combined) return "Diğer";
  if (combined.includes("kaleci") || combined.includes("goalkeeper")) {
    return "Kaleci";
  }
  if (
    combined.includes("defans") ||
    combined.includes("defender") ||
    combined.includes("bek")
  ) {
    return "Defans";
  }
  if (combined.includes("orta") || combined.includes("midfield")) {
    return "Orta Saha";
  }
  if (
    combined.includes("forvet") ||
    combined.includes("forward") ||
    combined.includes("attacker")
  ) {
    return "Forvet";
  }
  return "Diğer";
};

const mapPreferredFoot = (
  value?: string | null
): SquadPlayer["preferredFoot"] => {
  if (!value) return "Sağ";
  const normalized = normalizeText(value);
  if (normalized.includes("sol") || normalized.includes("left")) {
    return "Sol";
  }
  if (
    normalized.includes("cift") ||
    normalized.includes("both") ||
    normalized.includes("iki")
  ) {
    return "Çift Ayak";
  }
  return "Sağ";
};

const mapPlayerToSquad = (player: PlayerDto): SquadPlayer => ({
  id: player.id,
  name: player.name,
  jerseyNumber: player.jerseyNumber,
  position: mapPositionGroup(player.position, player.detailedPosition),
  detailedPosition: player.detailedPosition || player.position || "-",
  age: player.age ?? 0,
  birthDate: formatDateWithAge(player.birthDate),
  birthPlace: "-",
  nationality: player.nationality || "-",
  height: formatHeight(player.height),
  weight: formatWeight(player.weight),
  preferredFoot: mapPreferredFoot(player.preferredFoot),
  marketValue: player.marketValue || "-",
  currentClub: "-",
  previousClubs: [],
  bio: player.biography || "",
  photoUrl: player.imageUrl || undefined,
  socialMedia: buildSocialMedia({
    instagramUrl: player.instagramUrl,
    twitterUrl: player.twitterUrl,
  }),
});

const TeamScreen = () => {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<GenderTeam>("mens");
  const [selectedTab, setSelectedTab] = useState<TabType>("management");
  const [staffByGender, setStaffByGender] = useState<
    Record<
      GenderTeam,
      { management: ManagementMember[]; coaching: CoachingStaffMember[] }
    >
  >({
    mens: { management: [], coaching: [] },
    womens: { management: [], coaching: [] },
  });
  const [squadByGender, setSquadByGender] = useState<
    Record<GenderTeam, SquadPlayer[]>
  >({
    mens: [],
    womens: [],
  });

  // Get current data based on gender
  const currentManagement = useMemo(
    () => staffByGender[selectedGender].management,
    [selectedGender, staffByGender]
  );

  const currentCoachingStaff = useMemo(
    () => staffByGender[selectedGender].coaching,
    [selectedGender, staffByGender]
  );

  const currentSquad = useMemo(
    () => squadByGender[selectedGender],
    [selectedGender, squadByGender]
  );

  useEffect(() => {
    let isActive = true;

    const loadStaff = async () => {
      const teamType = selectedGender === "mens" ? "Mens" : "Womens";
      const response = await staffService.getStaff(teamType);

      if (!isActive) {
        return;
      }

      if (response.success && response.data) {
        const { management, coaching } = splitStaffMembers(response.data);
        setStaffByGender((prev) => ({
          ...prev,
          [selectedGender]: { management, coaching },
        }));
      }
    };

    loadStaff();

    return () => {
      isActive = false;
    };
  }, [selectedGender]);

  useEffect(() => {
    let isActive = true;

    const loadPlayers = async () => {
      const teamType = selectedGender === "mens" ? "Mens" : "Womens";
      const response = await playerService.getPlayers(teamType);

      if (!isActive) {
        return;
      }

      if (response.success && response.data) {
        const mappedPlayers = response.data.map(mapPlayerToSquad);
        setSquadByGender((prev) => ({
          ...prev,
          [selectedGender]: mappedPlayers,
        }));
      } else {
        setSquadByGender((prev) => ({
          ...prev,
          [selectedGender]: [],
        }));
      }
    };

    loadPlayers();

    return () => {
      isActive = false;
    };
  }, [selectedGender]);

  // Group squad players by position
  const squadSections = useMemo(() => {
    const positions = ["Kaleci", "Defans", "Orta Saha", "Forvet", "Diğer"];
    return positions.map((position) => ({
      title: position,
      data: currentSquad.filter((p) => p.position === position),
    }));
  }, [currentSquad]);

  const handleSocialMediaPress = (
    platform: "instagram" | "twitter",
    handleOrUrl?: string
  ) => {
    if (!handleOrUrl) return;
    const trimmed = handleOrUrl.trim();
    if (!trimmed) return;
    const handle = trimmed.replace(/^@/, "");
    const url = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : platform === "instagram"
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
              <Ionicons name="calendar" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.birthDate")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>
              {player.birthDate} ({player.age})
            </Text>
          </View>

          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="flag" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.nationality")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>{player.nationality}</Text>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.infoColumn}>
          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="resize" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.height")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>{player.height}</Text>
          </View>

          <View style={styles.infoRowEnhanced}>
            <View style={styles.infoIconLabel}>
              <Ionicons name="barbell" size={12} color={colors.primary} />
              <Text style={styles.infoLabelEnhanced}>{t("team.player.weight")}</Text>
            </View>
            <Text style={styles.infoValueEnhanced}>{player.weight}</Text>
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
