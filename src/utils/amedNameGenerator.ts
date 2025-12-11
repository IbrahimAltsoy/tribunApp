/**
 * Amedspor Themed Anonymous Nickname Generator
 * Generates fun, themed nicknames for anonymous chat users
 */

const colors = [
  "Kırmızı",
  "Yeşil",
  "Sarı",
  "Beyaz",
  "Siyah",
  "Turuncu",
  "Mavi",
];

const animals = [
  "Aslan",
  "Kartal",
  "Kurt",
  "Pars",
  "Şahin",
  "Kaplan",
  "Yıldırım",
];

const positions = [
  "10 Numara",
  "Golcü",
  "Forvet",
  "Defans",
  "Kaleci",
  "Orta Saha",
  "Kanat",
  "Libero",
];

const tribun = [
  "Tribün Lideri",
  "Kale Arkası",
  "12. Adam",
  "Tribün Sesi",
  "Taraftar",
  "Maraton",
  "Kırmızı Duvar",
  "Yeşil Kalp",
];

const football = [
  "Şut Ustası",
  "Pas Makinesi",
  "Dribleci",
  "Gol Avcısı",
  "Duvar Örücü",
  "Hücum Şimşeği",
  "Savunma Kalkanı",
  "Oyun Kurucu",
];

/**
 * Generate a random Amedspor-themed nickname
 */
export const generateAmedNickname = (): string => {
  const categories = [
    // Color + Animal (e.g., "Kırmızı Aslan")
    () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const animal = animals[Math.floor(Math.random() * animals.length)];
      return `${color} ${animal}`;
    },
    // Position (e.g., "10 Numara")
    () => positions[Math.floor(Math.random() * positions.length)],
    // Tribun (e.g., "Kale Arkası")
    () => tribun[Math.floor(Math.random() * tribun.length)],
    // Football (e.g., "Gol Avcısı")
    () => football[Math.floor(Math.random() * football.length)],
    // Color + Football (e.g., "Kırmızı Şimşek")
    () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const skill = football[Math.floor(Math.random() * football.length)];
      return `${color} ${skill.split(" ")[0]}`;
    },
  ];

  // Randomly select a category
  const selectedCategory =
    categories[Math.floor(Math.random() * categories.length)];
  return selectedCategory();
};

/**
 * Generate multiple unique nicknames at once
 */
export const generateMultipleNicknames = (count: number = 5): string[] => {
  const nicknames = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10; // Prevent infinite loop

  while (nicknames.size < count && attempts < maxAttempts) {
    nicknames.add(generateAmedNickname());
    attempts++;
  }

  return Array.from(nicknames);
};
