import { ImageSourcePropType } from "react-native";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  time: string;
  category: string;
  image?: ImageSourcePropType;
  body?: string[];
};

export type FixtureItem = {
  id: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  competition: string;
  isHome: boolean;
  status?: "upcoming" | "live" | "finished";
  score?: string;
};

export type ExternalClip = {
  platform: "youtube" | "bein" | "trt" | "x" | "instagram";
  provider: string;
  url: string;
  embedUrl?: string;
  note?: string;
};

export type LiveEvent = {
  id: string;
  minute: number;
  team: "home" | "away";
  type: "goal" | "card" | "var" | "sub";
  player: string;
  detail: string;
  clip?: ExternalClip;
  videoUrl?: string;
  thumb?: ImageSourcePropType;
  thumbUrl?: string;
};

export type StandingRow = {
  pos: number;
  team: string;
  mp: number; // Oynanan (Played)
  w: number;  // Galibiyet (Won)
  d: number;  // Berabere (Drawn)
  l: number;  // Mağlubiyet (Lost)
  gf: number; // Atılan Gol (Goals For)
  ga: number; // Yenilen Gol (Goals Against)
  gd: number; // Averaj (Goal Difference)
  pts: number; // Puan (Points)
  positionChange?: number; // +1, -2, 0 etc. for arrows
  logo?: string; // Team logo URL or placeholder
};

export type Legend = {
  id: string;
  name: string;
  role: string;
  years: string;
  highlight: string;
};

export type Player = {
  id: string;
  name: string;
  position: string;
  number: number;
  age: number;
  height: string;
  foot: "Right" | "Left" | "Both";
  bio: string;
  strengths: string[];
  hometown?: string;
  matches?: number;
  goals?: number;
  assists?: number;
  rating?: number;
  career?: string[];
  image?: ImageSourcePropType;
};

export type KitItem = {
  id: string;
  season: string;
  title: string;
  palette: string;
  note: string;
  colors?: string[];
  image?: ImageSourcePropType;
};

export type PollOption = { id: string; text: string; votes: number };

export type Poll = {
  id: string;
  question: string;
  closesIn: string;
  options: PollOption[];
};

export type Announcement = {
  id: string;
  title: string;
  city: string;
  location: string;
  date: string;
  link?: string;
  contact: string;
  note: string;
  status?: "pending" | "approved" | "rejected";
};

export type FanMoment = {
  id: string;
  user: string;
  location: string;
  caption: string;
  time: string;
  timestamp?: string;
  source: "Tribun" | "Sehir Meydani" | "Ev/Izleme";
  image?: ImageSourcePropType;
};

export type MatchResult = {
  id: string;
  week: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition?: string;
};

export type UpcomingMatch = {
  id: string;
  week: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string;
  competition?: string;
};

export type LeagueLegendItem = {
  id: string;
  color: string;
  label: string;
  description: string;
  positions?: string; // e.g., "1-2" or "3-5"
};

export type ChatMessage = {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isMine?: boolean;
  isRead?: boolean;
};

export type MatchRoomPhase = "pre" | "post";

export type MatchRoom = {
  id: string;
  title: string;
  time: string;
  phase: MatchRoomPhase;
  status?: "upcoming" | "live" | "finished";
  messages: ChatMessage[];
};

export const newsData: NewsItem[] = [
  {
    id: "n1",
    title: "Derbi oncesi son dokunuslar",
    summary:
      "Takim son idmaninda tempolu pres ve gecis oyunu uzerine calisti. Tribun provasi yapildi, 11 netlesti.",
    time: "2s",
    category: "Kulup",
    image: require("../assets/footboll/2.jpg"),
    body: [
      "Stoper hattinda rotasyon denense de teknik ekip savunma uyumundan memnun. Kanatlarda hizli cikislar icin set calismasi tamamlandi.",
      "Taraftar gruplari mac oncesi koreografi ve tezahurat provasi icin stadyumda bulustu.",
    ],
  },
  {
    id: "n2",
    title: "Genclerden guclu mesaj",
    summary:
      "Altyapidan cikan uc oyuncu ilk 11 kapisini zorluyor. Teknik ekipten destek tam.",
    time: "4s",
    category: "Akademi",
    image: require("../assets/footboll/2.jpg"),
    body: [
      "18'lik orta saha Hasan, sabah idmaninda pres calismalariyla dikkat cekti. Fiziksel hazirligi icin ozel program uygulanacak.",
      "Forvette yer alan Emre ve kanatta oynayan Rojda icin topsuz kosu ve final vuruslari takibi yapiliyor.",
    ],
  },
  {
    id: "n3",
    title: "Diyarbakir'da tribun koreografisi",
    summary:
      "Kapali tribune 18 parcali yesil-kirmizi koreografi maketi tamamlandi, gonulluler hazir.",
    time: "6s",
    category: "Taraftar",
    image: require("../assets/footboll/3.jpg"),
    body: [
      "Sur motiflerinden ilham alan tasarimda 30 metre uzunlugunda pankart kullanilacak. Boyama ve dikis ekibi gece mesaisi yapti.",
      "Gonulluler, mac gunu sabahi stadyumda bulusarak tribunu donatacak.",
    ],
  },
  {
    id: "n4",
    title: "Analiz: Hucumda yeni sablon",
    summary:
      "6 numaranin cikislariyla cizgiye inen beklerin ceza sahasi kosulari: son uc macin veri okumasi.",
    time: "1g",
    category: "Analiz",
    image: require("../assets/footboll/4.jpg"),
    body: [
      "On liberonun merkezden ciktigi anlarda beklerin ic koridoru kullanmasi dikkat cekiyor. Bu hareketlilik rakip ceza sahasinda ekstra adam yaratiyor.",
      "Veri seti, son uc macta ceza sahasi ici sut sayisinda yuzde 14 artis oldugunu gosteriyor.",
    ],
  },
  {
    id: "n5",
    title: "Transfer masasi: kanada takviye",
    summary:
      "Yonetim, hizli kanat oyuncusu icin uclu aday listesi olusturdu. Gorusmeler hafta icinde hizlanacak.",
    time: "2g",
    category: "Transfer",
    image: require("../assets/footboll/2.jpg"),
    body: [
      "Scout ekibi bir sol kanat ve bir sag kanat icin ayrintili rapor sunacak. Onceki sezon istatistikleri ve sakatlik gecmisi inceleniyor.",
      "Takimin bu sezon ortalama 1.9 gol katkisi alan kanatlari icin hedef, daha cok bire bir yetenegi olan oyuncu eklemek.",
    ],
  },
];

export const fixtureData: FixtureItem[] = [
  {
    id: "f1",
    opponent: "Kocaelispor",
    date: "08 Aralık",
    time: "19:00",
    venue: "Diyarbakır Stadyumu",
    competition: "Trendyol 1. Lig",
    isHome: true,
    status: "upcoming",
  },
  {
    id: "f2",
    opponent: "Bandırmaspor",
    date: "14 Aralık",
    time: "16:00",
    venue: "Bandırma 17 Eylül",
    competition: "Trendyol 1. Lig",
    isHome: false,
    status: "upcoming",
  },
  {
    id: "f3",
    opponent: "Sakaryaspor",
    date: "21 Aralık",
    time: "20:00",
    venue: "Diyarbakır Stadyumu",
    competition: "Ziraat Türkiye Kupası",
    isHome: true,
    status: "upcoming",
  },
];

