import { ImageSourcePropType } from "react-native";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  time: string;
  category: string;
  image?: ImageSourcePropType;
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

export type LiveEvent = {
  id: string;
  minute: number;
  team: "home" | "away";
  type: "goal" | "card" | "var" | "sub";
  player: string;
  detail: string;
};

export type StandingRow = {
  pos: number;
  team: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
};

export type Legend = {
  id: string;
  name: string;
  role: string;
  years: string;
  highlight: string;
};

export type KitItem = {
  id: string;
  season: string;
  title: string;
  palette: string;
  note: string;
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
};

export type ChatMessage = {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isMine?: boolean;
  isRead?: boolean;
};

export type MatchRoom = {
  id: string;
  title: string;
  time: string;
  messages: ChatMessage[];
};

export const newsData: NewsItem[] = [
  {
    id: "n1",
    title: "Derbi Öncesi Son Dokunuşlar",
    summary:
      "Takım son idmanında tempolu pres ve geçiş oyunu üzerine çalıştı. Kalabalık tribün provası yapıldı.",
    time: "2s",
    category: "Kulüp",
    image: require("../assets/dummy/slide1.png"),
  },
  {
    id: "n2",
    title: "Genç Oyunculardan Güçlü Mesaj",
    summary:
      "Altyapıdan çıkan 3 oyuncu ilk 11 için hazırlanıyor. Teknik ekipten taktik destek tam.",
    time: "4s",
    category: "Akademi",
    image: require("../assets/dummy/slide2.png"),
  },
  {
    id: "n3",
    title: "Diyarbakır’da Tribün Koreografisi",
    summary:
      "Kapalı tribün için 18 parçalık yeşil-kırmızı koreografi maketi tamamlandı, gönüllüler hazır.",
    time: "6s",
    category: "Taraftar",
    image: require("../assets/dummy/slide3.png"),
  },
  {
    id: "n4",
    title: "Analiz: Hücumda Yeni Şablon",
    summary:
      "6 numara çıkışlarıyla çizgiye inen beklerin ceza sahası koşuları: son 3 maçın veri okuması.",
    time: "1g",
    category: "Analiz",
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
      detail: "Sol çaprazdan plase, üst köşe.",
    },
    {
      id: "e2",
      minute: 33,
      team: "away",
      type: "goal",
      player: "Mehmet Kaya",
      detail: "Kafa vuruşu, skor 1-1.",
    },
    {
      id: "e3",
      minute: 55,
      team: "home",
      type: "goal",
      player: "Jiyan Karadağ",
      detail: "Ceza sahası karambolü sonrası tamamladı.",
    },
    {
      id: "e4",
      minute: 68,
      team: "home",
      type: "card",
      player: "Musa Bulut",
      detail: "Sert müdahale, sarı kart.",
    },
  ] as LiveEvent[],
};

export const standings: StandingRow[] = [
  { pos: 1, team: "Amedspor", mp: 14, w: 9, d: 3, l: 2, gf: 24, ga: 12, pts: 30 },
  { pos: 2, team: "Sakaryaspor", mp: 14, w: 8, d: 4, l: 2, gf: 22, ga: 11, pts: 28 },
  { pos: 3, team: "Kocaelispor", mp: 14, w: 8, d: 2, l: 4, gf: 21, ga: 14, pts: 26 },
  { pos: 4, team: "Erzurumspor", mp: 14, w: 7, d: 4, l: 3, gf: 18, ga: 12, pts: 25 },
  { pos: 5, team: "Bandırmaspor", mp: 14, w: 7, d: 3, l: 4, gf: 17, ga: 13, pts: 24 },
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
    title: "İç Saha",
    palette: "Yeşil - Kırmızı blok, ince beyaz detay",
    note: "Diyarbakır sur motifleri göğüs çizgisinde işleme.",
  },
  {
    id: "k2",
    season: "2023/24",
    title: "Deplasman",
    palette: "Beyaz zemin, yeşil-kırmızı omuz şeritleri",
    note: "Minimalist duruş, hafif kumaş.",
  },
  {
    id: "k3",
    season: "2022/23",
    title: "Alternatif",
    palette: "Gece siyahı, neon yeşil vurgu",
    note: "Gece maçları için tasarlanan özel seri.",
  },
];

export const polls: Poll[] = [
  {
    id: "p1",
    question: "Derbide ilk golü kim atar?",
    closesIn: "3 saat",
    options: [
      { id: "o1", text: "Amedspor", votes: 245 },
      { id: "o2", text: "Rakip", votes: 62 },
      { id: "o3", text: "İlk yarı golsüz", votes: 31 },
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
    id: "r1",
    title: "Amedspor vs Kocaelispor",
    time: "Bugün 19:00",
    messages: [
      {
        id: "m1",
        text: "Koreografi malzemeleri maraton girişinde.",
        sender: "GreenWave-789",
        timestamp: "18:05",
        isMine: false,
      },
      {
        id: "m2",
        text: "Takım ısınmaya çıktı, enerji yüksek!",
        sender: "AmedLion-123",
        timestamp: "18:12",
        isMine: false,
      },
    ],
  },
  {
    id: "r2",
    title: "Bandırmaspor deplasmanı",
    time: "14 Aralık 16:00",
    messages: [
      {
        id: "m3",
        text: "Deplasman otobüsü listesi dolmak üzere, DM atın.",
        sender: "EastCrew-456",
        timestamp: "13:40",
        isMine: false,
      },
      {
        id: "m4",
        text: "Kırmızı formalar bu maçta da giyilecek.",
        sender: "NorthWall-332",
        timestamp: "13:55",
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
