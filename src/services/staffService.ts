import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";

export type StaffDto = {
  id: string;
  name: string;
  title?: string;
  biography?: string | null;
  profession?: string | null;
  imageUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  teamType?: string;
  displayOrder?: number;
};

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/staff");

const getStaff = async (
  teamType: "Mens" | "Womens"
): Promise<{ success: boolean; data?: StaffDto[]; error?: string }> => {
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

export const staffService = {
  getStaff,
};