export const liveMatch = {
  home: "Amedspor",
  away: "Kocaelispor",
  score: "2 - 1",
  minute: 74,
  status: "CANLI",
  events: [
    {
      id: "e1",
      minute: 12,
      team: "home",
      type: "goal",
      player: "Ahmet Derin",
      detail: "Sol caprazdan plase, ust kose.",
      clip: {
        platform: "bein",
        provider: "beIN SPORTS TR (YouTube)",
        url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        embedUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ?autoplay=1&mute=1",
        note: "beIN Sports kanalindan gol tekrari.",
      },
      thumb: require("../assets/footboll/1.jpg"),
      thumbUrl:
        "https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
    },
    {
      id: "e2",
      minute: 33,
      team: "away",
      type: "goal",
      player: "Mehmet Kaya",
      detail: "Kafa vurus, skor 1-1.",
      clip: {
        platform: "trt",
        provider: "TRT Spor YouTube",
        url: "https://www.youtube.com/watch?v=7QUtEmBT_-w",
        embedUrl: "https://www.youtube.com/embed/7QUtEmBT_-w?autoplay=1&mute=1",
        note: "TRT Spor'un yayina aldigi pozisyon tekrari.",
      },
      thumb: require("../assets/footboll/2.jpg"),
      thumbUrl: "https://img.youtube.com/vi/7QUtEmBT_-w/hqdefault.jpg",
    },
    {
      id: "e3",
      minute: 55,
      team: "home",
      type: "goal",
      player: "Jiyan Karadayi",
      detail: "Ceza sahasi karambolu sonrasi tamamlandi.",
      clip: {
        platform: "x",
        provider: "X / Twitter",
        url: "https://x.com/Football__Tweet/status/1700152540103938129",
        note: "X uzerinde paylasilan taraftar videosu.",
      },
      thumb: require("../assets/footboll/3.jpg"),
    },
    {
      id: "e4",
      minute: 68,
      team: "home",
      type: "card",
      player: "Musa Bulut",
      detail: "Sert mudahale, sari kart.",
      clip: {
        platform: "instagram",
        provider: "Instagram Reels",
        url: "https://www.instagram.com/reel/CuPj7yLMJhQ/",
        embedUrl: "https://www.instagram.com/reel/CuPj7yLMJhQ/embed",
        note: "Instagram'da paylasilan pozisyon.",
      },
      thumb: require("../assets/footboll/4.jpg"),
    },
  ] as LiveEvent[],
};

// Men's Team Standings (TFF 1. Lig 2024-25)
export const mensStandings: StandingRow[] = [
  {
    pos: 1,
    team: "Kocaelispor",
    mp: 18,
    w: 12,
    d: 4,
    l: 2,
    gf: 35,
    ga: 14,
    gd: 21,
    pts: 40,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/0FA958/FFFFFF?text=KO",
  },
  {
    pos: 2,
    team: "Amedspor",
    mp: 18,
    w: 11,
    d: 5,
    l: 2,
    gf: 32,
    ga: 13,
    gd: 19,
    pts: 38,
    positionChange: 1,
    logo: "https://via.placeholder.com/32/D10E0E/FFEB3B?text=AM",
  },
  {
    pos: 3,
    team: "Sakaryaspor",
    mp: 18,
    w: 10,
    d: 6,
    l: 2,
    gf: 28,
    ga: 15,
    gd: 13,
    pts: 36,
    positionChange: -1,
    logo: "https://via.placeholder.com/32/00AA00/FFFFFF?text=SA",
  },
  {
    pos: 4,
    team: "Erzurumspor",
    mp: 18,
    w: 10,
    d: 5,
    l: 3,
    gf: 26,
    ga: 16,
    gd: 10,
    pts: 35,
    positionChange: 2,
    logo: "https://via.placeholder.com/32/0044AA/FFFFFF?text=ER",
  },
  {
    pos: 5,
    team: "Bandırmaspor",
    mp: 18,
    w: 9,
    d: 6,
    l: 3,
    gf: 24,
    ga: 17,
    gd: 7,
    pts: 33,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/CC0000/FFFFFF?text=BA",
  },
  {
    pos: 6,
    team: "İstanbulspor",
    mp: 18,
    w: 9,
    d: 4,
    l: 5,
    gf: 27,
    ga: 19,
    gd: 8,
    pts: 31,
    positionChange: -2,
    logo: "https://via.placeholder.com/32/FFAA00/000000?text=IS",
  },
  {
    pos: 7,
    team: "İğdır FK",
    mp: 18,
    w: 8,
    d: 6,
    l: 4,
    gf: 23,
    ga: 18,
    gd: 5,
    pts: 30,
    positionChange: 1,
    logo: "https://via.placeholder.com/32/008844/FFFFFF?text=IG",
  },
  {
    pos: 8,
    team: "Yeni Malatyaspor",
    mp: 18,
    w: 8,
    d: 5,
    l: 5,
    gf: 22,
    ga: 19,
    gd: 3,
    pts: 29,
    positionChange: -1,
    logo: "https://via.placeholder.com/32/FFA500/000000?text=MA",
  },
  {
    pos: 9,
    team: "Şanlıurfaspor",
    mp: 18,
    w: 7,
    d: 7,
    l: 4,
    gf: 21,
    ga: 18,
    gd: 3,
    pts: 28,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/009900/FFFFFF?text=SU",
  },
  {
    pos: 10,
    team: "Ankaragücü",
    mp: 18,
    w: 7,
    d: 6,
    l: 5,
    gf: 19,
    ga: 17,
    gd: 2,
    pts: 27,
    positionChange: 2,
    logo: "https://via.placeholder.com/32/FFDD00/000000?text=AN",
  },
  {
    pos: 11,
    team: "Boluspor",
    mp: 18,
    w: 6,
    d: 8,
    l: 4,
    gf: 20,
    ga: 18,
    gd: 2,
    pts: 26,
    positionChange: -1,
    logo: "https://via.placeholder.com/32/CC0000/FFFFFF?text=BO",
  },
  {
    pos: 12,
    team: "Manisa FK",
    mp: 18,
    w: 6,
    d: 7,
    l: 5,
    gf: 18,
    ga: 17,
    gd: 1,
    pts: 25,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/AA0000/FFFFFF?text=MN",
  },
  {
    pos: 13,
    team: "Keçiörengücü",
    mp: 18,
    w: 5,
    d: 8,
    l: 5,
    gf: 17,
    ga: 18,
    gd: -1,
    pts: 23,
    positionChange: -2,
    logo: "https://via.placeholder.com/32/0066CC/FFFFFF?text=KE",
  },
  {
    pos: 14,
    team: "Pendikspor",
    mp: 18,
    w: 5,
    d: 7,
    l: 6,
    gf: 16,
    ga: 19,
    gd: -3,
    pts: 22,
    positionChange: 1,
    logo: "https://via.placeholder.com/32/009933/FFFFFF?text=PE",
  },
  {
    pos: 15,
    team: "Çorum FK",
    mp: 18,
    w: 4,
    d: 8,
    l: 6,
    gf: 15,
    ga: 20,
    gd: -5,
    pts: 20,
    positionChange: -1,
    logo: "https://via.placeholder.com/32/006633/FFFFFF?text=CO",
  },
  {
    pos: 16,
    team: "Gençlerbirliği",
    mp: 18,
    w: 4,
    d: 6,
    l: 8,
    gf: 14,
    ga: 22,
    gd: -8,
    pts: 18,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/DD0000/000000?text=GE",
  },
  {
    pos: 17,
    team: "Ümraniyespor",
    mp: 18,
    w: 3,
    d: 7,
    l: 8,
    gf: 13,
    ga: 24,
    gd: -11,
    pts: 16,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/FFAA00/000000?text=UM",
  },
  {
    pos: 18,
    team: "Adanaspor",
    mp: 18,
    w: 2,
    d: 5,
    l: 11,
    gf: 11,
    ga: 28,
    gd: -17,
    pts: 11,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/0066FF/FFFFFF?text=AD",
  },
];

