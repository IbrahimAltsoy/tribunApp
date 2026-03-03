import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";

export type PlayerDto = {
  id: string;
  name: string;
  jerseyNumber: number;
  age?: number | null;
  birthDate?: string | null;
  height?: number | null;
  weight?: number | null;
  preferredFoot?: string | null;
  marketValue?: string | null;
  imageUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  position: string;
  detailedPosition?: string | null;
  birthPlace?: string | null;
  nationality?: string | null;
  biography?: string | null;
};

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/players");

const getPlayers = async (
  teamType: "Mens" | "Womens"
): Promise<{ success: boolean; data?: PlayerDto[]; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}?teamType=${teamType}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const data = Array.isArray(json.data) ? json.data : [];

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const playerService = {
  getPlayers,
};
