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

export type LiveEvent = {
  id: string;
  minute: number;
  team: "home" | "away";
  type: "goal" | "card" | "var" | "sub";
  player: string;
  detail: string;
  videoUrl?: string;
  thumb?: ImageSourcePropType;
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

export type FanMoment = {
  id: string;
  user: string;
  location: string;
  caption: string;
  time: string;
  source: "Tribun" | "Sehir Meydani" | "Ev/Izleme";
  image?: ImageSourcePropType;
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
    image: require("../assets/footboll/1.jpg"),
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
      videoUrl: "https://fakevideo.link/amedspor-gol1.mp4",
      thumb: require("../assets/footboll/1.jpg"),
    },
    {
      id: "e2",
      minute: 33,
      team: "away",
      type: "goal",
      player: "Mehmet Kaya",
      detail: "Kafa vurus, skor 1-1.",
      videoUrl: "https://fakevideo.link/rakip-gol.mp4",
      thumb: require("../assets/footboll/2.jpg"),
    },
    {
      id: "e3",
      minute: 55,
      team: "home",
      type: "goal",
      player: "Jiyan Karadayi",
      detail: "Ceza sahasi karambolu sonrasi tamamlandi.",
      videoUrl: "https://fakevideo.link/amedspor-gol2.mp4",
      thumb: require("../assets/footboll/3.jpg"),
    },
    {
      id: "e4",
      minute: 68,
      team: "home",
      type: "card",
      player: "Musa Bulut",
      detail: "Sert mudahale, sari kart.",
      videoUrl: "https://fakevideo.link/sari-kart.mp4",
      thumb: require("../assets/footboll/4.jpg"),
    },
  ] as LiveEvent[],
};

export const standings: StandingRow[] = [
  {
    pos: 1,
    team: "Sakaryaspor",
    mp: 14,
    w: 9,
    d: 3,
    l: 2,
    gf: 24,
    ga: 12,
    pts: 30,
  },
  {
    pos: 2,
    team: "Amedspor",
    mp: 14,
    w: 8,
    d: 4,
    l: 2,
    gf: 22,
    ga: 11,
    pts: 28,
  },
  {
    pos: 3,
    team: "Kocaelispor",
    mp: 14,
    w: 8,
    d: 2,
    l: 4,
    gf: 21,
    ga: 14,
    pts: 26,
  },
  {
    pos: 4,
    team: "Erzurumspor",
    mp: 14,
    w: 7,
    d: 4,
    l: 3,
    gf: 18,
    ga: 12,
    pts: 25,
  },
  {
    pos: 5,
    team: "Bandırmaspor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 24,
  },
  {
    pos: 6,
    team: "HataySpor",
    mp: 14,
    w: 8,
    d: 2,
    l: 4,
    gf: 21,
    ga: 14,
    pts: 23,
  },
  {
    pos: 7,
    team: "IğdırSpor",
    mp: 14,
    w: 7,
    d: 4,
    l: 3,
    gf: 18,
    ga: 12,
    pts: 22,
  },
  {
    pos: 8,
    team: "YozgatSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 21,
  },
  {
    pos: 9,
    team: "MardinSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 20,
  },
  {
    pos: 10,
    team: "BatmanSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 19,
  },
  {
    pos: 11,
    team: "MalatyaSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 18,
  },
  {
    pos: 12,
    team: "GaziantepSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 17,
  },
  {
    pos: 13,
    team: "KilisSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 16,
  },
  {
    pos: 14,
    team: "KahramanMaraş Spor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 15,
  },
  {
    pos: 15,
    team: "GöztepeSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 14,
  },
  {
    pos: 16,
    team: "Kayseri Spor",
    mp: 16,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 13,
  },
  {
    pos: 17,
    team: "AfyonSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 12,
  },
  {
    pos: 18,
    team: "KütahyaSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 11,
  },
  {
    pos: 19,
    team: "KeçiörenSpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 10,
  },
  {
    pos: 20,
    team: "AltaySpor",
    mp: 14,
    w: 7,
    d: 3,
    l: 4,
    gf: 17,
    ga: 13,
    pts: 9,
  },
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
    image: require("../assets/footboll/1.jpg"),
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



