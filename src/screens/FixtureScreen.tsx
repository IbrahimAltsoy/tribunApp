import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { footballService } from "../services/footballService";
import { goalNotificationService } from "../services/goalNotificationService";
import { GoalCelebration } from "../components/GoalCelebration";
import { useLiveMatchPolling } from "../hooks/useLiveMatchPolling";
import { logger } from "../utils/logger";
import type {
  StandingTableDto,
  MatchDetailDto,
  LiveScoreDto,
  TopScorerDataDto,
} from "../types/football";
import { StandingRow } from "../services/api";

// Type definitions for match data
type MatchResult = {
  id: string;
  week: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
};

type UpcomingMatch = {
  id: string;
  week: number;
  date: string;
  time: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
};

type LeagueLegendItem = {
  id: string;
  color: string;
  label: string;
  description: string;
};

type StandingsView = "general" | "home" | "away" | "scorers";

const FixtureScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [standingsView, setStandingsView] = useState<StandingsView>("general");

  // Week selection state
  const [selectedPastWeek, setSelectedPastWeek] = useState<number>(14);
  const [selectedUpcomingWeek, setSelectedUpcomingWeek] = useState<number>(15);

  // Backend standings state
  const [backendStandings, setBackendStandings] = useState<StandingRow[]>([]);
  const [currentWeekFromBackend, setCurrentWeekFromBackend] = useState<
    number | null
  >(null);

  // Backend matches state
  const [backendPastMatches, setBackendPastMatches] = useState<MatchResult[]>(
    []
  );
  const [backendUpcomingMatches, setBackendUpcomingMatches] = useState<
    UpcomingMatch[]
  >([]);

  // Top scorers state
  const [topScorers, setTopScorers] = useState<TopScorerDataDto[]>([]);

  // Goal celebration state
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);
  const [goalCelebrationData, setGoalCelebrationData] = useState<{
    teamName: string;
    playerName: string;
    minute: number;
  } | null>(null);

  // Smart live match polling with automatic notifications
  const { liveMatch, displayMinute, extraTime } = useLiveMatchPolling({
    teamType: "Mens",
    enabled: true,
    onGoalCelebration: (teamName, playerName, minute) => {
      setGoalCelebrationData({ teamName, playerName, minute });
      setShowGoalCelebration(true);
    },
  });

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to extract week number from round name
  const extractWeekNumber = (roundName: string): number => {
    const match = roundName.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Helper function to map backend match to MatchResult
  const mapToMatchResult = (match: MatchDetailDto): MatchResult => {
    const weekNumber = extractWeekNumber(match.roundName);
    const matchDate = new Date(match.matchDate);

    return {
      id: match.fixtureId.toString(),
      week: weekNumber,
      date: matchDate.toLocaleDateString("tr-TR"),
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeScore: match.fullTimeScore?.home || 0,
      awayScore: match.fullTimeScore?.away || 0,
      competition: match.roundName,
      homeTeamLogo: match.homeTeam.logoUrl || undefined,
      awayTeamLogo: match.awayTeam.logoUrl || undefined,
    };
  };

  // Helper function to map backend match to UpcomingMatch
  const mapToUpcomingMatch = (match: MatchDetailDto): UpcomingMatch => {
    const weekNumber = extractWeekNumber(match.roundName);
    const matchDate = new Date(match.matchDate);

    return {
      id: match.fixtureId.toString(),
      week: weekNumber,
      date: matchDate.toLocaleDateString("tr-TR"),
      time: matchDate.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      venue: match.venueName,
      competition: match.roundName,
      homeTeamLogo: match.homeTeam.logoUrl || undefined,
      awayTeamLogo: match.awayTeam.logoUrl || undefined,
    };
  };

  // Load all data function (used for pull-to-refresh)
  const loadAllData = useCallback(async () => {
    try {
      const seasonId = 25682;
      const teamId = 34;

      // Load all data in parallel for faster refresh
      const [standingsResponse, scheduleResponse, scorersResponse] = await Promise.all([
        footballService.getStandingsTable(seasonId),
        footballService.getTeamSchedule(teamId),
        standingsView === "scorers" ? footballService.getTopScorers(seasonId) : Promise.resolve(null),
      ]);

      // Process standings
      if (standingsResponse.success && standingsResponse.data) {
        setBackendStandings(standingsResponse.data as any);
        const maxPlayed = Math.max(...standingsResponse.data.map((team) => team.played));
        setCurrentWeekFromBackend(maxPlayed);
      }

      // Process schedule
      if (scheduleResponse.success && scheduleResponse.data) {
        const pastMatches = scheduleResponse.data.lastFiveMatches.map(mapToMatchResult);
        setBackendPastMatches(pastMatches);
        const upcomingMatches = scheduleResponse.data.upcomingFiveMatches.map(mapToUpcomingMatch);
        setBackendUpcomingMatches(upcomingMatches);
      }

      // Process top scorers
      if (scorersResponse && scorersResponse.success && scorersResponse.data) {
        setTopScorers(scorersResponse.data.data);
      }
      // Live match is now handled by useLiveMatchPolling hook
    } catch (error) {
      logger.error('Failed to refresh fixture data:', error);
    }
  }, [standingsView]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Minimum delay to ensure spinner is visible
    await Promise.all([
      loadAllData(),
      new Promise(resolve => setTimeout(resolve, 800))
    ]);
    setRefreshing(false);
  }, [loadAllData]);

  // Load standings from backend
  useEffect(() => {
    const loadStandings = async () => {
      const seasonId = 25682;

      const response = await footballService.getStandingsTable(seasonId);
      if (response.success && response.data) {
        // Store raw backend data - we'll filter by view type later
        setBackendStandings(response.data as any);

        // Get the highest "played" value from backend data - this is the current week
        const maxPlayed = Math.max(...response.data.map((team) => team.played));
        setCurrentWeekFromBackend(maxPlayed);
      } else {
        // Fallback to empty array if fetch fails
        setBackendStandings([]);
        setCurrentWeekFromBackend(null);
      }
    };
    loadStandings();
  }, []);

  // Load top scorers from backend - ONLY when scorers tab is active
  useEffect(() => {
    // Only load if user is on scorers tab
    if (standingsView !== "scorers") {
      return;
    }

    const loadTopScorers = async () => {
      const seasonId = 25682;

      logger.log("🔥 Loading top scorers for season:", seasonId);
      const response = await footballService.getTopScorers(seasonId);
      if (response.success && response.data) {
        logger.log(
          "✅ Top scorers loaded:",
          response.data.data.length,
          "players"
        );
        setTopScorers(response.data.data);
      } else {
        logger.log("❌ Top scorers failed to load");
        setTopScorers([]);
      }
    };
    loadTopScorers();
  }, [standingsView]);

  // Load team schedule from backend
  useEffect(() => {
    const loadSchedule = async () => {
      const teamId = 34;

      const response = await footballService.getTeamSchedule(teamId);
      if (response.success && response.data) {
        // Map last five matches
        const pastMatches = response.data.lastFiveMatches.map(mapToMatchResult);
        setBackendPastMatches(pastMatches);

        // Map upcoming five matches
        const upcomingMatches =
          response.data.upcomingFiveMatches.map(mapToUpcomingMatch);
        setBackendUpcomingMatches(upcomingMatches);
      } else {
        // Fallback to empty arrays if fetch fails
        setBackendPastMatches([]);
        setBackendUpcomingMatches([]);
      }
    };
    loadSchedule();
  }, []);

  // Auto-select the latest week for past results when backend data loads
  useEffect(() => {
    if (backendPastMatches.length > 0) {
      const maxWeek = Math.max(
        ...backendPastMatches.map((match) => match.week)
      );
      setSelectedPastWeek(maxWeek);
    }
  }, [backendPastMatches]);

  // Auto-select the earliest week for upcoming fixtures when backend data loads
  useEffect(() => {
    if (backendUpcomingMatches.length > 0) {
      const minWeek = Math.min(
        ...backendUpcomingMatches.map((match) => match.week)
      );
      setSelectedUpcomingWeek(minWeek);
    }
  }, [backendUpcomingMatches]);

  // Get current data based on gender
  const currentStandings = useMemo(() => {
    // Use backend data if available, otherwise fallback to mock data
    if (backendStandings.length > 0) {
      // Map backend data based on standings view (general/home/away)
      const mapped = backendStandings.map((team: any) => {
        let stats;
        let points;

        if (standingsView === "home") {
          stats = {
            mp: team.homePlayed,
            w: team.homeWon,
            d: team.homeDrawn,
            l: team.homeLost,
            gf: team.homeGoalsFor,
            ga: team.homeGoalsAgainst,
            gd: team.homeGoalDifference,
          };
          // Calculate home points: win=3, draw=1, loss=0
          points = team.homeWon * 3 + team.homeDrawn;
        } else if (standingsView === "away") {
          stats = {
            mp: team.awayPlayed,
            w: team.awayWon,
            d: team.awayDrawn,
            l: team.awayLost,
            gf: team.awayGoalsFor,
            ga: team.awayGoalsAgainst,
            gd: team.awayGoalDifference,
          };
          // Calculate away points: win=3, draw=1, loss=0
          points = team.awayWon * 3 + team.awayDrawn;
        } else {
          // general view
          stats = {
            mp: team.played,
            w: team.won,
            d: team.drawn,
            l: team.lost,
            gf: team.goalsFor,
            ga: team.goalsAgainst,
            gd: team.goalDifference,
          };
          points = team.points;
        }

        return {
          pos: team.position, // Will be updated after sorting
          team: team.teamName,
          logo: team.teamLogo,
          ...stats,
          pts: points,
          form: team.lastFiveMatches,
          positionChange: 0,
        };
      });

      // Sort by points (desc), then goal difference (desc), then goals for (desc)
      const sorted = mapped.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

      // Update positions after sorting
      return sorted.map((team, index) => ({
        ...team,
        pos: index + 1,
      }));
    }
    return []; // Empty if no backend data available
  }, [backendStandings, standingsView]);

  const currentPastResults = useMemo(() => {
    return backendPastMatches; // Use backend data only
  }, [backendPastMatches]);

  const currentUpcomingFixtures = useMemo(() => {
    return backendUpcomingMatches; // Use backend data only
  }, [backendUpcomingMatches]);

  const currentLeagueLegend = useMemo<LeagueLegendItem[]>(
    () => [], // No legend data - can be fetched from API if needed
    []
  );

  const ourTeam = "Galatasaray";

  // League info - static league name, dynamic week from backend
  const leagueInfo = useMemo(() => {
    const latestWeek =
      currentWeekFromBackend ||
      (currentPastResults.length > 0
        ? Math.max(...currentPastResults.map((r) => r.week))
        : 18);

    return {
      name: "Süper Lig 2025-2026",
      week: latestWeek,
      ourTeam: "Galatasaray",
    };
  }, [currentWeekFromBackend, currentPastResults]);

  // Get available weeks for past results (last 5 weeks)
  const pastWeeks = useMemo(() => {
    const weeks = Array.from(
      new Set(currentPastResults.map((r) => r.week))
    ).sort((a, b) => b - a);
    return weeks.slice(0, 5);
  }, [currentPastResults]);

  // Get available weeks for upcoming fixtures (next 5 weeks)
  const upcomingWeeks = useMemo(() => {
    const weeks = Array.from(
      new Set(currentUpcomingFixtures.map((f) => f.week))
    ).sort((a, b) => a - b);
    return weeks.slice(0, 5);
  }, [currentUpcomingFixtures]);

  // Get matches for selected week
  const selectedPastMatches = useMemo(
    () => currentPastResults.filter((r) => r.week === selectedPastWeek),
    [currentPastResults, selectedPastWeek]
  );

  const selectedUpcomingMatches = useMemo(
    () =>
      currentUpcomingFixtures.filter((f) => f.week === selectedUpcomingWeek),
    [currentUpcomingFixtures, selectedUpcomingWeek]
  );

  // Get position background color based on Süper Lig rules
  const getPositionColor = (pos: number): string | undefined => {
    if (pos === 1) return "#3b82f6";          // Mavi - Şampiyonlar Ligi
    if (pos >= 2 && pos <= 3) return "#10b981"; // Yeşil - Avrupa Ligi
    if (pos >= 4 && pos <= 6) return "#f59e0b"; // Turuncu - Konferans Ligi
    if (pos >= 17 && pos <= 18) return "#ef4444"; // Kırmızı - Küme düşme
    return undefined;
  };

  // Render Standing Row
  const renderStandingRow = useCallback(
    ({ item, index }: { item: StandingRow; index: number }) => {
      const isOurTeam =
        item.team.toLowerCase() === leagueInfo.ourTeam.toLowerCase();

      // Position change arrow
      const positionArrow =
        item.positionChange && item.positionChange > 0
          ? "▲"
          : item.positionChange && item.positionChange < 0
            ? "▼"
            : "►";

      const positionColor =
        item.positionChange && item.positionChange > 0
          ? colors.primary
          : item.positionChange && item.positionChange < 0
            ? colors.accent
            : colors.mutedText;

      // Get background color for position
      const positionBgColor = getPositionColor(item.pos);

      return (
        <View
          style={[
            styles.standingRow,
            isOurTeam && styles.standingRowHighlight,
            index === currentStandings.length - 1 && styles.standingRowLast,
          ]}
        >
          {/* Rank with colored circlee */}
          <View style={styles.rankCell}>
            <View
              style={[
                styles.rankCircle,
                positionBgColor && { backgroundColor: positionBgColor },
                isOurTeam && styles.rankCircleOurTeam,
              ]}
            >
              <Text
                style={[
                  styles.rankText,
                  positionBgColor && { color: "#ffffff" },
                  isOurTeam && styles.rankTextHighlight,
                ]}
              >
                {item.pos}
              </Text>
            </View>
            {item.positionChange !== 0 && (
              <Text style={[styles.positionChange, { color: positionColor }]}>
                {positionArrow}
              </Text>
            )}
          </View>

          {/* Team with logo */}
          <View style={styles.teamCell}>
            {item.logo ? (
              <Image source={{ uri: item.logo }} style={styles.teamLogo} />
            ) : (
              <View style={styles.teamLogoPlaceholder}>
                <Ionicons name="shield" size={16} color={colors.mutedText} />
              </View>
            )}
            <Text
              style={[styles.teamName, isOurTeam && styles.teamNameHighlight]}
              numberOfLines={1}
            >
              {item.team}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statCell}>
            <Text style={styles.statText}>{item.mp}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statText}>{item.w}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statText}>{item.d}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statText}>{item.l}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statText}>{item.gf}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statText}>{item.ga}</Text>
          </View>
          <View style={styles.statCell}>
            <Text
              style={[
                styles.statText,
                item.gd > 0 && styles.statTextPositive,
                item.gd < 0 && styles.statTextNegative,
              ]}
            >
              {item.gd > 0 ? `+${item.gd}` : item.gd}
            </Text>
          </View>
          <View style={[styles.statCell, styles.statCellPoints]}>
            <Text
              style={[
                styles.statTextPoints,
                isOurTeam && styles.statTextPointsHighlight,
              ]}
            >
              {item.pts}
            </Text>
          </View>

          {/* Form - Last 5 matches */}
          <View style={styles.formCell}>
            <View style={styles.formContainer}>
              {item.form &&
                item.form.map((result: string, index: number) => {
                  let formBgColor = colors.mutedText;
                  let formText = result;

                  if (result === "W" || result === "G") {
                    formBgColor = "#22c55e"; // Green for win
                    formText = "G";
                  } else if (result === "D" || result === "B") {
                    formBgColor = "#eab308"; // Yellow for draw
                    formText = "B";
                  } else if (result === "L" || result === "M") {
                    formBgColor = "#ef4444"; // Red for loss
                    formText = "M";
                  }

                  return (
                    <View
                      key={`${item.team}-form-${index}`}
                      style={[
                        styles.formBadge,
                        { backgroundColor: formBgColor },
                      ]}
                    >
                      <Text style={styles.formText}>{formText}</Text>
                    </View>
                  );
                })}
            </View>
          </View>
        </View>
      );
    },
    [currentStandings.length, leagueInfo.ourTeam]
  );

  // Render Standings Sections
  const renderStandingsSection = () => (
    <View style={styles.standingsSection}>
      {/* League Header */}
      <View style={styles.leagueHeader}>
        <Ionicons name="trophy-outline" size={20} color={colors.primary} />
        <View style={styles.leagueHeaderText}>
          <Text style={styles.leagueName}>{leagueInfo.name}</Text>
          <Text style={styles.leagueWeek}>
            {t("fixture.standings.week", { week: leagueInfo.week })}
          </Text>
        </View>
      </View>

      {/* View Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.viewTabs}
        style={styles.viewTabsScroll}
      >
        {(
          [
            { key: "general", label: t("fixture.standings.tabGeneral") },
            { key: "home",    label: t("fixture.standings.tabHome") },
            { key: "away",    label: t("fixture.standings.tabAway") },
            { key: "scorers", label: t("fixture.standings.tabScorers") },
          ] as const
        ).map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.viewTab, standingsView === key && styles.viewTabActive]}
            onPress={() => setStandingsView(key)}
          >
            <Text style={[styles.viewTabText, standingsView === key && styles.viewTabTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Standings Table - Only show when NOT on scorers tab */}
      {standingsView !== "scorers" && (
        <View style={styles.standingsCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.standingsTable}>
              {/* Table Header */}
              <View style={styles.standingsHeader}>
                <View style={styles.rankCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.rank")}
                  </Text>
                </View>
                <View style={styles.teamCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.team")}
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.played")}
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.won")}
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.drawn")}
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.lost")}
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.goalsFor")}
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.goalsAgainst")}
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.goalDifference")}
                  </Text>
                </View>
                <View style={[styles.statCell, styles.statCellPoints]}>
                  <Text style={styles.headerText}>
                    {t("fixture.standings.points")}
                  </Text>
                </View>
                <View style={styles.formCell}>
                  <Text style={styles.headerText}>Form</Text>
                </View>
              </View>

              {/* Table Rows */}
              <FlatList
                data={currentStandings}
                renderItem={renderStandingRow}
                keyExtractor={(item) => item.team}
                scrollEnabled={false}
                removeClippedSubviews={true}
                initialNumToRender={20}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {/* Top Scorers Section - Only show when scorers tab is active */}
      {standingsView === "scorers" && (
        <View style={styles.standingsCard}>
          <View style={styles.topScorersTable}>
            {/* Table Header */}
            <View style={styles.topScorersHeader}>
              <View style={styles.scorerRankCell}>
                <Text style={styles.headerText}>{t("fixture.scorers.rank")}</Text>
              </View>
              <View style={styles.scorerPlayerCell}>
                <Text style={styles.headerText}>{t("fixture.scorers.player")}</Text>
              </View>
              <View style={styles.scorerTeamCell}>
                <Text style={styles.headerText}>{t("fixture.scorers.team")}</Text>
              </View>
              <View style={styles.scorerGoalsCell}>
                <Text style={styles.headerText}>{t("fixture.scorers.goals")}</Text>
              </View>
            </View>

            {/* Top Scorers List */}
            {topScorers.length > 0 ? (
              topScorers.slice(0, 20).map((scorer, index) => {
                const playerName =
                  scorer.player?.displayName || scorer.player?.name || t("fixture.scorers.defaultPlayer");
                const teamName = scorer.participant?.name || "";
                const teamLogo = scorer.participant?.image_path || null;
                const goals = scorer.total || 0;
                const position = scorer.position || index + 1;

                const isOurTeam = teamName === "Galatasaray";

                // Medal emoji for top 3
                const rankDisplay =
                  position === 1
                    ? "🥇"
                    : position === 2
                      ? "🥈"
                      : position === 3
                        ? "🥉"
                        : position.toString();

                return (
                  <View
                    key={`${scorer.playerId}-${index}`}
                    style={[
                      styles.topScorerRow,
                      isOurTeam && styles.topScorerRowHighlight,
                      index === topScorers.slice(0, 20).length - 1 &&
                        styles.topScorerRowLast,
                    ]}
                  >
                    {/* Rank */}
                    <View style={styles.scorerRankCell}>
                      <Text
                        style={[
                          styles.scorerRankText,
                          position <= 3 && styles.scorerRankTopThree,
                        ]}
                      >
                        {rankDisplay}
                      </Text>
                    </View>

                    {/* Player */}
                    <View style={styles.scorerPlayerCell}>
                      <Text
                        style={[
                          styles.scorerPlayerName,
                          isOurTeam && styles.scorerPlayerNameHighlight,
                        ]}
                        numberOfLines={1}
                      >
                        {playerName}
                      </Text>
                    </View>

                    {/* Team */}
                    <View style={styles.scorerTeamCell}>
                      {teamLogo ? (
                        <Image
                          source={{ uri: teamLogo }}
                          style={styles.scorerTeamLogo}
                        />
                      ) : (
                        <View style={styles.scorerTeamLogoPlaceholder}>
                          <Ionicons
                            name="shield"
                            size={14}
                            color={colors.mutedText}
                          />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.scorerTeamName,
                          isOurTeam && styles.scorerTeamNameHighlight,
                        ]}
                        numberOfLines={1}
                      >
                        {teamName}
                      </Text>
                    </View>

                    {/* Goals */}
                    <View style={styles.scorerGoalsCell}>
                      <Text
                        style={[
                          styles.scorerGoalsText,
                          isOurTeam && styles.scorerGoalsTextHighlight,
                        ]}
                      >
                        {goals}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {t("fixture.scorers.emptyState")}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  // Render League Legend
  const renderLeagueLegend = () => (
    <View style={styles.legendCard}>
      <View style={styles.legendHeader}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.text}
        />
        <Text style={styles.legendTitle}>{t("fixture.legend.title")}</Text>
      </View>
      <View style={styles.legendItems}>
        {currentLeagueLegend.map((item) => (
          <View key={item.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <View style={styles.legendTextBlock}>
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Render Week Tab for Past Results
  const renderPastWeekTab = useCallback(
    ({ item }: { item: number }) => (
      <Pressable
        style={[
          styles.weekTab,
          selectedPastWeek === item && styles.weekTabActive,
        ]}
        onPress={() => setSelectedPastWeek(item)}
      >
        <Text
          style={[
            styles.weekTabText,
            selectedPastWeek === item && styles.weekTabTextActive,
          ]}
        >
          {t("fixture.lastWeeks.week", { week: item })}
        </Text>
      </Pressable>
    ),
    [selectedPastWeek, t]
  );

  // Render Week Tab for Upcoming Fixtures
  const renderUpcomingWeekTab = useCallback(
    ({ item }: { item: number }) => (
      <Pressable
        style={[
          styles.weekTab,
          selectedUpcomingWeek === item && styles.weekTabActive,
        ]}
        onPress={() => setSelectedUpcomingWeek(item)}
      >
        <Text
          style={[
            styles.weekTabText,
            selectedUpcomingWeek === item && styles.weekTabTextActive,
          ]}
        >
          {t("fixture.upcomingFixtures.week", { week: item })}
        </Text>
      </Pressable>
    ),
    [selectedUpcomingWeek, t]
  );

  // Render Past Match Result
  const renderPastMatch = useCallback(
    ({ item }: { item: MatchResult }) => {
      const isOurTeam = item.homeTeam === ourTeam || item.awayTeam === ourTeam;
      const ourScore =
        item.homeTeam === ourTeam
          ? item.homeScore
          : item.awayTeam === ourTeam
            ? item.awayScore
            : null;
      const opponentScore =
        item.homeTeam === ourTeam
          ? item.awayScore
          : item.awayTeam === ourTeam
            ? item.homeScore
            : null;

      let resultColor = colors.mutedText;
      if (isOurTeam && ourScore !== null && opponentScore !== null) {
        if (ourScore > opponentScore) resultColor = colors.primary;
        else if (ourScore < opponentScore) resultColor = colors.accent;
      }

      return (
        <View
          style={[styles.matchCard, isOurTeam && styles.matchCardHighlight]}
        >
          <Text style={styles.matchDate}>{item.date}</Text>
          <View style={styles.matchRow}>
            <View style={styles.teamWithLogo}>
              {item.homeTeamLogo && (
                <Image
                  source={{ uri: item.homeTeamLogo }}
                  style={styles.matchTeamLogo}
                />
              )}
              <Text
                style={[
                  styles.matchTeam,
                  isOurTeam &&
                    item.homeTeam === ourTeam &&
                    styles.matchTeamBold,
                ]}
              >
                {item.homeTeam}
              </Text>
            </View>
            <View style={styles.matchScore}>
              <Text style={[styles.matchScoreText, { color: resultColor }]}>
                {item.homeScore}
              </Text>
              <Text style={styles.matchScoreSeparator}>-</Text>
              <Text style={[styles.matchScoreText, { color: resultColor }]}>
                {item.awayScore}
              </Text>
            </View>
            <View style={styles.teamWithLogo}>
              {item.awayTeamLogo && (
                <Image
                  source={{ uri: item.awayTeamLogo }}
                  style={styles.matchTeamLogo}
                />
              )}
              <Text
                style={[
                  styles.matchTeam,
                  isOurTeam &&
                    item.awayTeam === ourTeam &&
                    styles.matchTeamBold,
                ]}
              >
                {item.awayTeam}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [ourTeam]
  );

  // Render Upcoming Match Fixture
  const renderUpcomingMatch = useCallback(
    ({ item }: { item: UpcomingMatch }) => {
      const isOurTeam = item.homeTeam === ourTeam || item.awayTeam === ourTeam;

      return (
        <View
          style={[styles.matchCard, isOurTeam && styles.matchCardHighlight]}
        >
          <View style={styles.upcomingMatchHeader}>
            <Text style={styles.matchDate}>{item.date}</Text>
            <View style={styles.matchTimePill}>
              <Ionicons name="time-outline" size={14} color={colors.text} />
              <Text style={styles.matchTime}>{item.time}</Text>
            </View>
          </View>
          <View style={styles.matchRow}>
            <View style={styles.teamWithLogo}>
              {item.homeTeamLogo && (
                <Image
                  source={{ uri: item.homeTeamLogo }}
                  style={styles.matchTeamLogo}
                />
              )}
              <Text
                style={[
                  styles.matchTeam,
                  isOurTeam &&
                    item.homeTeam === ourTeam &&
                    styles.matchTeamBold,
                ]}
              >
                {item.homeTeam}
              </Text>
            </View>
            <View style={styles.matchVs}>
              <Text style={styles.matchVsText}>vs</Text>
            </View>
            <View style={styles.teamWithLogo}>
              {item.awayTeamLogo && (
                <Image
                  source={{ uri: item.awayTeamLogo }}
                  style={styles.matchTeamLogo}
                />
              )}
              <Text
                style={[
                  styles.matchTeam,
                  isOurTeam &&
                    item.awayTeam === ourTeam &&
                    styles.matchTeamBold,
                ]}
              >
                {item.awayTeam}
              </Text>
            </View>
          </View>
          {item.venue && (
            <View style={styles.matchVenueRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={colors.mutedText}
              />
              <Text style={styles.matchVenue}>{item.venue}</Text>
            </View>
          )}
        </View>
      );
    },
    [ourTeam]
  );

  // Render Last 5 Weeks Section
  const renderLastWeeksSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="calendar-outline" size={22} color={colors.primary} />
        <Text style={styles.sectionTitle}>{t("fixture.lastWeeks.title")}</Text>
      </View>

      {/* Week Tabs */}
      <FlatList
        horizontal
        data={pastWeeks}
        renderItem={renderPastWeekTab}
        keyExtractor={(item) => `past-week-${item}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekTabsContainer}
      />

      {/* Matches */}
      {selectedPastMatches.length > 0 ? (
        <View style={styles.matchesContainer}>
          {selectedPastMatches.map((match) => (
            <View key={match.id}>{renderPastMatch({ item: match })}</View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t("fixture.lastWeeks.noMatches")}
          </Text>
        </View>
      )}
    </View>
  );

  // Render Upcoming Fixtures Section
  const renderUpcomingFixturesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name="calendar-clear-outline"
          size={22}
          color={colors.primary}
        />
        <Text style={styles.sectionTitle}>
          {t("fixture.upcomingFixtures.title")}
        </Text>
      </View>

      {/* Week Tabs */}
      <FlatList
        horizontal
        data={upcomingWeeks}
        renderItem={renderUpcomingWeekTab}
        keyExtractor={(item) => `upcoming-week-${item}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekTabsContainer}
      />

      {/* Matches */}
      {selectedUpcomingMatches.length > 0 ? (
        <View style={styles.matchesContainer}>
          {selectedUpcomingMatches.map((match) => (
            <View key={match.id}>{renderUpcomingMatch({ item: match })}</View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t("fixture.upcomingFixtures.noMatches")}
          </Text>
        </View>
      )}
    </View>
  );

  // Format minute display — e.g. "67'" or "45+2'"
  const formatMinute = (min: number, extra: number | null): string => {
    if (extra !== null && extra > 0) return `${min}+${extra}'`;
    return `${min}'`;
  };

  const renderLiveMatchSection = () => {
    if (!liveMatch) {
      return (
        <View style={styles.noLiveMatchCard}>
          <Ionicons name="radio-outline" size={24} color={colors.mutedText} />
          <Text style={styles.noLiveMatchText}>
            Şu anda canlı maç bulunmuyor
          </Text>
        </View>
      );
    }

    const homeTeam = liveMatch.participants.find((p) => p.location === "home");
    const awayTeam = liveMatch.participants.find((p) => p.location === "away");

    // Calculate running score at each moment
    const calcScoreAt = (upToMinute: number, upToExtra: number | null) => {
      let home = 0;
      let away = 0;
      for (const e of liveMatch.events) {
        if (e.rescinded) continue;
        const eMins = e.minute ?? 0;
        const eExtra = e.extraMinute ?? 0;
        const eFull = eMins + eExtra * 0.01;
        const upToFull = upToMinute + (upToExtra ?? 0) * 0.01;
        if (eFull > upToFull) continue;
        const isGoal = e.typeId === 14 || e.typeId === 15;
        const isOwnGoal = e.typeId === 16;
        if (isGoal || isOwnGoal) {
          if (e.participantId === homeTeam?.id) {
            if (isOwnGoal) away++; else home++;
          } else if (e.participantId === awayTeam?.id) {
            if (isOwnGoal) home++; else away++;
          }
        }
      }
      return { home, away };
    };

    // Total score — prefer direct API scores (scores include), fall back to event calculation
    const homeScore = liveMatch.homeScore ?? calcScoreAt(999, null).home;
    const awayScore = liveMatch.awayScore ?? calcScoreAt(999, null).away;

    // State label
    const stateId = liveMatch.stateId;
    const stateLabel =
      stateId === 2 ? "1. YARI" :
      stateId === 3 ? "DEVRE ARASI" :
      stateId === 22 ? "2. YARI" :
      (stateId === 5 || stateId === 6) ? "MAÇ BİTTİ" : "CANLI";

    // Filter & sort important events
    const importantTypeIds = [14, 15, 16, 18, 19, 20, 21];
    const allEvents = (liveMatch.events ?? [])
      .filter((e) => importantTypeIds.includes(e.typeId ?? 0) && !e.rescinded)
      .sort((a, b) => {
        const aFull = (a.minute ?? 0) + (a.extraMinute ?? 0) * 0.01;
        const bFull = (b.minute ?? 0) + (b.extraMinute ?? 0) * 0.01;
        return aFull - bFull;
      });

    const firstHalfEvents = allEvents.filter((e) => (e.minute ?? 0) <= 45 && (e.extraMinute == null || (e.minute ?? 0) < 45));
    const secondHalfEvents = allEvents.filter((e) => (e.minute ?? 0) > 45 || ((e.minute ?? 0) === 45 && (e.extraMinute ?? 0) > 0));

    const renderEventRow = (event: any, key: string) => {
      const isHome = event.participantId === homeTeam?.id;
      const min = event.minute ?? 0;
      const extra = event.extraMinute ? event.extraMinute : null;
      const minuteStr = extra ? `${min}+${extra}'` : `${min}'`;

      // Icon
      let iconName = "swap-horizontal-outline";
      let iconColor = "#AAAAAA";
      if (event.typeId === 14 || event.typeId === 15) { iconName = "football"; iconColor = "#FFFFFF"; }
      else if (event.typeId === 16) { iconName = "football"; iconColor = "#FF6B6B"; }
      else if (event.typeId === 19) { iconName = "square"; iconColor = "#F59E0B"; }       // yellow card
      else if (event.typeId === 21) { iconName = "square"; iconColor = "#EF4444"; }       // yellow-red (2nd yellow)
      else if (event.typeId === 20) { iconName = "square"; iconColor = "#EF4444"; }       // direct red card
      else if (event.typeId === 18) { iconName = "swap-horizontal-outline"; iconColor = "#4ADE80"; } // substitution

      const isGoal = event.typeId === 14 || event.typeId === 15 || event.typeId === 16;
      const isSub = event.typeId === 18;

      // Score at this moment (for goals only)
      const scoreAtGoal = isGoal ? calcScoreAt(min, extra) : null;
      const scoreStr = scoreAtGoal ? `${scoreAtGoal.home}-${scoreAtGoal.away}` : null;

      if (isHome) {
        return (
          <View key={key} style={styles.eventRow}>
            <View style={styles.eventHome}>
              <Text style={styles.eventMinuteLeft}>{minuteStr}</Text>
              <View style={[styles.eventIconWrap, { backgroundColor: `${iconColor}22` }]}>
                <Ionicons name={iconName as any} size={13} color={iconColor} />
              </View>
              <View style={styles.eventPlayerWrap}>
                {isGoal && scoreStr && (
                  <Text style={styles.eventScore}>{scoreStr}</Text>
                )}
                <Text style={styles.eventPlayerName} numberOfLines={1}>
                  {event.playerName || "Oyuncu"}
                </Text>
                {isSub && event.relatedPlayerName && (
                  <Text style={styles.eventSubOut} numberOfLines={1}>
                    ↑ {event.relatedPlayerName}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.eventAway} />
          </View>
        );
      } else {
        return (
          <View key={key} style={styles.eventRow}>
            <View style={styles.eventHome} />
            <View style={styles.eventAway}>
              <View style={styles.eventPlayerWrap}>
                {isGoal && scoreStr && (
                  <Text style={[styles.eventScore, { textAlign: "right" }]}>{scoreStr}</Text>
                )}
                <Text style={[styles.eventPlayerName, { textAlign: "right" }]} numberOfLines={1}>
                  {event.playerName || "Oyuncu"}
                </Text>
                {isSub && event.relatedPlayerName && (
                  <Text style={[styles.eventSubOut, { textAlign: "right" }]} numberOfLines={1}>
                    ↑ {event.relatedPlayerName}
                  </Text>
                )}
              </View>
              <View style={[styles.eventIconWrap, { backgroundColor: `${iconColor}22` }]}>
                <Ionicons name={iconName as any} size={13} color={iconColor} />
              </View>
              <Text style={styles.eventMinuteRight}>{minuteStr}</Text>
            </View>
          </View>
        );
      }
    };

    const renderHalfHeader = (label: string, score: { home: number; away: number }) => (
      <View style={styles.halfHeader}>
        <Text style={styles.halfLabel}>{label}</Text>
        <Text style={styles.halfScore}>{score.home} - {score.away}</Text>
      </View>
    );

    // Half-time score (score at end of 1st half)
    const halfTimeScore = calcScoreAt(45, 9);

    return (
      <View style={styles.liveMatchCard}>
        {/* ── Live indicator + minute ── */}
        <View style={styles.liveIndicatorRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>
            {(stateId === 5 || stateId === 6) ? "MAÇ BİTTİ" : stateId === 3 ? "DEVRE ARASI" : "CANLI"}
          </Text>
          {(stateId === 2 || stateId === 22) && (
            <Text style={styles.liveMinuteBadge}>
              {formatMinute(displayMinute, extraTime)}
            </Text>
          )}
        </View>

        {/* ── Score header ── */}
        <View style={styles.liveScoreRow}>
          <View style={styles.liveTeamBlock}>
            {homeTeam?.logo ? (
              <Image source={{ uri: homeTeam.logo }} style={styles.liveLogo} resizeMode="contain" />
            ) : (
              <View style={styles.liveLogoFb} />
            )}
            <Text style={styles.liveTeamName} numberOfLines={2}>{homeTeam?.name ?? ""}</Text>
          </View>

          <View style={styles.liveScoreBlock}>
            <Text style={styles.liveScoreText}>{homeScore} - {awayScore}</Text>
            <Text style={styles.liveStateLine}>{stateLabel}</Text>
          </View>

          <View style={[styles.liveTeamBlock, { alignItems: "flex-end" }]}>
            {awayTeam?.logo ? (
              <Image source={{ uri: awayTeam.logo }} style={styles.liveLogo} resizeMode="contain" />
            ) : (
              <View style={styles.liveLogoFb} />
            )}
            <Text style={[styles.liveTeamName, { textAlign: "right" }]} numberOfLines={2}>
              {awayTeam?.name ?? ""}
            </Text>
          </View>
        </View>

        {/* ── Events ── */}
        {allEvents.length > 0 && (
          <View style={styles.eventsWrap}>
            {firstHalfEvents.length > 0 && (
              <View>
                {renderHalfHeader("1. YARI", halfTimeScore)}
                {firstHalfEvents.map((e, i) => renderEventRow(e, `1h-${i}`))}
              </View>
            )}
            {secondHalfEvents.length > 0 && (
              <View>
                {renderHalfHeader("2. YARI", { home: homeScore, away: awayScore })}
                {secondHalfEvents.map((e, i) => renderEventRow(e, `2h-${i}`))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f2b91e"
            colors={["#f2b91e"]}
            progressBackgroundColor="#1A1A1A"
          />
        }
      >
        {/* Loading indicator for pull-to-refresh */}
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.refreshText}>Yenileniyor...</Text>
          </View>
        )}
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="football-outline" size={22} color={colors.primary} />
            <Text style={styles.headerTitle}>{t("fixture.title")}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{t("fixture.subtitle")}</Text>

          {/* Hızlı erişim kartları */}
          <View style={styles.headerActions}>
            <Pressable
              style={styles.quickCard}
              onPress={() => navigation.navigate("Players")}
            >
              <View style={styles.quickCardLeft}>
                <View style={styles.quickCardIcon}>
                  <Ionicons name="people-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.quickCardText}>Kadro</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={`${colors.primary}70`} />
            </Pressable>

            <Pressable
              style={styles.quickCard}
              onPress={() => navigation.navigate("Kits")}
            >
              <View style={styles.quickCardLeft}>
                <View style={styles.quickCardIcon}>
                  <Ionicons name="shirt-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.quickCardText}>Formalar</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={`${colors.primary}70`} />
            </Pressable>
          </View>
        </View>

        {/* Live Match Section - AT THE TOP */}
        {renderLiveMatchSection()}

        {/* Standings Section (RESTORED) */}
        {renderStandingsSection()}

        {/* League Legend */}
        {renderLeagueLegend()}

        {/* Last 5 Weeks Results */}
        {renderLastWeeksSection()}

        {/* Upcoming Fixtures */}
        {renderUpcomingFixturesSection()}
      </ScrollView>

      {/* Goal Celebration Overlay */}
      {showGoalCelebration && goalCelebrationData && (
        <GoalCelebration
          visible={showGoalCelebration}
          teamName={goalCelebrationData.teamName}
          playerName={goalCelebrationData.playerName}
          minute={goalCelebrationData.minute}
          onComplete={() => {
            setShowGoalCelebration(false);
            setGoalCelebrationData(null);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default FixtureScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  refreshText: {
    color: colors.primary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  header: {
    flexDirection: "column",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.mutedText,
    marginBottom: spacing.xs,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  quickCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${colors.primary}0E`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  quickCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  quickCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: `${colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  quickCardText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.1,
  },

  // Standings Section (RESTORED)
  standingsSection: {
    marginBottom: spacing.xl,
  },
  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leagueHeaderText: {
    flex: 1,
  },
  leagueName: {
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: 2,
  },
  leagueWeek: {
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.mutedText,
  },

  // View Tabs
  viewTabsScroll: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  viewTabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  viewTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  viewTabText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  viewTabTextActive: {
    color: colors.background,
  },

  // Standings Card
  standingsCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  standingsTable: {
    minWidth: "100%",
  },
  standingsHeader: {
    flexDirection: "row",
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.bold,
    color: colors.text,
    textAlign: "center",
  },

  // Standing Row
  standingRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  standingRowHighlight: {
    backgroundColor: "rgba(15,169,88,0.08)",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  standingRowLast: {
    borderBottomWidth: 0,
  },

  // Rank Cell
  rankCell: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankCircleFirst: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  rankCircleSecond: {
    backgroundColor: "#C0C0C0",
    borderColor: "#C0C0C0",
  },
  rankCircleOurTeam: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rankText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.bold,
    color: colors.text,
  },
  rankTextHighlight: {
    color: colors.background,
  },
  positionChange: {
    fontSize: fontSizes.xs,
    fontFamily: typography.bold,
  },

  // Team Cell
  teamCell: {
    width: 140,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  teamLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  teamLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  teamName: {
    flex: 1,
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.text,
  },
  teamNameHighlight: {
    fontFamily: typography.bold,
    color: colors.primary,
  },

  // Stat Cell
  statCell: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  statCellPoints: {
    width: 40,
  },
  statText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.text,
  },
  statTextPositive: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  statTextNegative: {
    color: colors.accent,
    fontFamily: typography.semiBold,
  },
  statTextPoints: {
    fontSize: fontSizes.sm,
    fontFamily: typography.bold,
    color: colors.text,
  },
  statTextPointsHighlight: {
    color: colors.primary,
  },

  // Form Cell
  formCell: {
    width: 120,
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
  },
  formContainer: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  formBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  formText: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: "#ffffff",
  },

  // Legend Card
  legendCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  legendTitle: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.text,
  },
  legendItems: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendTextBlock: {
    flex: 1,
  },
  legendLabel: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  legendDescription: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.mutedText,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },

  // Week Tabs
  weekTabsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  weekTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekTabText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  weekTabTextActive: {
    color: colors.background,
  },

  // Matches Container
  matchesContainer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },

  // Match Card
  matchCard: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchCardHighlight: {
    backgroundColor: "rgba(15,169,88,0.05)",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  matchDate: {
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.mutedText,
    marginBottom: spacing.xs,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  teamWithLogo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  matchTeamLogo: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  matchTeam: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  matchTeamBold: {
    fontFamily: typography.bold,
    color: colors.primary,
  },
  matchScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
  },
  matchScoreText: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
  },
  matchScoreSeparator: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.mutedText,
  },
  matchVs: {
    paddingHorizontal: 6,
  },
  matchVsText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.semiBold,
    color: colors.mutedText,
    textTransform: "uppercase",
  },
  upcomingMatchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  matchTimePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  matchTime: {
    fontSize: fontSizes.xs,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  matchVenueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  matchVenue: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.mutedText,
  },

  // Empty State
  emptyState: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.mutedText,
    textAlign: "center",
  },

  // Live Match Styles
  noLiveMatchCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  noLiveMatchText: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.mutedText,
  },
  liveMatchCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  livePulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
  },
  liveText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.bold,
    color: "#ef4444",
    letterSpacing: 1,
  },
  liveMinute: {
    fontSize: fontSizes.sm,
    fontFamily: typography.bold,
    color: "#ffffff",
    marginLeft: "auto",
  },
  liveMatchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  liveTeamContainer: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  liveTeamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  liveTeamName: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: "#ffffff",
    textAlign: "center",
  },
  liveScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  liveScore: {
    fontSize: 32,
    fontFamily: typography.bold,
    color: "#ffffff",
  },
  liveScoreSeparator: {
    fontSize: 24,
    fontFamily: typography.medium,
    color: "#666666",
  },
  eventsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  halfSection: {
    marginBottom: spacing.md,
  },
  halfTitle: {
    fontSize: fontSizes.xs,
    fontFamily: typography.bold,
    color: "#999999",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  eventMinute: {
    fontSize: fontSizes.xs,
    fontFamily: typography.semiBold,
    color: "#cccccc",
    width: 40,
  },
  eventIcon: {
    fontSize: 16,
    width: 24,
    textAlign: "center",
  },
  eventText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: "#ffffff",
    flex: 1,
  },
  substitutionContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },
  substitutionPlayer: {
    flexDirection: "row",
    alignItems: "center",
  },
  substitutionArrow: {
    fontSize: fontSizes.sm,
    fontFamily: typography.bold,
    marginRight: 4,
  },
  playerOut: {
    color: "#ff6b6b",
  },
  playerIn: {
    color: "#51cf66",
  },

  // Top Scorers Styles
  topScorersTable: {
    minWidth: "100%",
  },
  topScorersHeader: {
    flexDirection: "row",
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  topScorerRow: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  topScorerRowHighlight: {
    backgroundColor: "rgba(15,169,88,0.08)",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  topScorerRowLast: {
    borderBottomWidth: 0,
  },
  scorerRankCell: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  scorerRankText: {
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    color: colors.text,
  },
  scorerRankTopThree: {
    fontSize: fontSizes.lg,
  },
  scorerPlayerCell: {
    flex: 2,
    paddingRight: spacing.sm,
  },
  scorerPlayerName: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  scorerPlayerNameHighlight: {
    fontFamily: typography.bold,
    color: colors.primary,
  },
  scorerTeamCell: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  scorerTeamLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  scorerTeamLogoPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scorerTeamName: {
    flex: 1,
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.text,
  },
  scorerTeamNameHighlight: {
    fontFamily: typography.semiBold,
    color: colors.primary,
  },
  scorerGoalsCell: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  scorerGoalsText: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.text,
  },
  scorerGoalsTextHighlight: {
    color: colors.primary,
  },

  // ─ Live match new styles ─
  liveIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EF4444",
    letterSpacing: 1.2,
    flex: 1,
  },
  liveMinuteBadge: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    backgroundColor: `${colors.primary}18`,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.primary}35`,
  },
  liveScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  liveTeamBlock: {
    flex: 2,
    alignItems: "flex-start",
    gap: 6,
  },
  liveLogo: {
    width: 44,
    height: 44,
  },
  liveLogoFb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSubtle,
  },
  liveScoreBlock: {
    flex: 3,
    alignItems: "center",
    gap: 4,
  },
  liveScoreText: {
    fontSize: 38,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 2,
  },
  liveStateLine: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  eventsWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: 4,
    paddingBottom: 8,
  },
  halfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundSubtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: 4,
  },
  halfLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textTertiary,
    letterSpacing: 1.5,
  },
  halfScore: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  eventHome: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventAway: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  eventMinuteLeft: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textTertiary,
    minWidth: 36,
  },
  eventMinuteRight: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textTertiary,
    minWidth: 36,
    textAlign: "right",
  },
  eventIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  eventPlayerWrap: {
    flex: 1,
  },
  eventScore: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },
  eventPlayerName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  eventSubOut: {
    fontSize: 10,
    color: colors.textTertiary,
  },
});