// Women's Team Standings (Kadınlar 1. Ligi 2024-25)
export const womensStandings: StandingRow[] = [
  {
    pos: 1,
    team: "Beşiktaş",
    mp: 14,
    w: 13,
    d: 1,
    l: 0,
    gf: 52,
    ga: 5,
    gd: 47,
    pts: 40,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/000000/FFFFFF?text=BE",
  },
  {
    pos: 2,
    team: "Amed SK",
    mp: 14,
    w: 10,
    d: 3,
    l: 1,
    gf: 38,
    ga: 12,
    gd: 26,
    pts: 33,
    positionChange: 1,
    logo: "https://via.placeholder.com/32/D10E0E/FFEB3B?text=AM",
  },
  {
    pos: 3,
    team: "Fenerbahçe",
    mp: 14,
    w: 10,
    d: 2,
    l: 2,
    gf: 35,
    ga: 11,
    gd: 24,
    pts: 32,
    positionChange: -1,
    logo: "https://via.placeholder.com/32/FFEB3B/000066?text=FB",
  },
  {
    pos: 4,
    team: "Galatasaray",
    mp: 14,
    w: 9,
    d: 3,
    l: 2,
    gf: 32,
    ga: 13,
    gd: 19,
    pts: 30,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/FFA500/CC0000?text=GS",
  },
  {
    pos: 5,
    team: "Trabzonspor",
    mp: 14,
    w: 8,
    d: 4,
    l: 2,
    gf: 28,
    ga: 15,
    gd: 13,
    pts: 28,
    positionChange: 2,
    logo: "https://via.placeholder.com/32/660066/00CCCC?text=TR",
  },
  {
    pos: 6,
    team: "Kayseri Spor",
    mp: 14,
    w: 7,
    d: 5,
    l: 2,
    gf: 24,
    ga: 14,
    gd: 10,
    pts: 26,
    positionChange: -1,
    logo: "https://via.placeholder.com/32/CC0000/FFDD00?text=KA",
  },
  {
    pos: 7,
    team: "Hatayspor",
    mp: 14,
    w: 6,
    d: 5,
    l: 3,
    gf: 21,
    ga: 16,
    gd: 5,
    pts: 23,
    positionChange: 1,
    logo: "https://via.placeholder.com/32/990000/FFFFFF?text=HA",
  },
  {
    pos: 8,
    team: "Ereğli Belediyespor",
    mp: 14,
    w: 5,
    d: 6,
    l: 3,
    gf: 18,
    ga: 15,
    gd: 3,
    pts: 21,
    positionChange: -2,
    logo: "https://via.placeholder.com/32/006600/FFFFFF?text=ER",
  },
  {
    pos: 9,
    team: "Kırklarelispor",
    mp: 14,
    w: 4,
    d: 5,
    l: 5,
    gf: 15,
    ga: 19,
    gd: -4,
    pts: 17,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/0099CC/FFFFFF?text=KI",
  },
  {
    pos: 10,
    team: "1207 Antalyaspor",
    mp: 14,
    w: 3,
    d: 6,
    l: 5,
    gf: 13,
    ga: 21,
    gd: -8,
    pts: 15,
    positionChange: 1,
    logo: "https://via.placeholder.com/32/CC0000/FFFFFF?text=AN",
  },
  {
    pos: 11,
    team: "Siirt İl Özel İdare",
    mp: 14,
    w: 3,
    d: 4,
    l: 7,
    gf: 11,
    ga: 25,
    gd: -14,
    pts: 13,
    positionChange: -1,
    logo: "https://via.placeholder.com/32/009933/FFFFFF?text=SI",
  },
  {
    pos: 12,
    team: "Bayburt İÖİ",
    mp: 14,
    w: 2,
    d: 5,
    l: 7,
    gf: 10,
    ga: 28,
    gd: -18,
    pts: 11,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/336699/FFFFFF?text=BA",
  },
  {
    pos: 13,
    team: "Yeni Orduspor",
    mp: 14,
    w: 1,
    d: 6,
    l: 7,
    gf: 8,
    ga: 30,
    gd: -22,
    pts: 9,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/006633/FFFFFF?text=OR",
  },
  {
    pos: 14,
    team: "Karacabey Belediyespor",
    mp: 14,
    w: 0,
    d: 3,
    l: 11,
    gf: 5,
    ga: 45,
    gd: -40,
    pts: 3,
    positionChange: 0,
    logo: "https://via.placeholder.com/32/003366/FFFFFF?text=KB",
  },
];

// Keep old export for backward compatibility
export const standings: StandingRow[] = mensStandings;

