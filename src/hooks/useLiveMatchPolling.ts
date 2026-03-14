import { useEffect, useRef, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { footballService } from "../services/footballService";
import { notificationService } from "../services/notificationService";
import { logger } from "../utils/logger";
import type { LiveScoreDto } from "../types/football";

// ─── Match States (SportMonks v3 state_ids) ───────────────────────────────────
// Confirmed from live match data (GS vs Başakşehir 14.03.2026):
//   1=NS, 2=1H, 3=HT, 22=2H(LIVE), 5=FT
// NOTE: 5 is Full Time in SportMonks v3, NOT second half!
const MATCH_STATES = {
  NOT_STARTED: 1,
  FIRST_HALF: 2,   // 1H
  HALF_TIME: 3,    // HT
  LIVE: 22,        // 2nd half live (confirmed)
  FINISHED: 5,     // FT — confirmed SportMonks stateId for Full Time
} as const;

// stateId values that represent a finished/ended match (FT, AET, Pen, etc.)
const FINISHED_STATES = new Set([5, 6, 7, 8, 9]);

// stateId values that represent active in-play (1st or 2nd half)
const LIVE_PLAY_STATES = new Set([MATCH_STATES.FIRST_HALF, MATCH_STATES.LIVE]);
// stateId values that are 2nd-half-like (for minute estimation and label)
const SECOND_HALF_STATES = new Set([MATCH_STATES.LIVE]);

// ─── Event Types (SportMonks) — confirmed from live match data ────────────────
// 14=Goal, 15=PenaltyGoal, 16=OwnGoal
// 18=Substitution, 19=YellowCard, 20=DirectRedCard, 21=YellowRedCard (2nd yellow)
const EVENT_TYPES = {
  GOAL: 14,
  PENALTY_GOAL: 15,
  OWN_GOAL: 16,
  SUBSTITUTION: 18,   // confirmed: typeId 18 = substitution
  YELLOW_CARD: 19,    // confirmed: typeId 19 = yellow card
  RED_CARD: 20,       // direct red card
  YELLOW_RED: 21,     // confirmed: typeId 21 = yellow/red (2nd yellow)
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
  if (FINISHED_STATES.has(stateId ?? -1)) return 0;
  if (LIVE_PLAY_STATES.has(stateId ?? -1)) return POLL.LIVE;
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
 * 1st half : elapsed since startTime, capped at 45.
 * 2nd half : use secondHalfDetectedAt timestamp if available (most accurate),
 *            otherwise fall back to startTime + 63 min constant.
 */
const estimateMinute = (
  match: LiveScoreDto,
  secondHalfDetectedAt: number | null,
): number => {
  if (!match.startTime) return 0;
  const startMs = new Date(match.startTime).getTime();
  const nowMs = Date.now();
  const elapsed = (nowMs - startMs) / 60000;
  if (match.stateId === MATCH_STATES.FIRST_HALF) {
    return Math.min(Math.max(1, Math.floor(elapsed)), 45);
  }
  if (SECOND_HALF_STATES.has(match.stateId ?? -1)) {
    if (secondHalfDetectedAt !== null) {
      // Most accurate: count from when we first saw 2nd half start
      const elapsed2nd = (nowMs - secondHalfDetectedAt) / 60000;
      return Math.min(Math.max(45, 45 + Math.floor(elapsed2nd)), 90);
    }
    // Fallback: startTime + 63 min (45 min 1H + ~3 min stoppage + 15 min HT)
    const est2ndStart = startMs + 63 * 60000;
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
  // Timestamp of when we first detected 2nd half — used for accurate minute estimation
  const secondHalfDetectedAtRef = useRef<number | null>(null);

  // Last known match — used to send match_end when match disappears from inplay
  const lastKnownMatchRef = useRef<LiveScoreDto | null>(null);

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
      if (!LIVE_PLAY_STATES.has(stateId))
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
      if (prevState === MATCH_STATES.HALF_TIME && SECOND_HALF_STATES.has(currentState ?? -1)) {
        secondHalfDetectedAtRef.current = Date.now(); // Record 2nd half start for accurate minute
        sendEventNotification({ type: "second_half_start" }, currentMatch);
      }
      // Also set if first time we see 2nd half (app opened mid-game after halftime)
      if (SECOND_HALF_STATES.has(currentState ?? -1) && secondHalfDetectedAtRef.current === null) {
        secondHalfDetectedAtRef.current = null; // stays null → fallback estimation will be used
      }
      if (!FINISHED_STATES.has(prevState ?? -1) && FINISHED_STATES.has(currentState ?? -1)) {
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
        const isRedCard = event.typeId === EVENT_TYPES.RED_CARD || event.typeId === EVENT_TYPES.YELLOW_RED;

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
        // If we were tracking a live game that just vanished from inplay → it ended
        if (LIVE_PLAY_STATES.has(prevStateRef.current ?? -1) && lastKnownMatchRef.current) {
          sendEventNotification({ type: "match_end" }, lastKnownMatchRef.current);
        }
        lastKnownMatchRef.current = null;
        setLiveMatch(null);
        stopLocalTimer();
        setDisplayMinute(0);
        setExtraTime(null);
        prevStateRef.current = null;
        secondHalfDetectedAtRef.current = null;
        return null;
      }

      const stateId = match.stateId;
      currentStateIdRef.current = stateId;

      // ── Update clock seed ──
      const apiMinute = match.clock?.minutes ?? null;
      let seedMinute: number;
      if (apiMinute !== null) {
        seedMinute = apiMinute;
      } else if (SECOND_HALF_STATES.has(stateId ?? -1)) {
        // Best available proxy: max event minute in 2nd half (e.g. last goal/card at 70' → seed=70)
        const maxEventMin = (match.events ?? [])
          .filter((e) => !e.rescinded && (e.minute ?? 0) > 45)
          .reduce((max, e) => Math.max(max, e.minute ?? 0), 0);
        if (maxEventMin > 45) {
          seedMinute = maxEventMin;
        } else {
          // No 2nd-half events yet — count from detection timestamp
          if (secondHalfDetectedAtRef.current === null) {
            secondHalfDetectedAtRef.current = Date.now();
          }
          const elapsed2nd = (Date.now() - secondHalfDetectedAtRef.current) / 60000;
          seedMinute = Math.min(45 + Math.floor(elapsed2nd), 90);
        }
      } else {
        seedMinute = estimateMinute(match, secondHalfDetectedAtRef.current);
      }
      // Only update seed if new value is HIGHER than what timer is currently showing.
      // This lets the 1-second timer count up naturally between events (ratchet effect).
      const currentShown = clockSeedRef.current
        ? clockSeedRef.current.minute + (Date.now() - clockSeedRef.current.seedMs) / 60000
        : -1;
      if (seedMinute > currentShown) {
        clockSeedRef.current = { minute: seedMinute, seedMs: Date.now() };
      }

      // ── Update display immediately (then 1s timer refines it) ──
      const isSecondHalfLike = SECOND_HALF_STATES.has(stateId ?? -1);
      if (LIVE_PLAY_STATES.has(stateId ?? -1)) {
        const addedTime = match.clock?.addedTime ?? null;
        // Extra time display is driven by clock data only (no clock = null)
        setExtraTime(addedTime);
        // Let the 1-second timer be the SOLE source of displayMinute updates.
        // Only start if not already running — prevents restart every 2 s poll cycle.
        // The timer reads currentStateIdRef so it handles 1H→2H transitions automatically.
        if (!localTimerRef.current) {
          startLocalTimer(stateId ?? 0);
        }
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

      lastKnownMatchRef.current = match;
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
