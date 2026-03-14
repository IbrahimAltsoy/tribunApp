import { useEffect, useRef, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { footballService } from "../services/footballService";
import { notificationService } from "../services/notificationService";
import { logger } from "../utils/logger";
import type { LiveScoreDto } from "../types/football";

// ─── Match States ────────────────────────────────────────────────────────────
const MATCH_STATES = {
  NOT_STARTED: 1,
  FIRST_HALF: 2,
  HALF_TIME: 3,
  SECOND_HALF: 4,
  FINISHED: 5,
} as const;

// ─── Event Types (SportMonks) ─────────────────────────────────────────────────
// typeId 18 & 19 = yellow card variants (confirmed from live data)
// typeId 20 = direct red card
const EVENT_TYPES = {
  GOAL: 14,
  PENALTY_GOAL: 15,
  OWN_GOAL: 16,
  SUBSTITUTION: 17,
  YELLOW_CARD: 18,
  YELLOW_CARD_2: 19, // 2nd yellow or yellow card variant
  RED_CARD: 20,
} as const;

// ─── Polling Intervals ────────────────────────────────────────────────────────
const POLL = {
  LIVE: 2000,          // 2s — active play (1st/2nd half)
  HALF_TIME: 30000,    // 30s — half-time break
  PRE_MATCH: 60000,    // 60s — within 30 min of match
  BACKGROUND: 3600000, // 60 min — no match scheduled soon
} as const;

// ─── Team IDs ────────────────────────────────────────────────────────────────
const TEAM_IDS = {
  MENS: 34,
  WOMENS: 261209,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────
type MatchEvent = {
  type:
    | "goal"
    | "own_goal"
    | "red_card"
    | "yellow_card"
    | "half_time"
    | "second_half_start"
    | "match_end"
    | "match_start"
    | "pre_match";
  team?: "home" | "away";
  playerName?: string;
  minute?: number;
  score?: { home: number; away: number };
  minutesUntil?: number;
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

export type UseLiveMatchPollingReturn = {
  liveMatch: LiveScoreDto | null;
  isPolling: boolean;
  lastUpdate: Date | null;
  error: string | null;
  displayMinute: number;
  extraTime: number | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getScoreFromMatch = (match: LiveScoreDto): { home: number; away: number } => {
  const homeTeam = match.participants?.find((p) => p.location === "home");
  const awayTeam = match.participants?.find((p) => p.location === "away");
  let homeScore = 0;
  let awayScore = 0;
  for (const event of match.events ?? []) {
    const isGoal = event.typeId === EVENT_TYPES.GOAL || event.typeId === EVENT_TYPES.PENALTY_GOAL;
    const isOwnGoal = event.typeId === EVENT_TYPES.OWN_GOAL;
    if (event.rescinded) continue;
    if (isGoal || isOwnGoal) {
      if (event.participantId === homeTeam?.id) {
        if (isOwnGoal) awayScore++; else homeScore++;
      } else if (event.participantId === awayTeam?.id) {
        if (isOwnGoal) homeScore++; else awayScore++;
      }
    }
  }
  return { home: homeScore, away: awayScore };
};

const getTeamNames = (match: LiveScoreDto): { home: string; away: string } => {
  const homeTeam = match.participants?.find((p) => p.location === "home");
  const awayTeam = match.participants?.find((p) => p.location === "away");
  return { home: homeTeam?.name || "Ev Sahibi", away: awayTeam?.name || "Deplasman" };
};

const getPollingInterval = (match: LiveScoreDto): number => {
  const stateId = match.stateId;
  if (stateId === MATCH_STATES.FINISHED) return 0;
  if (stateId === MATCH_STATES.FIRST_HALF || stateId === MATCH_STATES.SECOND_HALF) return POLL.LIVE;
  if (stateId === MATCH_STATES.HALF_TIME) return POLL.HALF_TIME;
  if (stateId === MATCH_STATES.NOT_STARTED && match.startTime) {
    const minutesUntil = (new Date(match.startTime).getTime() - Date.now()) / 60000;
    if (minutesUntil <= 0) return POLL.LIVE;  // overdue — check fast
    if (minutesUntil <= 30) return POLL.PRE_MATCH;
  }
  return 0; // background handles it
};

/**
 * Estimate current match minute from start time when clock data unavailable.
 * 1st half: elapsed since startTime, capped at 45.
 * 2nd half: elapsed since estimated 2nd half start (startTime + 60min).
 */
const estimateMinute = (match: LiveScoreDto): number => {
  if (!match.startTime) return 0;
  const startMs = new Date(match.startTime).getTime();
  const nowMs = Date.now();
  const elapsed = (nowMs - startMs) / 60000;
  if (match.stateId === MATCH_STATES.FIRST_HALF) {
    return Math.min(Math.max(1, Math.floor(elapsed)), 45);
  }
  if (match.stateId === MATCH_STATES.SECOND_HALF) {
    const est2ndStart = startMs + 60 * 60000; // startTime + 60 min
    const elapsed2nd = (nowMs - est2ndStart) / 60000;
    return Math.min(Math.max(45, 45 + Math.floor(elapsed2nd)), 90);
  }
  return 0;
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useLiveMatchPolling = ({
  teamType,
  enabled = true,
  onMatchEvent,
  onGoalCelebration,
}: UseLiveMatchPollingProps): UseLiveMatchPollingReturn => {
  const [liveMatch, setLiveMatch] = useState<LiveScoreDto | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayMinute, setDisplayMinute] = useState(0);
  const [extraTime, setExtraTime] = useState<number | null>(null);

  // Polling refs
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPollMs = useRef<number>(0);

  // State tracking refs
  const prevEventIdsRef = useRef<Set<number>>(new Set());
  const prevStateRef = useRef<number | null>(null);
  const prevScoreRef = useRef<{ home: number; away: number } | null>(null);
  const isFirstFetchRef = useRef(true);

  // Clock refs
  const clockSeedRef = useRef<{ minute: number; seedMs: number } | null>(null);
  const currentStateIdRef = useRef<number | null>(null);

  // Notification dedup refs
  const preMatchNotifMatchRef = useRef<number | null>(null);

  // ─── Local 1-second timer ──────────────────────────────────────────────────
  const stopLocalTimer = useCallback(() => {
    if (localTimerRef.current) {
      clearInterval(localTimerRef.current);
      localTimerRef.current = null;
    }
  }, []);

  const startLocalTimer = useCallback(
    (stateId: number) => {
      stopLocalTimer();
      if (
        stateId !== MATCH_STATES.FIRST_HALF &&
        stateId !== MATCH_STATES.SECOND_HALF
      )
        return;

      localTimerRef.current = setInterval(() => {
        const seed = clockSeedRef.current;
        const state = currentStateIdRef.current;
        if (!seed || !state) return;

        const elapsedMin = (Date.now() - seed.seedMs) / 60000;
        const raw = seed.minute + elapsedMin;

        if (state === MATCH_STATES.FIRST_HALF) {
          if (raw >= 45) {
            setDisplayMinute(45);
            setExtraTime(Math.floor(raw - 45));
          } else {
            setDisplayMinute(Math.floor(raw));
            setExtraTime(null);
          }
        } else {
          // 2nd half — starts at 45, goes to 90+
          if (raw >= 90) {
            setDisplayMinute(90);
            setExtraTime(Math.floor(raw - 90));
          } else {
            setDisplayMinute(Math.max(45, Math.floor(raw)));
            setExtraTime(null);
          }
        }
      }, 1000);
    },
    [stopLocalTimer],
  );

  // ─── Clear intervals ──────────────────────────────────────────────────────
  const clearPoll = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const clearBg = useCallback(() => {
    if (bgIntervalRef.current) {
      clearInterval(bgIntervalRef.current);
      bgIntervalRef.current = null;
    }
  }, []);

  // ─── Send push notification ───────────────────────────────────────────────
  const sendEventNotification = useCallback(
    async (event: MatchEvent, match: LiveScoreDto) => {
      const preferences = await notificationService.getPreferences();
      if (!preferences.enabled || !preferences.liveMatches) return;

      const teams = getTeamNames(match);
      const score = getScoreFromMatch(match);
      let title = "";
      let body = "";

      switch (event.type) {
        case "pre_match":
          title = "⚽ Maç Yakında Başlıyor!";
          body = `${teams.home} - ${teams.away} maçına ~30 dakika kaldı!`;
          break;
        case "match_start":
          title = "🏟️ Maç Başladı!";
          body = `${teams.home} vs ${teams.away}`;
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          break;
        case "goal":
          title = "⚽ GOL!";
          body = `${teams.home} ${score.home} - ${score.away} ${teams.away}`;
          if (event.playerName && event.minute) {
            body += `\n${event.playerName} ${event.minute}'`;
          }
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          break;
        case "own_goal":
          title = "⚽ Kendi Kalesine!";
          body = `${teams.home} ${score.home} - ${score.away} ${teams.away}`;
          if (event.playerName) body += ` (${event.playerName})`;
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          break;
        case "red_card":
          title = "🟥 Kırmızı Kart!";
          body = event.playerName
            ? `${event.playerName} oyundan atıldı! (${event.minute}')`
            : "Bir oyuncu kırmızı kart gördü!";
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          break;
        case "half_time":
          title = "⏸ İlk Yarı Bitti";
          body = `${teams.home} ${score.home} - ${score.away} ${teams.away}`;
          break;
        case "second_half_start":
          title = "▶️ İkinci Yarı Başladı";
          body = `${teams.home} vs ${teams.away}`;
          break;
        case "match_end":
          title = "🏁 Maç Bitti";
          body = `${teams.home} ${score.home} - ${score.away} ${teams.away} (Sonuç)`;
          break;
      }

      if (title && body) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              sound: event.type === "goal" || event.type === "own_goal" ? "goal.wav" : "default",
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
          });
        } catch (err) {
          logger.warn("Notification send failed:", err);
        }
      }

      onMatchEvent?.(event);
    },
    [onMatchEvent],
  );

  // ─── Detect new events ────────────────────────────────────────────────────
  const detectEvents = useCallback(
    (currentMatch: LiveScoreDto) => {
      const prevState = prevStateRef.current;
      const currentState = currentMatch.stateId;
      const homeTeam = currentMatch.participants?.find((p) => p.location === "home");

      // State transitions
      if (prevState === MATCH_STATES.NOT_STARTED && currentState === MATCH_STATES.FIRST_HALF) {
        sendEventNotification({ type: "match_start" }, currentMatch);
      }
      if (prevState === MATCH_STATES.FIRST_HALF && currentState === MATCH_STATES.HALF_TIME) {
        sendEventNotification({ type: "half_time" }, currentMatch);
      }
      if (prevState === MATCH_STATES.HALF_TIME && currentState === MATCH_STATES.SECOND_HALF) {
        sendEventNotification({ type: "second_half_start" }, currentMatch);
      }
      if (prevState !== MATCH_STATES.FINISHED && currentState === MATCH_STATES.FINISHED) {
        sendEventNotification({ type: "match_end" }, currentMatch);
      }

      // New event detection (goals, cards)
      const prevEventIds = prevEventIdsRef.current;
      const score = getScoreFromMatch(currentMatch);
      const teams = getTeamNames(currentMatch);

      for (const event of currentMatch.events ?? []) {
        if (prevEventIds.has(event.id) || event.rescinded) continue;

        const isGoal = event.typeId === EVENT_TYPES.GOAL || event.typeId === EVENT_TYPES.PENALTY_GOAL;
        const isOwnGoal = event.typeId === EVENT_TYPES.OWN_GOAL;
        const isRedCard = event.typeId === EVENT_TYPES.RED_CARD;

        if (isGoal || isOwnGoal) {
          const isHomeTeam = event.participantId === homeTeam?.id;
          const teamName = isHomeTeam ? teams.home : teams.away;
          const eventType = isOwnGoal ? "own_goal" : "goal";

          logger.log(`⚽ ${eventType} detected:`, teamName, event.playerName, event.minute);

          sendEventNotification(
            {
              type: eventType,
              team: isHomeTeam ? "home" : "away",
              playerName: event.playerName || undefined,
              minute: event.minute || undefined,
              score,
            },
            currentMatch,
          );

          onGoalCelebration?.(teamName, event.playerName || "", event.minute || 0);
        }

        if (isRedCard) {
          logger.log("🟥 Red card:", event.playerName);
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

      // Fallback: detect goal via score change (if event was missed)
      const prevScore = prevScoreRef.current;
      if (prevScore) {
        const totalPrev = prevScore.home + prevScore.away;
        const totalCurrent = score.home + score.away;
        if (totalCurrent > totalPrev) {
          const alreadyHandled = (currentMatch.events ?? []).some(
            (e) =>
              (e.typeId === EVENT_TYPES.GOAL || e.typeId === EVENT_TYPES.PENALTY_GOAL || e.typeId === EVENT_TYPES.OWN_GOAL) &&
              !prevEventIds.has(e.id) &&
              !e.rescinded,
          );
          if (!alreadyHandled) {
            const homeScored = score.home > prevScore.home;
            const teamName = homeScored ? teams.home : teams.away;
            logger.log("⚽ Goal via score fallback:", teamName);
            sendEventNotification({ type: "goal", team: homeScored ? "home" : "away", score }, currentMatch);
            onGoalCelebration?.(teamName, "", 0);
          }
        }
      }

      // Update tracking refs
      prevEventIdsRef.current = new Set((currentMatch.events ?? []).map((e) => e.id));
      prevScoreRef.current = score;
      prevStateRef.current = currentState;
    },
    [sendEventNotification, onGoalCelebration],
  );

  // ─── Fetch live scores ────────────────────────────────────────────────────
  const fetchLiveScores = useCallback(async (): Promise<LiveScoreDto | null> => {
    try {
      setError(null);
      const response = await footballService.getLiveScores();
      if (!response.success || !Array.isArray(response.data)) {
        setLiveMatch(null);
        return null;
      }

      const targetId = teamType === "Mens" ? TEAM_IDS.MENS : TEAM_IDS.WOMENS;
      const match = response.data.find((m: LiveScoreDto) =>
        m.participants?.some((p) => p.id === targetId),
      );

      if (!match) {
        setLiveMatch(null);
        stopLocalTimer();
        setDisplayMinute(0);
        setExtraTime(null);
        prevStateRef.current = null;
        return null;
      }

      const stateId = match.stateId;
      currentStateIdRef.current = stateId;

      // ── Update clock seed ──
      const apiMinute = match.clock?.minutes ?? null;
      const seedMinute = apiMinute !== null ? apiMinute : estimateMinute(match);
      clockSeedRef.current = { minute: seedMinute, seedMs: Date.now() };

      // ── Update display immediately (then 1s timer refines it) ──
      if (stateId === MATCH_STATES.FIRST_HALF || stateId === MATCH_STATES.SECOND_HALF) {
        const addedTime = match.clock?.addedTime ?? null;
        if (seedMinute >= 45 && stateId === MATCH_STATES.FIRST_HALF) {
          setDisplayMinute(45);
          setExtraTime(addedTime ?? Math.floor(seedMinute - 45));
        } else if (seedMinute >= 90 && stateId === MATCH_STATES.SECOND_HALF) {
          setDisplayMinute(90);
          setExtraTime(addedTime ?? Math.floor(seedMinute - 90));
        } else {
          setDisplayMinute(Math.max(stateId === MATCH_STATES.SECOND_HALF ? 45 : 0, seedMinute));
          setExtraTime(null);
        }
        startLocalTimer(stateId);
      } else {
        stopLocalTimer();
        setDisplayMinute(0);
        setExtraTime(null);
      }

      // ── Pre-match notification (30 min before) ──
      if (stateId === MATCH_STATES.NOT_STARTED && match.startTime) {
        const minutesUntil = (new Date(match.startTime).getTime() - Date.now()) / 60000;
        if (
          minutesUntil > 0 &&
          minutesUntil <= 31 &&
          preMatchNotifMatchRef.current !== match.fixtureId
        ) {
          preMatchNotifMatchRef.current = match.fixtureId;
          sendEventNotification({ type: "pre_match", minutesUntil: Math.floor(minutesUntil) }, match);
        }
      }

      // ── Event detection ──
      if (prevStateRef.current !== null) {
        detectEvents(match);
      } else {
        // First fetch — initialize tracking, don't send duplicate notifications
        prevStateRef.current = stateId;
        prevScoreRef.current = getScoreFromMatch(match);
        prevEventIdsRef.current = new Set((match.events ?? []).map((e: { id: number }) => e.id));
        isFirstFetchRef.current = false;
      }

      setLiveMatch(match);
      setLastUpdate(new Date());
      return match;
    } catch (err) {
      logger.error("Live score fetch error:", err);
      setError("Ağ hatası");
      return null;
    }
  }, [teamType, detectEvents, sendEventNotification, startLocalTimer, stopLocalTimer]);

  // ─── Schedule polling based on match state ─────────────────────────────────
  const schedulePoll = useCallback(
    (match: LiveScoreDto | null) => {
      clearPoll();
      clearBg();

      if (!match) {
        // No match — background check every 30 min
        bgIntervalRef.current = setInterval(async () => {
          const m = await fetchLiveScores();
          schedulePoll(m);
        }, POLL.BACKGROUND);
        setIsPolling(false);
        currentPollMs.current = POLL.BACKGROUND;
        return;
      }

      const interval = getPollingInterval(match);

      if (interval === 0) {
        // Finished or far pre-match — background check
        bgIntervalRef.current = setInterval(async () => {
          const m = await fetchLiveScores();
          schedulePoll(m);
        }, POLL.BACKGROUND);
        setIsPolling(false);
        currentPollMs.current = POLL.BACKGROUND;
        return;
      }

      if (currentPollMs.current === interval) return; // Same interval — no change needed

      currentPollMs.current = interval;
      pollIntervalRef.current = setInterval(async () => {
        const m = await fetchLiveScores();
        if (m && getPollingInterval(m) !== interval) {
          schedulePoll(m); // State changed — reschedule
        }
      }, interval);
      setIsPolling(interval <= POLL.PRE_MATCH);
    },
    [clearPoll, clearBg, fetchLiveScores],
  );

  // ─── Main effect ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      clearPoll();
      clearBg();
      stopLocalTimer();
      setIsPolling(false);
      return;
    }

    const init = async () => {
      currentPollMs.current = 0; // Force schedule
      const match = await fetchLiveScores();
      schedulePoll(match);
    };

    init();

    return () => {
      clearPoll();
      clearBg();
      stopLocalTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, teamType]);

  return {
    liveMatch,
    isPolling,
    lastUpdate,
    error,
    displayMinute,
    extraTime,
  };
};