// Men's Team - Past Results (Last 5 Weeks: Week 10-14)
export const mensPastResults: MatchResult[] = [
  // Week 10
  { id: "mr10-1", week: 10, date: "18/11", homeTeam: "Amedspor", awayTeam: "Gençlerbirliği", homeScore: 2, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr10-2", week: 10, date: "18/11", homeTeam: "Kocaelispor", awayTeam: "Pendikspor", homeScore: 3, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr10-3", week: 10, date: "17/11", homeTeam: "Sakaryaspor", awayTeam: "Çorum FK", homeScore: 1, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr10-4", week: 10, date: "17/11", homeTeam: "Erzurumspor", awayTeam: "Adanaspor", homeScore: 4, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr10-5", week: 10, date: "18/11", homeTeam: "Bandırmaspor", awayTeam: "Ümraniyespor", homeScore: 2, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr10-6", week: 10, date: "17/11", homeTeam: "İstanbulspor", awayTeam: "İğdır FK", homeScore: 1, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr10-7", week: 10, date: "18/11", homeTeam: "Yeni Malatyaspor", awayTeam: "Keçiörengücü", homeScore: 3, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr10-8", week: 10, date: "17/11", homeTeam: "Şanlıurfaspor", awayTeam: "Manisa FK", homeScore: 0, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr10-9", week: 10, date: "18/11", homeTeam: "Ankaragücü", awayTeam: "Boluspor", homeScore: 1, awayScore: 1, competition: "TFF 1. Lig" },

  // Week 11
  { id: "mr11-1", week: 11, date: "24/11", homeTeam: "Pendikspor", awayTeam: "Amedspor", homeScore: 1, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr11-2", week: 11, date: "23/11", homeTeam: "Gençlerbirliği", awayTeam: "Kocaelispor", homeScore: 0, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr11-3", week: 11, date: "24/11", homeTeam: "Çorum FK", awayTeam: "Sakaryaspor", homeScore: 1, awayScore: 3, competition: "TFF 1. Lig" },
  { id: "mr11-4", week: 11, date: "23/11", homeTeam: "Adanaspor", awayTeam: "Erzurumspor", homeScore: 0, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr11-5", week: 11, date: "24/11", homeTeam: "Ümraniyespor", awayTeam: "Bandırmaspor", homeScore: 0, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr11-6", week: 11, date: "23/11", homeTeam: "İğdır FK", awayTeam: "İstanbulspor", homeScore: 2, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr11-7", week: 11, date: "24/11", homeTeam: "Keçiörengücü", awayTeam: "Yeni Malatyaspor", homeScore: 1, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr11-8", week: 11, date: "23/11", homeTeam: "Manisa FK", awayTeam: "Şanlıurfaspor", homeScore: 2, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr11-9", week: 11, date: "24/11", homeTeam: "Boluspor", awayTeam: "Ankaragücü", homeScore: 0, awayScore: 0, competition: "TFF 1. Lig" },

  // Week 12
  { id: "mr12-1", week: 12, date: "30/11", homeTeam: "Amedspor", awayTeam: "Çorum FK", homeScore: 3, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr12-2", week: 12, date: "01/12", homeTeam: "Kocaelispor", awayTeam: "Adanaspor", homeScore: 2, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr12-3", week: 12, date: "30/11", homeTeam: "Sakaryaspor", awayTeam: "Ümraniyespor", homeScore: 2, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr12-4", week: 12, date: "01/12", homeTeam: "Erzurumspor", awayTeam: "İğdır FK", homeScore: 1, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr12-5", week: 12, date: "30/11", homeTeam: "Bandırmaspor", awayTeam: "Keçiörengücü", homeScore: 2, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr12-6", week: 12, date: "01/12", homeTeam: "İstanbulspor", awayTeam: "Manisa FK", homeScore: 3, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr12-7", week: 12, date: "30/11", homeTeam: "Yeni Malatyaspor", awayTeam: "Boluspor", homeScore: 1, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr12-8", week: 12, date: "01/12", homeTeam: "Şanlıurfaspor", awayTeam: "Gençlerbirliği", homeScore: 2, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr12-9", week: 12, date: "30/11", homeTeam: "Ankaragücü", awayTeam: "Pendikspor", homeScore: 1, awayScore: 1, competition: "TFF 1. Lig" },

  // Week 13
  { id: "mr13-1", week: 13, date: "04/12", homeTeam: "Çorum FK", awayTeam: "Amedspor", homeScore: 1, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr13-2", week: 13, date: "05/12", homeTeam: "Adanaspor", awayTeam: "Kocaelispor", homeScore: 0, awayScore: 3, competition: "TFF 1. Lig" },
  { id: "mr13-3", week: 13, date: "04/12", homeTeam: "Ümraniyespor", awayTeam: "Sakaryaspor", homeScore: 0, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr13-4", week: 13, date: "05/12", homeTeam: "İğdır FK", awayTeam: "Erzurumspor", homeScore: 1, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr13-5", week: 13, date: "04/12", homeTeam: "Keçiörengücü", awayTeam: "Bandırmaspor", homeScore: 0, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr13-6", week: 13, date: "05/12", homeTeam: "Manisa FK", awayTeam: "İstanbulspor", homeScore: 1, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr13-7", week: 13, date: "04/12", homeTeam: "Boluspor", awayTeam: "Yeni Malatyaspor", homeScore: 2, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr13-8", week: 13, date: "05/12", homeTeam: "Gençlerbirliği", awayTeam: "Şanlıurfaspor", homeScore: 0, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr13-9", week: 13, date: "04/12", homeTeam: "Pendikspor", awayTeam: "Ankaragücü", homeScore: 2, awayScore: 3, competition: "TFF 1. Lig" },

  // Week 14
  { id: "mr14-1", week: 14, date: "08/12", homeTeam: "Amedspor", awayTeam: "Ümraniyespor", homeScore: 2, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr14-2", week: 14, date: "08/12", homeTeam: "Kocaelispor", awayTeam: "İğdır FK", homeScore: 1, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr14-3", week: 14, date: "07/12", homeTeam: "Sakaryaspor", awayTeam: "Keçiörengücü", homeScore: 3, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr14-4", week: 14, date: "08/12", homeTeam: "Erzurumspor", awayTeam: "Manisa FK", homeScore: 2, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr14-5", week: 14, date: "07/12", homeTeam: "Bandırmaspor", awayTeam: "Boluspor", homeScore: 1, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr14-6", week: 14, date: "08/12", homeTeam: "İstanbulspor", awayTeam: "Gençlerbirliği", homeScore: 2, awayScore: 1, competition: "TFF 1. Lig" },
  { id: "mr14-7", week: 14, date: "07/12", homeTeam: "Yeni Malatyaspor", awayTeam: "Pendikspor", homeScore: 3, awayScore: 2, competition: "TFF 1. Lig" },
  { id: "mr14-8", week: 14, date: "08/12", homeTeam: "Şanlıurfaspor", awayTeam: "Adanaspor", homeScore: 1, awayScore: 0, competition: "TFF 1. Lig" },
  { id: "mr14-9", week: 14, date: "07/12", homeTeam: "Ankaragücü", awayTeam: "Çorum FK", homeScore: 2, awayScore: 2, competition: "TFF 1. Lig" },
];

// Men's Team - Upcoming Fixtures (Next 5 Weeks: Week 15-19)
export const mensUpcomingFixtures: UpcomingMatch[] = [
  // Week 15
  { id: "mu15-1", week: 15, date: "15/12", time: "16:00", homeTeam: "Ümraniyespor", awayTeam: "Amedspor", venue: "Ümraniye Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu15-2", week: 15, date: "14/12", time: "19:00", homeTeam: "İğdır FK", awayTeam: "Kocaelispor", venue: "İğdır Şehir Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu15-3", week: 15, date: "15/12", time: "14:00", homeTeam: "Keçiörengücü", awayTeam: "Sakaryaspor", venue: "Eryaman Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu15-4", week: 15, date: "14/12", time: "16:00", homeTeam: "Manisa FK", awayTeam: "Erzurumspor", venue: "Manisa 19 Mayıs", competition: "TFF 1. Lig" },
  { id: "mu15-5", week: 15, date: "15/12", time: "19:00", homeTeam: "Boluspor", awayTeam: "Bandırmaspor", venue: "Bolu Atatürk", competition: "TFF 1. Lig" },
  { id: "mu15-6", week: 15, date: "14/12", time: "14:00", homeTeam: "Gençlerbirliği", awayTeam: "İstanbulspor", venue: "Eryaman Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu15-7", week: 15, date: "15/12", time: "16:00", homeTeam: "Pendikspor", awayTeam: "Yeni Malatyaspor", venue: "Pendik Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu15-8", week: 15, date: "14/12", time: "19:00", homeTeam: "Adanaspor", awayTeam: "Şanlıurfaspor", venue: "Yeni Adana", competition: "TFF 1. Lig" },
  { id: "mu15-9", week: 15, date: "15/12", time: "14:00", homeTeam: "Çorum FK", awayTeam: "Ankaragücü", venue: "Çorum Şehir", competition: "TFF 1. Lig" },

  // Week 16
  { id: "mu16-1", week: 16, date: "21/12", time: "19:00", homeTeam: "Amedspor", awayTeam: "Keçiörengücü", venue: "Diyarbakır Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu16-2", week: 16, date: "22/12", time: "14:00", homeTeam: "Kocaelispor", awayTeam: "Manisa FK", venue: "Kocaeli Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu16-3", week: 16, date: "21/12", time: "16:00", homeTeam: "Sakaryaspor", awayTeam: "Boluspor", venue: "Sakarya Atatürk", competition: "TFF 1. Lig" },
  { id: "mu16-4", week: 16, date: "22/12", time: "19:00", homeTeam: "Erzurumspor", awayTeam: "Gençlerbirliği", venue: "Kazım Karabekir", competition: "TFF 1. Lig" },
  { id: "mu16-5", week: 16, date: "21/12", time: "14:00", homeTeam: "Bandırmaspor", awayTeam: "Pendikspor", venue: "Bandırma 17 Eylül", competition: "TFF 1. Lig" },
  { id: "mu16-6", week: 16, date: "22/12", time: "16:00", homeTeam: "İstanbulspor", awayTeam: "Adanaspor", venue: "Bahçelievler Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu16-7", week: 16, date: "21/12", time: "19:00", homeTeam: "Yeni Malatyaspor", awayTeam: "Çorum FK", venue: "Malatya Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu16-8", week: 16, date: "22/12", time: "14:00", homeTeam: "Şanlıurfaspor", awayTeam: "İğdır FK", venue: "Şanlıurfa GAP", competition: "TFF 1. Lig" },
  { id: "mu16-9", week: 16, date: "21/12", time: "16:00", homeTeam: "Ankaragücü", awayTeam: "Ümraniyespor", venue: "Eryaman Stadyumu", competition: "TFF 1. Lig" },

  // Week 17
  { id: "mu17-1", week: 17, date: "28/12", time: "16:00", homeTeam: "Keçiörengücü", awayTeam: "Amedspor", venue: "Eryaman Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu17-2", week: 17, date: "29/12", time: "19:00", homeTeam: "Manisa FK", awayTeam: "Kocaelispor", venue: "Manisa 19 Mayıs", competition: "TFF 1. Lig" },
  { id: "mu17-3", week: 17, date: "28/12", time: "14:00", homeTeam: "Boluspor", awayTeam: "Sakaryaspor", venue: "Bolu Atatürk", competition: "TFF 1. Lig" },
  { id: "mu17-4", week: 17, date: "29/12", time: "16:00", homeTeam: "Gençlerbirliği", awayTeam: "Erzurumspor", venue: "Eryaman Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu17-5", week: 17, date: "28/12", time: "19:00", homeTeam: "Pendikspor", awayTeam: "Bandırmaspor", venue: "Pendik Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu17-6", week: 17, date: "29/12", time: "14:00", homeTeam: "Adanaspor", awayTeam: "İstanbulspor", venue: "Yeni Adana", competition: "TFF 1. Lig" },
  { id: "mu17-7", week: 17, date: "28/12", time: "16:00", homeTeam: "Çorum FK", awayTeam: "Yeni Malatyaspor", venue: "Çorum Şehir", competition: "TFF 1. Lig" },
  { id: "mu17-8", week: 17, date: "29/12", time: "19:00", homeTeam: "İğdır FK", awayTeam: "Şanlıurfaspor", venue: "İğdır Şehir Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu17-9", week: 17, date: "28/12", time: "14:00", homeTeam: "Ümraniyespor", awayTeam: "Ankaragücü", venue: "Ümraniye Stadyumu", competition: "TFF 1. Lig" },

  // Week 18
  { id: "mu18-1", week: 18, date: "04/01", time: "19:00", homeTeam: "Amedspor", awayTeam: "Boluspor", venue: "Diyarbakır Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu18-2", week: 18, date: "05/01", time: "16:00", homeTeam: "Kocaelispor", awayTeam: "Gençlerbirliği", venue: "Kocaeli Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu18-3", week: 18, date: "04/01", time: "14:00", homeTeam: "Sakaryaspor", awayTeam: "Pendikspor", venue: "Sakarya Atatürk", competition: "TFF 1. Lig" },
  { id: "mu18-4", week: 18, date: "05/01", time: "19:00", homeTeam: "Erzurumspor", awayTeam: "Adanaspor", venue: "Kazım Karabekir", competition: "TFF 1. Lig" },
  { id: "mu18-5", week: 18, date: "04/01", time: "16:00", homeTeam: "Bandırmaspor", awayTeam: "Çorum FK", venue: "Bandırma 17 Eylül", competition: "TFF 1. Lig" },
  { id: "mu18-6", week: 18, date: "05/01", time: "14:00", homeTeam: "İstanbulspor", awayTeam: "İğdır FK", venue: "Bahçelievler Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu18-7", week: 18, date: "04/01", time: "19:00", homeTeam: "Yeni Malatyaspor", awayTeam: "Ümraniyespor", venue: "Malatya Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu18-8", week: 18, date: "05/01", time: "16:00", homeTeam: "Şanlıurfaspor", awayTeam: "Manisa FK", venue: "Şanlıurfa GAP", competition: "TFF 1. Lig" },
  { id: "mu18-9", week: 18, date: "04/01", time: "14:00", homeTeam: "Ankaragücü", awayTeam: "Keçiörengücü", venue: "Eryaman Stadyumu", competition: "TFF 1. Lig" },

  // Week 19
  { id: "mu19-1", week: 19, date: "11/01", time: "16:00", homeTeam: "Boluspor", awayTeam: "Amedspor", venue: "Bolu Atatürk", competition: "TFF 1. Lig" },
  { id: "mu19-2", week: 19, date: "12/01", time: "19:00", homeTeam: "Gençlerbirliği", awayTeam: "Kocaelispor", venue: "Eryaman Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu19-3", week: 19, date: "11/01", time: "14:00", homeTeam: "Pendikspor", awayTeam: "Sakaryaspor", venue: "Pendik Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu19-4", week: 19, date: "12/01", time: "16:00", homeTeam: "Adanaspor", awayTeam: "Erzurumspor", venue: "Yeni Adana", competition: "TFF 1. Lig" },
  { id: "mu19-5", week: 19, date: "11/01", time: "19:00", homeTeam: "Çorum FK", awayTeam: "Bandırmaspor", venue: "Çorum Şehir", competition: "TFF 1. Lig" },
  { id: "mu19-6", week: 19, date: "12/01", time: "14:00", homeTeam: "İğdır FK", awayTeam: "İstanbulspor", venue: "İğdır Şehir Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu19-7", week: 19, date: "11/01", time: "16:00", homeTeam: "Ümraniyespor", awayTeam: "Yeni Malatyaspor", venue: "Ümraniye Stadyumu", competition: "TFF 1. Lig" },
  { id: "mu19-8", week: 19, date: "12/01", time: "19:00", homeTeam: "Manisa FK", awayTeam: "Şanlıurfaspor", venue: "Manisa 19 Mayıs", competition: "TFF 1. Lig" },
  { id: "mu19-9", week: 19, date: "11/01", time: "14:00", homeTeam: "Keçiörengücü", awayTeam: "Ankaragücü", venue: "Eryaman Stadyumu", competition: "TFF 1. Lig" },
];

// Women's Team - Past Results (Last 5 Weeks: Week 6-10)
export const womensPastResults: MatchResult[] = [
  // Week 6
  { id: "wr6-1", week: 6, date: "10/11", homeTeam: "Amed SK", awayTeam: "Hatayspor", homeScore: 3, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr6-2", week: 6, date: "10/11", homeTeam: "Beşiktaş", awayTeam: "Kayseri Spor", homeScore: 4, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr6-3", week: 6, date: "09/11", homeTeam: "Fenerbahçe", awayTeam: "1207 Antalyaspor", homeScore: 3, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr6-4", week: 6, date: "10/11", homeTeam: "Galatasaray", awayTeam: "Siirt İl Özel İdare", homeScore: 4, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr6-5", week: 6, date: "09/11", homeTeam: "Trabzonspor", awayTeam: "Bayburt İÖİ", homeScore: 2, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr6-6", week: 6, date: "10/11", homeTeam: "Ereğli Belediyespor", awayTeam: "Yeni Orduspor", homeScore: 1, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr6-7", week: 6, date: "09/11", homeTeam: "Kırklarelispor", awayTeam: "Karacabey Belediyespor", homeScore: 2, awayScore: 0, competition: "Kadınlar 1. Lig" },

  // Week 7
  { id: "wr7-1", week: 7, date: "17/11", homeTeam: "Hatayspor", awayTeam: "Amed SK", homeScore: 1, awayScore: 2, competition: "Kadınlar 1. Lig" },
  { id: "wr7-2", week: 7, date: "16/11", homeTeam: "Kayseri Spor", awayTeam: "Beşiktaş", homeScore: 0, awayScore: 3, competition: "Kadınlar 1. Lig" },
  { id: "wr7-3", week: 7, date: "17/11", homeTeam: "1207 Antalyaspor", awayTeam: "Fenerbahçe", homeScore: 1, awayScore: 2, competition: "Kadınlar 1. Lig" },
  { id: "wr7-4", week: 7, date: "16/11", homeTeam: "Siirt İl Özel İdare", awayTeam: "Galatasaray", homeScore: 0, awayScore: 3, competition: "Kadınlar 1. Lig" },
  { id: "wr7-5", week: 7, date: "17/11", homeTeam: "Bayburt İÖİ", awayTeam: "Trabzonspor", homeScore: 1, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr7-6", week: 7, date: "16/11", homeTeam: "Yeni Orduspor", awayTeam: "Ereğli Belediyespor", homeScore: 0, awayScore: 2, competition: "Kadınlar 1. Lig" },
  { id: "wr7-7", week: 7, date: "17/11", homeTeam: "Karacabey Belediyespor", awayTeam: "Kırklarelispor", homeScore: 1, awayScore: 2, competition: "Kadınlar 1. Lig" },

  // Week 8
  { id: "wr8-1", week: 8, date: "24/11", homeTeam: "Amed SK", awayTeam: "1207 Antalyaspor", homeScore: 2, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr8-2", week: 8, date: "23/11", homeTeam: "Beşiktaş", awayTeam: "Siirt İl Özel İdare", homeScore: 5, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr8-3", week: 8, date: "24/11", homeTeam: "Fenerbahçe", awayTeam: "Bayburt İÖİ", homeScore: 3, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr8-4", week: 8, date: "23/11", homeTeam: "Galatasaray", awayTeam: "Yeni Orduspor", homeScore: 4, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr8-5", week: 8, date: "24/11", homeTeam: "Trabzonspor", awayTeam: "Karacabey Belediyespor", homeScore: 3, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr8-6", week: 8, date: "23/11", homeTeam: "Kayseri Spor", awayTeam: "Hatayspor", homeScore: 2, awayScore: 2, competition: "Kadınlar 1. Lig" },
  { id: "wr8-7", week: 8, date: "24/11", homeTeam: "Ereğli Belediyespor", awayTeam: "Kırklarelispor", homeScore: 1, awayScore: 1, competition: "Kadınlar 1. Lig" },

  // Week 9
  { id: "wr9-1", week: 9, date: "01/12", homeTeam: "1207 Antalyaspor", awayTeam: "Amed SK", homeScore: 0, awayScore: 3, competition: "Kadınlar 1. Lig" },
  { id: "wr9-2", week: 9, date: "30/11", homeTeam: "Siirt İl Özel İdare", awayTeam: "Beşiktaş", homeScore: 0, awayScore: 4, competition: "Kadınlar 1. Lig" },
  { id: "wr9-3", week: 9, date: "01/12", homeTeam: "Bayburt İÖİ", awayTeam: "Fenerbahçe", homeScore: 1, awayScore: 2, competition: "Kadınlar 1. Lig" },
  { id: "wr9-4", week: 9, date: "30/11", homeTeam: "Yeni Orduspor", awayTeam: "Galatasaray", homeScore: 0, awayScore: 3, competition: "Kadınlar 1. Lig" },
  { id: "wr9-5", week: 9, date: "01/12", homeTeam: "Karacabey Belediyespor", awayTeam: "Trabzonspor", homeScore: 0, awayScore: 4, competition: "Kadınlar 1. Lig" },
  { id: "wr9-6", week: 9, date: "30/11", homeTeam: "Hatayspor", awayTeam: "Kayseri Spor", homeScore: 1, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr9-7", week: 9, date: "01/12", homeTeam: "Kırklarelispor", awayTeam: "Ereğli Belediyespor", homeScore: 2, awayScore: 2, competition: "Kadınlar 1. Lig" },

  // Week 10
  { id: "wr10-1", week: 10, date: "07/12", homeTeam: "Amed SK", awayTeam: "Bayburt İÖİ", homeScore: 4, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr10-2", week: 10, date: "08/12", homeTeam: "Beşiktaş", awayTeam: "Yeni Orduspor", homeScore: 3, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr10-3", week: 10, date: "07/12", homeTeam: "Fenerbahçe", awayTeam: "Karacabey Belediyespor", homeScore: 5, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr10-4", week: 10, date: "08/12", homeTeam: "Galatasaray", awayTeam: "Kırklarelispor", homeScore: 2, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr10-5", week: 10, date: "07/12", homeTeam: "Trabzonspor", awayTeam: "1207 Antalyaspor", homeScore: 2, awayScore: 0, competition: "Kadınlar 1. Lig" },
  { id: "wr10-6", week: 10, date: "08/12", homeTeam: "Kayseri Spor", awayTeam: "Siirt İl Özel İdare", homeScore: 3, awayScore: 1, competition: "Kadınlar 1. Lig" },
  { id: "wr10-7", week: 10, date: "07/12", homeTeam: "Ereğli Belediyespor", awayTeam: "Hatayspor", homeScore: 0, awayScore: 1, competition: "Kadınlar 1. Lig" },
];

// Women's Team - Upcoming Fixtures (Next 5 Weeks: Week 11-15)
export const womensUpcomingFixtures: UpcomingMatch[] = [
  // Week 11
  { id: "wu11-1", week: 11, date: "14/12", time: "14:00", homeTeam: "Bayburt İÖİ", awayTeam: "Amed SK", venue: "Bayburt Gençlik", competition: "Kadınlar 1. Lig" },
  { id: "wu11-2", week: 11, date: "15/12", time: "16:00", homeTeam: "Yeni Orduspor", awayTeam: "Beşiktaş", venue: "Ordu 19 Eylül", competition: "Kadınlar 1. Lig" },
  { id: "wu11-3", week: 11, date: "14/12", time: "14:00", homeTeam: "Karacabey Belediyespor", awayTeam: "Fenerbahçe", venue: "Karacabey İlçe", competition: "Kadınlar 1. Lig" },
  { id: "wu11-4", week: 11, date: "15/12", time: "16:00", homeTeam: "Kırklarelispor", awayTeam: "Galatasaray", venue: "Kırklareli Atatürk", competition: "Kadınlar 1. Lig" },
  { id: "wu11-5", week: 11, date: "14/12", time: "14:00", homeTeam: "1207 Antalyaspor", awayTeam: "Trabzonspor", venue: "Antalya Stadyumu", competition: "Kadınlar 1. Lig" },
  { id: "wu11-6", week: 11, date: "15/12", time: "16:00", homeTeam: "Siirt İl Özel İdare", awayTeam: "Kayseri Spor", venue: "Siirt Stadyumu", competition: "Kadınlar 1. Lig" },
  { id: "wu11-7", week: 11, date: "14/12", time: "14:00", homeTeam: "Hatayspor", awayTeam: "Ereğli Belediyespor", venue: "Hatay Atatürk", competition: "Kadınlar 1. Lig" },

  // Week 12
  { id: "wu12-1", week: 12, date: "21/12", time: "16:00", homeTeam: "Amed SK", awayTeam: "Karacabey Belediyespor", venue: "Diyarbakır Stadyumu", competition: "Kadınlar 1. Lig" },
  { id: "wu12-2", week: 12, date: "22/12", time: "14:00", homeTeam: "Beşiktaş", awayTeam: "Kırklarelispor", venue: "Fulya Sanat Tesisleri", competition: "Kadınlar 1. Lig" },
  { id: "wu12-3", week: 12, date: "21/12", time: "16:00", homeTeam: "Fenerbahçe", awayTeam: "1207 Antalyaspor", venue: "Dereağzı Tesisleri", competition: "Kadınlar 1. Lig" },
  { id: "wu12-4", week: 12, date: "22/12", time: "14:00", homeTeam: "Galatasaray", awayTeam: "Hatayspor", venue: "Florya Metin Oktay", competition: "Kadınlar 1. Lig" },
  { id: "wu12-5", week: 12, date: "21/12", time: "16:00", homeTeam: "Trabzonspor", awayTeam: "Bayburt İÖİ", venue: "Trabzon Akyazı", competition: "Kadınlar 1. Lig" },
  { id: "wu12-6", week: 12, date: "22/12", time: "14:00", homeTeam: "Kayseri Spor", awayTeam: "Yeni Orduspor", venue: "Kadir Has", competition: "Kadınlar 1. Lig" },
  { id: "wu12-7", week: 12, date: "21/12", time: "16:00", homeTeam: "Ereğli Belediyespor", awayTeam: "Siirt İl Özel İdare", venue: "Ereğli Stadyumu", competition: "Kadınlar 1. Lig" },

  // Week 13
  { id: "wu13-1", week: 13, date: "28/12", time: "14:00", homeTeam: "Karacabey Belediyespor", awayTeam: "Amed SK", venue: "Karacabey İlçe", competition: "Kadınlar 1. Lig" },
  { id: "wu13-2", week: 13, date: "29/12", time: "16:00", homeTeam: "Kırklarelispor", awayTeam: "Beşiktaş", venue: "Kırklareli Atatürk", competition: "Kadınlar 1. Lig" },
  { id: "wu13-3", week: 13, date: "28/12", time: "14:00", homeTeam: "1207 Antalyaspor", awayTeam: "Fenerbahçe", venue: "Antalya Stadyumu", competition: "Kadınlar 1. Lig" },
  { id: "wu13-4", week: 13, date: "29/12", time: "16:00", homeTeam: "Hatayspor", awayTeam: "Galatasaray", venue: "Hatay Atatürk", competition: "Kadınlar 1. Lig" },
  { id: "wu13-5", week: 13, date: "28/12", time: "14:00", homeTeam: "Bayburt İÖİ", awayTeam: "Trabzonspor", venue: "Bayburt Gençlik", competition: "Kadınlar 1. Lig" },
  { id: "wu13-6", week: 13, date: "29/12", time: "16:00", homeTeam: "Yeni Orduspor", awayTeam: "Kayseri Spor", venue: "Ordu 19 Eylül", competition: "Kadınlar 1. Lig" },
  { id: "wu13-7", week: 13, date: "28/12", time: "14:00", homeTeam: "Siirt İl Özel İdare", awayTeam: "Ereğli Belediyespor", venue: "Siirt Stadyumu", competition: "Kadınlar 1. Lig" },

  // Week 14
  { id: "wu14-1", week: 14, date: "04/01", time: "16:00", homeTeam: "Amed SK", awayTeam: "1207 Antalyaspor", venue: "Diyarbakır Stadyumu", competition: "Kadınlar 1. Lig" },
  { id: "wu14-2", week: 14, date: "05/01", time: "14:00", homeTeam: "Beşiktaş", awayTeam: "Hatayspor", venue: "Fulya Sanat Tesisleri", competition: "Kadınlar 1. Lig" },
  { id: "wu14-3", week: 14, date: "04/01", time: "16:00", homeTeam: "Fenerbahçe", awayTeam: "Bayburt İÖİ", venue: "Dereağzı Tesisleri", competition: "Kadınlar 1. Lig" },
  { id: "wu14-4", week: 14, date: "05/01", time: "14:00", homeTeam: "Galatasaray", awayTeam: "Siirt İl Özel İdare", venue: "Florya Metin Oktay", competition: "Kadınlar 1. Lig" },
  { id: "wu14-5", week: 14, date: "04/01", time: "16:00", homeTeam: "Trabzonspor", awayTeam: "Kırklarelispor", venue: "Trabzon Akyazı", competition: "Kadınlar 1. Lig" },
  { id: "wu14-6", week: 14, date: "05/01", time: "14:00", homeTeam: "Kayseri Spor", awayTeam: "Karacabey Belediyespor", venue: "Kadir Has", competition: "Kadınlar 1. Lig" },
  { id: "wu14-7", week: 14, date: "04/01", time: "16:00", homeTeam: "Ereğli Belediyespor", awayTeam: "Yeni Orduspor", venue: "Ereğli Stadyumu", competition: "Kadınlar 1. Lig" },

  // Week 15
  { id: "wu15-1", week: 15, date: "11/01", time: "14:00", homeTeam: "1207 Antalyaspor", awayTeam: "Amed SK", venue: "Antalya Stadyumu", competition: "Kadınlar 1. Lig" },
  { id: "wu15-2", week: 15, date: "12/01", time: "16:00", homeTeam: "Hatayspor", awayTeam: "Beşiktaş", venue: "Hatay Atatürk", competition: "Kadınlar 1. Lig" },
  { id: "wu15-3", week: 15, date: "11/01", time: "14:00", homeTeam: "Bayburt İÖİ", awayTeam: "Fenerbahçe", venue: "Bayburt Gençlik", competition: "Kadınlar 1. Lig" },
  { id: "wu15-4", week: 15, date: "12/01", time: "16:00", homeTeam: "Siirt İl Özel İdare", awayTeam: "Galatasaray", venue: "Siirt Stadyumu", competition: "Kadınlar 1. Lig" },
  { id: "wu15-5", week: 15, date: "11/01", time: "14:00", homeTeam: "Kırklarelispor", awayTeam: "Trabzonspor", venue: "Kırklareli Atatürk", competition: "Kadınlar 1. Lig" },
  { id: "wu15-6", week: 15, date: "12/01", time: "16:00", homeTeam: "Karacabey Belediyespor", awayTeam: "Kayseri Spor", venue: "Karacabey İlçe", competition: "Kadınlar 1. Lig" },
  { id: "wu15-7", week: 15, date: "11/01", time: "14:00", homeTeam: "Yeni Orduspor", awayTeam: "Ereğli Belediyespor", venue: "Ordu 19 Eylül", competition: "Kadınlar 1. Lig" },
];

// League Legend Info (Promotion/Relegation Zones)
export const mensLeagueLegend: LeagueLegendItem[] = [
  { id: "ml1", color: "#1a3a52", label: "Yükselme", description: "Süper Lig'e direk yükselme", positions: "1-2" },
  { id: "ml2", color: "#ffa500", label: "Play-off Finalist", description: "Play-off finali", positions: "3" },
  { id: "ml3", color: "#4a90e2", label: "Play-off", description: "Yükselme play-off", positions: "4-5" },
  { id: "ml4", color: "#d32f2f", label: "Düşme", description: "2. Lig'e küme düşme", positions: "17-18" },
];

export const womensLeagueLegend: LeagueLegendItem[] = [
  { id: "wl1", color: "#1a3a52", label: "Yükselme", description: "Süper Lig'e yükselme", positions: "1" },
  { id: "wl2", color: "#ffa500", label: "Play-off", description: "Yükselme play-off", positions: "2-3" },
  { id: "wl3", color: "#d32f2f", label: "Düşme", description: "2. Lig'e küme düşme", positions: "13-14" },
];

export const legends: Legend[] = [
  {
    id: "l1",
    name: "Şehmus Özer",
    role: "Forvet",
    years: "2013 - 2016",
    highlight: "Play-off yolunda kritik goller, tribün lideri ruhu.",
  },
  {
    id: "l2",
    name: "Mehmet Sıddık İstemi",
    role: "Orta Saha",
    years: "2010 - 2014",
    highlight: "Orta sahada denge, pas istasyonu ve pres enerjisi.",
  },
  {
    id: "l3",
    name: "Vedat Budak",
    role: "Kanat",
    years: "2016 - 2019",
    highlight: "Çizgi koşuları, asistleri ve kritik derbi katkıları.",
  },
];

export const kits: KitItem[] = [
  {
    id: "k1",
    season: "2024/25",
    title: "?? Saha",
    palette: "Ye?il - K?rm?z? blok, ince beyaz detay",
    note: "Diyarbak?r sur motifleri g???s ?izgisinde i?leme.",
    image: require("../assets/footboll/1.jpg"),
    colors: ["#0FA958", "#D10E0E", "#FFFFFF"],
  },
  {
    id: "k2",
    season: "2023/24",
    title: "Deplasman",
    palette: "Beyaz zemin, ye?il-k?rm?z? omuz ?eritleri",
    note: "Minimalist duru?, hafif kuma?.",
    image: require("../assets/footboll/2.jpg"),
    colors: ["#FFFFFF", "#0FA958", "#D10E0E"],
  },
  {
    id: "k3",
    season: "2022/23",
    title: "Alternatif",
    palette: "Gece siyah?, neon ye?il vurgu",
    note: "Gece ma?lar? i?in tasarlanan ?zel seri.",
    image: require("../assets/footboll/4.jpg"),
    colors: ["#0D0D0D", "#0FA958", "#12C26A"],
  },
];

export const players: Player[] = [
  {
    id: "pl1",
    name: "M. Ali Güneş",
    position: "Kaleci",
    number: 1,
    age: 29,
    height: "1.88",
    foot: "Right",
    bio: "Refleksleri güçlü, çizgi hakimiyeti yüksek. Yan toplarda güven veriyor.",
    strengths: ["Refleks", "Hava topları", "1v1"],
    hometown: "Diyarbakır",
    matches: 26,
    goals: 0,
    assists: 0,
    rating: 7.4,
    career: ["2023-24: 30 maç, 14 CS", "2024-25: 26 maç, 12 CS"],
    image: require("../assets/footboll/2.jpg"),
  },
  {
    id: "pl2",
    name: "Baran Karadoğan",
    position: "Stoper",
    number: 4,
    age: 27,
    height: "1.85",
    foot: "Left",
    bio: "Pas kanalı açan sol stoper. İkili mücadelede sert, oyun kurulumunda sakin.",
    strengths: ["Pas açıları", "Önsezi", "Fizik"],
    hometown: "Mardin",
    matches: 24,
    goals: 2,
    assists: 1,
    rating: 7.1,
    career: ["2023-24: 28 maç, 2 gol", "2024-25: 24 maç, 3 blok ort."],
    image: require("../assets/footboll/2.jpg"),
  },
  {
    id: "pl3",
    name: "Rojhat Demir",
    position: "Ön Libero",
    number: 6,
    age: 25,
    height: "1.80",
    foot: "Right",
    bio: "Pres tetikleyicisi. Geçişlerde top kapıp dikine oynuyor.",
    strengths: ["Pres", "Top kapma", "Dikine pas"],
    hometown: "Batman",
    matches: 25,
    goals: 1,
    assists: 3,
    rating: 7.3,
    career: ["2023-24: 27 maç, 2 asist", "2024-25: 25 maç, 3 asist"],
    image: require("../assets/footboll/3.jpg"),
  },
  {
    id: "pl4",
    name: "Deniz Yalçın",
    position: "On Numara",
    number: 10,
    age: 24,
    height: "1.78",
    foot: "Left",
    bio: "Dar alanda çözüm üreten kreatif oyun kurucu. Duran toplarda etkili.",
    strengths: ["Anahtar pas", "Duran top", "Şut"],
    hometown: "İzmir",
    matches: 23,
    goals: 7,
    assists: 9,
    rating: 7.8,
    career: ["2023-24: 29 maç, 6G 8A", "2024-25: 23 maç, 7G 9A"],
    image: require("../assets/footboll/4.jpg"),
  },
  {
    id: "pl5",
    name: "Jiyan Karadağ",
    position: "Kanat Forvet",
    number: 17,
    age: 23,
    height: "1.76",
    foot: "Both",
    bio: "Çabuk yön değiştiriyor, içe katla şut tehdidi. Çizgide de asist arıyor.",
    strengths: ["Çeviklik", "Şut", "İkili oyun"],
    hometown: "Diyarbakır",
    matches: 25,
    goals: 9,
    assists: 6,
    rating: 7.6,
    career: ["2023-24: 31 maç, 9G 7A", "2024-25: 25 maç, 9G 6A"],
    image: require("../assets/footboll/2.jpg"),
  },
  {
    id: "pl6",
    name: "Ahmet Derin",
    position: "Santrafor",
    number: 9,
    age: 28,
    height: "1.83",
    foot: "Right",
    bio: "Ceza sahası avcısı. Sırtı dönük duvar olup takımı ileri taşıyor.",
    strengths: ["Bitiricilik", "Sırtı dönük oyun", "Zamanlama"],
    hometown: "Kocaeli",
    matches: 24,
    goals: 14,
    assists: 4,
    rating: 7.9,
    career: ["2023-24: 30 maç, 15 gol", "2024-25: 24 maç, 14 gol"],
    image: require("../assets/footboll/2.jpg"),
  },
];

export const polls: Poll[] = [
  {
    id: "p1",
    question: "Haftanin macini kim kazanir?",
    closesIn: "12 saat",
    options: [
      { id: "o1", text: "Amedspor", votes: 312 },
      { id: "o2", text: "Kocaelispor", votes: 118 },
      { id: "o3", text: "Beraberlik", votes: 74 },
    ],
  },
  {
    id: "p2",
    question: "Skor tahminin nedir?",
    closesIn: "5 saat",
    options: [
      { id: "o4", text: "2 - 0", votes: 188 },
      { id: "o5", text: "2 - 1", votes: 203 },
      { id: "o6", text: "Beraberlik", votes: 77 },
    ],
  },
];

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: "Deplasman otobüsü (İzmir çıkışlı)",
    city: "İzmir",
    location: "Konak Meydanı - Saat Kulesi önü",
    date: "12 Aralık, 10:00",
    contact: "@amedaway",
    link: "https://amedfans.org/otobus",
    note: "50 kişilik kontenjan, pankart ve davul için izin alındı.",
  },
  {
    id: "a2",
    title: "Maç önü buluşması",
    city: "Diyarbakır",
    location: "On Gözlü Köprü",
    date: "08 Aralık, 15:00",
    contact: "@greenwall",
    note: "Koreografi paylaştırması ve bilet dağıtımı.",
  },
  {
    id: "a3",
    title: "Diyarbakır çocuk tribünü",
    city: "Diyarbakır",
    location: "Maraton G Kapısı",
    date: "Her iç saha - 1 saat önce",
    contact: "iletisim@amedfan.org",
    note: "12 yaş altı için ücretsiz giriş ve boyama etkinliği.",
  },
  {
    id: "a4",
    title: "Kahvaltı & deplasman hazırlığı",
    city: "İstanbul",
    location: "Kadıköy Moda Sahili",
    date: "14 Aralık, 09:30",
    contact: "@curvasur",
    note: "Bilet teslimi, konvoy ve pankart koordinasyonu.",
  },
  {
    id: "a5",
    title: "Üniversite tribün tanışması",
    city: "Ankara",
    location: "Kolej Metro Çıkışı",
    date: "16 Aralık, 18:00",
    contact: "@genclikamed",
    note: "Yeni gelenler için hatıra atkı dağıtımı.",
  },
];

export const matchRooms: MatchRoom[] = [
  {
    id: "tribun",
    title: "Amedspor Tribun",
    time: "Her zaman acik",
    phase: "pre",
    status: "live",
    messages: [
      {
        id: "m1",
        text: "Hos geldin Tribun!",
        sender: "Moderator",
        timestamp: "18:00",
        isMine: false,
      },
      {
        id: "m2",
        text: "Mac oncesi, sirasinda ve sonrasinda buradayiz.",
        sender: "GreenWave",
        timestamp: "18:05",
        isMine: false,
      },
    ],
  },
];

export const archiveHighlights = [
  {
    id: "h1",
    title: "Diyarbakır'ın sesi",
    detail:
      "1932'den bugüne amatörden profesyonele uzanan yolculuk. Sur içi mahallelerinden yükselen tribün kültürü.",
  },
  {
    id: "h2",
    title: "Kupa koşusu",
    detail:
      "2024 Türkiye Kupası çeyrek finali, penaltılar ve ardından gelen tribün yürüyüşü.",
  },
  {
    id: "h3",
    title: "Deplasman ruhu",
    detail:
      "Anadolu şehirlerinde renkleriyle yankılanan taraftar kortejleri, dayanışma hikayeleri.",
  },
];

export const fanMoments: FanMoment[] = [
  {
    id: "fm1",
    user: "IzmirWave-35",
    location: "Izmir - Kordon",
    caption: "Dev ekran kuruldu, yesil kirmizi atklar hazir!",
    time: "10dk",
    source: "Sehir Meydani",
    image: require("../assets/footboll/3.jpg"),
  },
  {
    id: "fm2",
    user: "KapaliC1",
    location: "Diyarbakir Stadyumu - Kapali C",
    caption: "Koreografi provasi sonrasinda tribunun atesi yandi.",
    time: "22dk",
    source: "Tribun",
    image: require("../assets/footboll/2.jpg"),
  },
  {
    id: "fm3",
    user: "BerlinAmed",
    location: "Berlin Fan Zone",
    caption: "Projeksiyon yansitildi, 40 kisiyiz. Sesimizi duyuyor musunuz?",
    time: "35dk",
    source: "Ev/Izleme",
    image: require("../assets/footboll/2.jpg"),
  },
  {
    id: "fm4",
    user: "MaratonG",
    location: "Diyarbakir - Maraton G",
    caption: "Dakika 74, tezahurat sesi kesilmiyor!",
    time: "48dk",
    source: "Tribun",
    image: "../assets/footboll/4.jpg",
  },
  {
    id: "fm5",
    user: "IzmirWave-35",
    location: "Izmir - Kordon",
    caption: "Gol aninda sahile dusen mesale dumani!",
    time: "1s",
    source: "Sehir Meydani",
    image: "../assets/footboll/3.jpg",
  },
  {
    id: "fm6",
    user: "MaratonG",
    location: "Diyarbakir - Maraton G",
    caption: "Dakika 74, tezahurat sesi kesilmiyor!",
    time: "48dk",
    source: "Tribun",
    image: "../assets/footboll/3.jpg",
  },
  {
    id: "fm7",
    user: "IzmirWave-35",
    location: "Izmir - Kordon",
    caption: "Gol aninda sahile dusen mesale dumani!",
    time: "1s",
    source: "Sehir Meydani",
    image: "../assets/footboll/1.jpg",
  },
];




