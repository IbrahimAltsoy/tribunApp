export type KitDto = {
  id: string;
  name: string;
  description?: string | null;
  season: string;
  imageUrl?: string | null;
  teamType?: string;
};

export type KitItem = {
  id: string;
  season: string;
  title: string;
  note: string;
  colors?: string[];
  image?: { uri: string };
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/kits`;

const mapKit = (kit: KitDto): KitItem => ({
  id: kit.id,
  season: kit.season,
  title: kit.name,
  note: kit.description || "",
  image: kit.imageUrl ? { uri: kit.imageUrl } : undefined,
});

const getKits = async (
  teamType: "Mens" | "Womens"
): Promise<{ success: boolean; data?: KitItem[]; error?: string }> => {
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
      data: data.map(mapKit),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const kitService = {
  getKits,
};
