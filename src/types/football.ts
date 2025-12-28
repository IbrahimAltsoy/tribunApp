// Backend'den gelen DTO - exactly matches C# StandingTableDto
export interface StandingTableDto {
  position: number;
  teamName: string;
  teamLogo: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  lastFiveMatches: string[]; // ["W", "D", "L", "W", "D"] format

  // Home statistics
  homePlayed: number;
  homeWon: number;
  homeDrawn: number;
  homeLost: number;
  homeGoalsFor: number;
  homeGoalsAgainst: number;
  homeGoalDifference: number;

  // Away statistics
  awayPlayed: number;
  awayWon: number;
  awayDrawn: number;
  awayLost: number;
  awayGoalsFor: number;
  awayGoalsAgainst: number;
  awayGoalDifference: number;
}

// Backend'den gelen StandingsTableResponse - exactly matches C# StandingsTableResponse
export interface StandingsTableResponse {
  leagueName: string;
  seasonName: string;
  currentRound: number | null;
  standings: StandingTableDto[];
}

// Backend'den gelen TeamScheduleResponse - exactly matches C# TeamScheduleResponse
export interface TeamScheduleResponse {
  lastFiveMatches: MatchDetailDto[];
  upcomingFiveMatches: MatchDetailDto[];
}

// Backend'den gelen MatchDetailDto - exactly matches C# MatchDetailDto
export interface MatchDetailDto {
  fixtureId: number;
  matchDate: string; // ISO date string
  roundName: string;
  venueName: string;
  homeTeam: TeamDto;
  awayTeam: TeamDto;
  fullTimeScore: ScoreDto | null;
  halfTimeScore: ScoreDto | null;
  status: string;
}

// Backend'den gelen TeamDto - exactly matches C# TeamDto
export interface TeamDto {
  id: number;
  name: string;
  logoUrl: string | null;
}

// Backend'den gelen ScoreDto - exactly matches C# ScoreDto
export interface ScoreDto {
  home: number | null;
  away: number | null;
}

// Backend'den gelen LiveScoreDto - exactly matches C# LiveScoreDto
export interface LiveScoreDto {
  fixtureId: number;
  name: string;
  leagueId: number | null;
  seasonId: number | null;
  stageId: number | null;
  roundId: number | null;
  stateId: number | null;
  venueId: number | null;
  startTime: string; // ISO date string
  length: number | null;
  hasOdds: boolean;
  hasPremiumOdds: boolean;
  homeTeamId: number | null;
  awayTeamId: number | null;
  participants: LiveParticipantDto[];
  events: LiveEventDto[];
}

// Backend'den gelen LiveParticipantDto - exactly matches C# LiveParticipantDto
export interface LiveParticipantDto {
  id: number;
  name: string;
  shortCode: string | null;
  logo: string | null;
  location: string | null; // "home" or "away"
  position: number | null;
  winner: boolean | null;
}

// Backend'den gelen LiveEventDto - exactly matches C# LiveEventDto
export interface LiveEventDto {
  id: number;
  fixtureId: number | null;
  participantId: number | null; // Team ID
  typeId: number | null; // Event type (goal, card, etc.)
  subTypeId: number | null;
  section: string;
  periodId: number | null;
  detailedPeriodId: number | null;
  minute: number | null;
  extraMinute: number | null;
  result: string | null;
  info: string | null;
  addition: string | null;
  playerName: string | null;
  relatedPlayerName: string | null;
  rescinded: boolean | null; // Was the event cancelled?
  sortOrder: number | null;
}

// Backend'den gelen ClipContentDto - exactly matches C# ClipContentDto
export interface ClipContentDto {
  id: string;
  videoUrl: string | null; // Our hosted video or embeddable URL
  externalUrl: string | null; // External link (TRT, beIN, etc.)
  thumbnailUrl: string | null; // Preview image
  platform: string; // "x", "instagram", "youtube", "bein", "trt"
  provider: string | null; // "beIN SPORTS TR", "TRT Spor", etc.
  sortOrder: number;
  isPublished: boolean;
  title: string; // Localized title
  description: string | null; // Localized description
  createdAt: string; // ISO date string
}
