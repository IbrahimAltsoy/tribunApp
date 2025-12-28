import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { footballService } from "../services/footballService";
import type { StandingTableDto, MatchDetailDto, LiveScoreDto } from "../types/football";
import {
  mensStandings,
  womensStandings,
  mensPastResults,
  womensPastResults,
  mensUpcomingFixtures,
  womensUpcomingFixtures,
  mensLeagueLegend,
  womensLeagueLegend,
  type StandingRow,
  type MatchResult,
  type UpcomingMatch,
} from "../data/mockData";

type GenderTeam = "mens" | "womens";
type StandingsView = "general" | "home" | "away";

const FixtureScreen = () => {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<GenderTeam>("mens");
  const [standingsView, setStandingsView] = useState<StandingsView>("general");

  // Week selection states
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

  // Live match state
  const [liveMatch, setLiveMatch] = useState<LiveScoreDto | null>(null);

  // Helper function to extract week number from round nam
  const extractWeekNumber = (roundName: string): number => {
    const match = roundName.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Helper function to map backend match to MatchResul
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

  // Load standings from backend
  useEffect(() => {
    const loadStandings = async () => {
      // Season IDs: Mens = 25749, Womens = 26532
      const seasonId = selectedGender === "mens" ? 25749 : 26532;

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
  }, [selectedGender]);

  // Load team schedule from backend
  useEffect(() => {
    const loadSchedule = async () => {
      // Team IDs: Mens = 3570, Womens = 261209
      const teamId = selectedGender === "mens" ? 3570 : 261209;

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
  }, [selectedGender]);

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
    return selectedGender === "mens" ? mensStandings : womensStandings;
  }, [selectedGender, backendStandings, standingsView]);

  const currentPastResults = useMemo(() => {
    // Use backend data if available, otherwise fallback to mock data
    if (backendPastMatches.length > 0) {
      return backendPastMatches;
    }
    return selectedGender === "mens" ? mensPastResults : womensPastResults;
  }, [selectedGender, backendPastMatches]);

  const currentUpcomingFixtures = useMemo(() => {
    // Use backend data if available, otherwise fallback to mock data
    if (backendUpcomingMatches.length > 0) {
      return backendUpcomingMatches;
    }
    return selectedGender === "mens"
      ? mensUpcomingFixtures
      : womensUpcomingFixtures;
  }, [selectedGender, backendUpcomingMatches]);

  const currentLeagueLegend = useMemo(
    () => (selectedGender === "mens" ? mensLeagueLegend : womensLeagueLegend),
    [selectedGender]
  );

  // Our team name based on gender
  const ourTeam = useMemo(
    () => (selectedGender === "mens" ? "Amedspor" : "Amed SK"),
    [selectedGender]
  );

  // League info based on gender - static league name, dynamic week from backend
  const leagueInfo = useMemo(() => {
    const ourTeamName = selectedGender === "mens" ? "Amedspor" : "Amed SK";

    // Use backend week if available, otherwise fallback to mock data or default
    const latestWeek =
      currentWeekFromBackend ||
      (currentPastResults.length > 0
        ? Math.max(...currentPastResults.map((r) => r.week))
        : selectedGender === "mens"
          ? 18
          : 14);

    return selectedGender === "mens"
      ? {
          name: "TFF 1.Lig 2025-2026",
          week: latestWeek,
          ourTeam: ourTeamName,
        }
      : {
          name: "TFF Kadınlar 2.Lig 2025-2026",
          week: latestWeek,
          ourTeam: ourTeamName,
        };
  }, [selectedGender, currentWeekFromBackend, currentPastResults]);

  // Load live scores only during match time (smarter polling) - ONLY FOR MEN'S TEAM
  useEffect(() => {
    // Only run for men's team
    if (selectedGender !== "mens") {
      setLiveMatch(null);
      return;
    }

    const loadLiveScores = async () => {
      const response = await footballService.getLiveScores();
      if (response.success && response.data) {
        // Filter for Amedspor men's team only (Team ID: 3570)
        const amedMatch = response.data.find(
          (match) => match.homeTeamId === 3570 || match.awayTeamId === 3570
        );
        setLiveMatch(amedMatch || null);
      } else {
        setLiveMatch(null);
      }
    };

    const checkIfShouldPoll = () => {
      // Get next upcoming match
      const nextMatch =
        currentUpcomingFixtures.length > 0 ? currentUpcomingFixtures[0] : null;

      if (!nextMatch) {
        setLiveMatch(null);
        return false;
      }

      // Parse match date and time (TR format: "27.12.2024" and "15:00")
      const [day, month, year] = nextMatch.date.split(".");
      const matchDateTime = new Date(
        `${year}-${month}-${day}T${nextMatch.time}`
      );
      const now = new Date();

      // Start polling 30 minutes before match and continue for 3 hours after match start
      const startPollingTime = new Date(
        matchDateTime.getTime() - 30 * 60 * 1000
      ); // 30 min before
      const endPollingTime = new Date(
        matchDateTime.getTime() + 3 * 60 * 60 * 1000
      ); // 3 hours after

      return now >= startPollingTime && now <= endPollingTime;
    };

    // Check initially
    if (checkIfShouldPoll()) {
      loadLiveScores();

      // Poll every 20 seconds during match time
      const interval = setInterval(() => {
        if (checkIfShouldPoll()) {
          loadLiveScores();
        } else {
          setLiveMatch(null);
        }
      }, 20000);

      return () => clearInterval(interval);
    } else {
      setLiveMatch(null);
    }
  }, [selectedGender, currentUpcomingFixtures]);

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
          {t("fixture.genderSelector.mens")}
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
          {t("fixture.genderSelector.womens")}
        </Text>
      </Pressable>
    </View>
  );

  // Get position background color based on league rules
  const getPositionColor = (pos: number): string | undefined => {
    if (selectedGender === "mens") {
      // TFF 1. Lig (Men's)
      if (pos >= 1 && pos <= 2) return "#3b82f6"; // Mavi - Süper Lig'e terfi
      if (pos === 3) return "#f59e0b"; // Turuncu - Final
      if (pos >= 4 && pos <= 7) return "#eab308"; // Sarı - Çeyrek final
      if (pos >= 17 && pos <= 20) return "#ef4444"; // Kırmızı - Küme düşme
    } else {
      // Women's league
      if (pos === 1) return "#3b82f6"; // Mavi - Kupaya katılım (Kadınlar Şampiyonlar Ligi)
      if (pos >= 14 && pos <= 16) return "#ef4444"; // Kırmızı - Küme düşme
    }
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

      {/* View Tabss */}
      <View style={styles.viewTabs}>
        <Pressable
          style={[
            styles.viewTab,
            standingsView === "general" && styles.viewTabActive,
          ]}
          onPress={() => setStandingsView("general")}
        >
          <Text
            style={[
              styles.viewTabText,
              standingsView === "general" && styles.viewTabTextActive,
            ]}
          >
            {t("fixture.standings.tabGeneral")}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.viewTab,
            standingsView === "home" && styles.viewTabActive,
          ]}
          onPress={() => setStandingsView("home")}
        >
          <Text
            style={[
              styles.viewTabText,
              standingsView === "home" && styles.viewTabTextActive,
            ]}
          >
            {t("fixture.standings.tabHome")}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.viewTab,
            standingsView === "away" && styles.viewTabActive,
          ]}
          onPress={() => setStandingsView("away")}
        >
          <Text
            style={[
              styles.viewTabText,
              standingsView === "away" && styles.viewTabTextActive,
            ]}
          >
            {t("fixture.standings.tabAway")}
          </Text>
        </Pressable>
      </View>

      {/* Standings Table */}
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
              keyExtractor={(item) => `${selectedGender}-${item.team}`}
              scrollEnabled={false}
              removeClippedSubviews={true}
              initialNumToRender={20}
            />
          </View>
        </ScrollView>
      </View>
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

  // Render Live Match Section
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

    // Get home and away teams
    const homeTeam = liveMatch.participants.find((p) => p.location === "home");
    const awayTeam = liveMatch.participants.find((p) => p.location === "away");

    // Get latest scores from events (goals)
    const goalEvents = liveMatch.events
      .filter((e) => e.typeId === 14) // 14 = goal event
      .sort((a, b) => (b.minute || 0) - (a.minute || 0));

    let homeScore = 0;
    let awayScore = 0;

    goalEvents.forEach((goal) => {
      if (goal.participantId === homeTeam?.id) {
        homeScore++;
      } else if (goal.participantId === awayTeam?.id) {
        awayScore++;
      }
    });

    // Get current minute
    const latestEvent = liveMatch.events.sort(
      (a, b) => (b.minute || 0) - (a.minute || 0)
    )[0];
    const currentMinute = latestEvent?.minute || 0;

    return (
      <View style={styles.liveMatchCard}>
        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.livePulse} />
          <Text style={styles.liveText}>CANLI</Text>
          <Text style={styles.liveMinute}>{currentMinute}'</Text>
        </View>

        {/* Match Details */}
        <View style={styles.liveMatchContent}>
          {/* Home Team */}
          <View style={styles.liveTeamContainer}>
            {homeTeam?.logo && (
              <Image
                source={{ uri: homeTeam.logo }}
                style={styles.liveTeamLogo}
              />
            )}
            <Text style={styles.liveTeamName} numberOfLines={1}>
              {homeTeam?.name || ""}
            </Text>
          </View>

          {/* Score */}
          <View style={styles.liveScoreContainer}>
            <Text style={styles.liveScore}>{homeScore}</Text>
            <Text style={styles.liveScoreSeparator}>-</Text>
            <Text style={styles.liveScore}>{awayScore}</Text>
          </View>

          {/* Away Team */}
          <View style={styles.liveTeamContainer}>
            {awayTeam?.logo && (
              <Image
                source={{ uri: awayTeam.logo }}
                style={styles.liveTeamLogo}
              />
            )}
            <Text style={styles.liveTeamName} numberOfLines={1}>
              {awayTeam?.name || ""}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="football-outline" size={28} color={colors.primary} />
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>{t("fixture.title")}</Text>
            <Text style={styles.headerSubtitle}>{t("fixture.subtitle")}</Text>
          </View>
        </View>

        {/* Live Match Section - AT THE TOP */}
        {renderLiveMatchSection()}

        {/* Gender Selector */}
        {renderGenderSelector()}

        {/* Standings Section (RESTORED) */}
        {renderStandingsSection()}

        {/* League Legend */}
        {renderLeagueLegend()}

        {/* Last 5 Weeks Results */}
        {renderLastWeeksSection()}

        {/* Upcoming Fixtures */}
        {renderUpcomingFixturesSection()}
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.mutedText,
  },

  // Gender Selector
  genderSelector: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.xs / 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
  },
  genderButtonText: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  genderButtonTextActive: {
    color: colors.background,
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
  viewTabs: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  viewTab: {
    flex: 1,
    paddingVertical: spacing.sm,
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
    padding: spacing.md,
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
    gap: spacing.sm,
  },
  teamWithLogo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  matchTeamLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
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
    paddingHorizontal: spacing.sm,
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
});
