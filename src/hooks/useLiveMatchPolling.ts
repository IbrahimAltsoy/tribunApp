import { useEffect, useRef, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { footballService } from "../services/footballService";
import { notificationService } from "../services/notificationService";
import { logger } from "../utils/logger";
import type { LiveScoreDto } from "../types/football";

// Match states from API
const MATCH_STATES = {
  NOT_STARTED: 1,
  FIRST_HALF: 2,
  HALF_TIME: 3,
  SECOND_HALF: 4,
  FINISHED: 5,
} as const;

// Event types from API
const EVENT_TYPES = {
  GOAL: 14, // Regular goal
  OWN_GOAL: 16, // Own goal
  PENALTY_GOAL: 15, // Penalty goal
  RED_CARD: 19, // Red card
  YELLOW_CARD: 18, // Yellow card
} as const;

// Polling intervals (in milliseconds)
const POLLING_INTERVALS = {
  PRE_MATCH: 30000, // 30 seconds before match starts
  LIVE: 3000, // 3 seconds during live match
  HALF_TIME: 30000, // 30 seconds during half-time
  BACKGROUND_CHECK: 300000, // 5 minutes when no match (to check if match started)
  NO_MATCH: 0, // No polling when no match
} as const;

// Team IDs from SportMonks API
const TEAM_IDS = {
  MENS: 3570,
  WOMENS: 261209,
} as const;

type MatchEvent = {
  type:
    | "goal"
    | "red_card"
    | "yellow_card"
    | "half_time"
    | "second_half_start"
    | "match_end"
    | "match_start";
  team?: "home" | "away";
  playerName?: string;
  minute?: number;
  score?: { home: number; away: number };
};

type UseLiveMatchPollingProps = {
  teamType: "Mens" | "Womens";
  enabled?: boolean;
  onMatchEvent?: (event: MatchEvent) => void;
  onGoalCelebration?: (
    teamName: string,
    playerName: string,
    minute: number,
  ) => void;
};

type UseLiveMatchPollingReturn = {
  liveMatch: LiveScoreDto | null;
  isPolling: boolean;
  pollingInterval: number;
  lastUpdate: Date | null;
  error: string | null;
};

// Helper to get score from participants
const getScoreFromMatch = (
  match: LiveScoreDto,
): { home: number; away: number } => {
  const homeTeam = match.participants?.find((p) => p.location === "home");
  const awayTeam = match.participants?.find((p) => p.location === "away");

  // Count goals from events
  let homeScore = 0;
  let awayScore = 0;

  if (match.events) {
    for (const event of match.events) {
      const isGoal =
        event.typeId === EVENT_TYPES.GOAL ||
        event.typeId === EVENT_TYPES.PENALTY_GOAL;
      const isOwnGoal = event.typeId === EVENT_TYPES.OWN_GOAL;

      if (isGoal || isOwnGoal) {
        if (event.participantId === homeTeam?.id) {
          if (isOwnGoal) awayScore++;
          else homeScore++;
        } else if (event.participantId === awayTeam?.id) {
          if (isOwnGoal) homeScore++;
          else awayScore++;
        }
      }
    }
  }

  return { home: homeScore, away: awayScore };
};

// Helper to get team names
const getTeamNames = (match: LiveScoreDto): { home: string; away: string } => {
  const homeTeam = match.participants?.find((p) => p.location === "home");
  const awayTeam = match.participants?.find((p) => p.location === "away");
  return {
    home: homeTeam?.name || "Home",
    away: awayTeam?.name || "Away",
  };
};

/**
 * Smart polling hook for live match updates
 * - Only polls when there's an upcoming or live match
 * - Adjusts polling interval based on match state
 * - Sends push notifications for important events
 */
export const useLiveMatchPolling = ({
  teamType,
  enabled = true,
  onMatchEvent,
  onGoalCelebration,
}: UseLiveMatchPollingProps): UseLiveMatchPollingReturn => {
  const [liveMatch, setLiveMatch] = useState<LiveScoreDto | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs to track previous state for event detection
  const previousEventIdsRef = useRef<Set<number>>(new Set());
  const previousStateRef = useRef<number | null>(null);
  const previousScoreRef = useRef<{ home: number; away: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstFetchRef = useRef(true);

  // Send push notification for match events
  const sendEventNotification = useCallback(
    async (event: MatchEvent, match: LiveScoreDto) => {
      // Check if live match notifications are enabled
      const preferences = await notificationService.getPreferences();
      if (!preferences.enabled || !preferences.liveMatches) {
        logger.log("🔕 Live match notifications disabled, skipping");
        return;
      }

      const teams = getTeamNames(match);
      const score = getScoreFromMatch(match);
      let title = "";
      let body = "";

      switch (event.type) {
        case "goal":
          title = "⚽ GOL!";
          body = `${teams.home} ${score.home} - ${score.away} ${teams.away}`;
          if (event.playerName) {
            body += ` (${event.playerName} ${event.minute}')`;
          }
          // Goal celebration handled separately via onGoalCelebration callback
          break;

        case "red_card":
          title = "🟥 Kırmızı Kart!";
          body = event.playerName
            ? `${event.playerName} oyundan atıldı!`
            : "Bir oyuncu kırmızı kart gördü!";
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
          break;

        case "half_time":
          title = "⏸️ İlk Yarı Bitti";
          body = `${teams.home} ${score.home} - ${score.away} ${teams.away}`;
          break;

        case "second_half_start":
          title = "▶️ İkinci Yarı Başladı";
          body = `${teams.home} vs ${teams.away}`;
          break;

        case "match_start":
          title = "🏟️ Maç Başladı!";
          body = `${teams.home} vs ${teams.away}`;
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          break;

        case "match_end":
          title = "🏁 Maç Bitti";
          body = `${teams.home} ${score.home} - ${score.away} ${teams.away}`;
          break;
      }

      if (title && body) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              sound: event.type === "goal" ? "goal.wav" : "default",
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Immediate
          });
        } catch (err) {
          logger.warn("Could not send notification:", err);
        }
      }

      // Call external handler if provided
      onMatchEvent?.(event);
    },
    [onMatchEvent],
  );

  // Detect match events by comparing current and previous state
  const detectEvents = useCallback(
    (currentMatch: LiveScoreDto) => {
      const prevState = previousStateRef.current;
      const currentState = currentMatch.stateId;
      const teams = getTeamNames(currentMatch);
      const score = getScoreFromMatch(currentMatch);

      // Match just started
      if (
        prevState === MATCH_STATES.NOT_STARTED &&
        currentState === MATCH_STATES.FIRST_HALF
      ) {
        sendEventNotification({ type: "match_start" }, currentMatch);
      }

      // Half-time started
      if (
        prevState === MATCH_STATES.FIRST_HALF &&
        currentState === MATCH_STATES.HALF_TIME
      ) {
        sendEventNotification(
          {
            type: "half_time",
            score,
          },
          currentMatch,
        );
      }

      // Second half started
      if (
        prevState === MATCH_STATES.HALF_TIME &&
        currentState === MATCH_STATES.SECOND_HALF
      ) {
        sendEventNotification({ type: "second_half_start" }, currentMatch);
      }

      // Match finished
      if (
        prevState !== MATCH_STATES.FINISHED &&
        currentState === MATCH_STATES.FINISHED
      ) {
        sendEventNotification(
          {
            type: "match_end",
            score,
          },
          currentMatch,
        );
      }

      // Event detection (goals, cards)
      const prevEventIds = previousEventIdsRef.current;
      const prevScore = previousScoreRef.current;
      const homeTeam = currentMatch.participants?.find(
        (p) => p.location === "home",
      );

      // Method 1: Detect goals via events array
      if (currentMatch.events && currentMatch.events.length > 0) {
        for (const event of currentMatch.events) {
          if (!prevEventIds.has(event.id)) {
            // New event detected!
            logger.log("🆕 New event detected:", event.typeId, event.playerName);

            const isGoal =
              event.typeId === EVENT_TYPES.GOAL ||
              event.typeId === EVENT_TYPES.PENALTY_GOAL ||
              event.typeId === EVENT_TYPES.OWN_GOAL;
            const isRedCard = event.typeId === EVENT_TYPES.RED_CARD;

            if (isGoal) {
              const isHomeTeam = event.participantId === homeTeam?.id;
              const teamName = isHomeTeam ? teams.home : teams.away;

              logger.log("⚽ Goal detected via event!", teamName, event.playerName);

              sendEventNotification(
                {
                  type: "goal",
                  team: isHomeTeam ? "home" : "away",
                  playerName: event.playerName || undefined,
                  minute: event.minute || undefined,
                  score,
                },
                currentMatch,
              );

              // Trigger goal celebration callback
              onGoalCelebration?.(
                teamName,
                event.playerName || "Unknown",
                event.minute || 0,
              );
            }

            if (isRedCard) {
              logger.log("🟥 Red card detected!", event.playerName);
              sendEventNotification(
                {
                  type: "red_card",
                  playerName: event.playerName || undefined,
                  minute: event.minute || undefined,
                },
                currentMatch,
              );
            }
          }
        }

        // Update previous event IDs
        previousEventIdsRef.current = new Set(
          currentMatch.events.map((e: { id: number }) => e.id),
        );
      }

      // Method 2: Fallback - detect goals via score change (if events missed)
      if (prevScore) {
        const totalPrevGoals = prevScore.home + prevScore.away;
        const totalCurrentGoals = score.home + score.away;

        if (totalCurrentGoals > totalPrevGoals) {
          // Score increased but we didn't catch it via events
          const homeScored = score.home > prevScore.home;
          const teamName = homeScored ? teams.home : teams.away;

          // Check if we already sent notification via event detection
          const alreadyNotified = currentMatch.events?.some(
            (e) =>
              (e.typeId === EVENT_TYPES.GOAL ||
                e.typeId === EVENT_TYPES.PENALTY_GOAL ||
                e.typeId === EVENT_TYPES.OWN_GOAL) &&
              !prevEventIds.has(e.id),
          );

          if (!alreadyNotified) {
            logger.log("⚽ Goal detected via score change!", teamName);
            sendEventNotification(
              {
                type: "goal",
                team: homeScored ? "home" : "away",
                score,
              },
              currentMatch,
            );

            onGoalCelebration?.(teamName, "Unknown", 0);
          }
        }
      }

      // Update previous score
      previousScoreRef.current = score;

      // Update previous state ref
      previousStateRef.current = currentState;
    },
    [sendEventNotification, onGoalCelebration],
  );

  // Calculate appropriate polling interval
  const calculatePollingInterval = useCallback(
    (match: LiveScoreDto | null): number => {
      if (!match) return POLLING_INTERVALS.NO_MATCH;

      const stateId = match.stateId;

      // Match finished - stop polling
      if (stateId === MATCH_STATES.FINISHED) {
        return POLLING_INTERVALS.NO_MATCH;
      }

      // Match not started yet - check if it's about to start
      if (stateId === MATCH_STATES.NOT_STARTED) {
        if (match.startTime) {
          const matchTime = new Date(match.startTime);
          const now = new Date();
          const minutesUntilMatch =
            (matchTime.getTime() - now.getTime()) / (1000 * 60);

          // Start polling 5 minutes before match
          if (minutesUntilMatch <= 5 && minutesUntilMatch > 0) {
            return POLLING_INTERVALS.PRE_MATCH;
          }

          // Match should have started - poll faster to catch the start
          if (minutesUntilMatch <= 0) {
            return POLLING_INTERVALS.LIVE;
          }
        }
        return POLLING_INTERVALS.NO_MATCH;
      }

      // Half-time - poll slower
      if (stateId === MATCH_STATES.HALF_TIME) {
        return POLLING_INTERVALS.HALF_TIME;
      }

      // Live match (first or second half) - poll fast
      if (
        stateId === MATCH_STATES.FIRST_HALF ||
        stateId === MATCH_STATES.SECOND_HALF
      ) {
        return POLLING_INTERVALS.LIVE;
      }

      return POLLING_INTERVALS.NO_MATCH;
    },
    [],
  );

  // Fetch live scores
  const fetchLiveScores = useCallback(async () => {
    try {
      setError(null);
      const response = await footballService.getLiveScores();

      if (response.success && response.data && Array.isArray(response.data)) {
        logger.log("🔴 Live scores data:", response.data.length, "matches");

        // Get the correct team ID based on teamType
        const targetTeamId = teamType === "Mens" ? TEAM_IDS.MENS : TEAM_IDS.WOMENS;

        // Find match for the specific team (men's or women's)
        const amedMatch = response.data.find((match: LiveScoreDto) =>
          match.participants?.some((p) => p.id === targetTeamId),
        );

        if (amedMatch) {
          logger.log(`🏟️ ${teamType} team match found, state:`, amedMatch.stateId);

          // Detect events if we have previous state
          if (previousStateRef.current !== null) {
            detectEvents(amedMatch);
          } else {
            // First fetch - store the state and existing events
            previousStateRef.current = amedMatch.stateId;
            previousScoreRef.current = getScoreFromMatch(amedMatch);

            if (amedMatch.events) {
              previousEventIdsRef.current = new Set(
                amedMatch.events.map((e: { id: number }) => e.id),
              );
            }

            // If app opened during live match, show current status
            if (isFirstFetchRef.current) {
              isFirstFetchRef.current = false;
              const stateId = amedMatch.stateId;

              if (
                stateId === MATCH_STATES.FIRST_HALF ||
                stateId === MATCH_STATES.SECOND_HALF
              ) {
                const teams = getTeamNames(amedMatch);
                logger.log("📺 Live match in progress:", teams.home, "vs", teams.away);
              }
            }
          }

          setLiveMatch(amedMatch);
          setLastUpdate(new Date());

          // Calculate new polling interval
          const newInterval = calculatePollingInterval(amedMatch);
          setPollingInterval(newInterval);

          return amedMatch;
        } else {
          setLiveMatch(null);
          setPollingInterval(POLLING_INTERVALS.NO_MATCH);
        }
      } else {
        setLiveMatch(null);
      }
    } catch (err) {
      logger.error("Live score fetch error:", err);
      setError("Network error");
    }
    return null;
  }, [teamType, detectEvents, calculatePollingInterval]);

  // Start/stop polling based on interval
  const updatePolling = useCallback(
    (interval: number) => {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (interval > 0) {
        setIsPolling(true);
        logger.log(`⚡ Live polling: ${interval / 1000}s interval`);

        intervalRef.current = setInterval(() => {
          fetchLiveScores();
        }, interval);
      } else {
        setIsPolling(false);
        logger.log("⏸️ No active match, polling paused");
      }
    },
    [fetchLiveScores],
  );

  // Main effect - smart polling based on match state
  useEffect(() => {
    if (!enabled) {
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    logger.log("🏟️ useLiveMatchPolling: Starting for", teamType);

    // Initial fetch and smart interval setup
    const initializePolling = async () => {
      const match = await fetchLiveScores();

      // Calculate appropriate interval based on match state
      const interval = match
        ? calculatePollingInterval(match)
        : POLLING_INTERVALS.BACKGROUND_CHECK;

      if (interval > 0) {
        logger.log(`⚡ Polling interval set to ${interval / 1000}s`);
        intervalRef.current = setInterval(() => {
          fetchLiveScores();
        }, interval);
        setIsPolling(true);
        setPollingInterval(interval);
      } else {
        logger.log("⏸️ No active match, using background check interval");
        intervalRef.current = setInterval(() => {
          fetchLiveScores();
        }, POLLING_INTERVALS.BACKGROUND_CHECK);
        setIsPolling(false);
        setPollingInterval(POLLING_INTERVALS.BACKGROUND_CHECK);
      }
    };

    initializePolling();

    return () => {
      logger.log("🏟️ useLiveMatchPolling: Cleaning up");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [enabled, teamType, fetchLiveScores, calculatePollingInterval]);

  // React to match state changes - adjust polling dynamically
  useEffect(() => {
    if (!enabled) return;

    const newInterval = liveMatch
      ? calculatePollingInterval(liveMatch)
      : POLLING_INTERVALS.BACKGROUND_CHECK;

    if (newInterval !== pollingInterval && newInterval > 0) {
      updatePolling(newInterval);
      setPollingInterval(newInterval);
    }
  }, [liveMatch?.stateId, liveMatch, enabled, calculatePollingInterval, updatePolling, pollingInterval]);

  return {
    liveMatch,
    isPolling,
    pollingInterval,
    lastUpdate,
    error,
  };
};
