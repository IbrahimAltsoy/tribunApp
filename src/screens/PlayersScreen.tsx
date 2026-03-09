/**
 * PlayersScreen — Premium redesign
 * Renk sistemi: tek aksan renk (GS Altın #FFC72C), koyu monokromatik zemin
 * Kart: photo-first, alt koyu bant, altın forma numarası
 * Modal: sinematik full-width hero
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, Pressable, Image, Modal,
  ScrollView, ActivityIndicator, RefreshControl,
  Dimensions, Linking, StatusBar, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons }     from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { playerService, PlayerDto } from "../services/playerService";

// ─── Ölçüler ───────────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get("window");
const PAD  = 14;
const GAP  = 8;
const CW   = (SW - PAD * 2 - GAP) / 2;
const CH   = CW * 1.72;

// ─── Renk paleti (monokromatik + GS altın) ─────────────────────────────────────
const C = {
  bg:       "#080810",      // en koyu zemin
  surf1:    "#0E0E18",      // kart arka planı
  surf2:    "#14141E",      // ikincil yüzey
  surf3:    "#1C1C28",      // üçüncül yüzey (tab, badge)
  border:   "rgba(255,255,255,0.07)",
  border2:  "rgba(255,255,255,0.12)",
  gold:     "#FFC72C",      // GS altın — TEK aksan rengi
  goldDim:  "#9A7010",      // soluk altın
  gsRed:    "#E8111A",      // GS kırmızı (sadece header stripe)
  white:    "#FFFFFF",
  t1:       "#FFFFFF",
  t2:       "#9898A8",
  t3:       "#484858",
};

// ─── Pozisyon tipleri ──────────────────────────────────────────────────────────
type PF = "TÜM" | "KALECİ" | "DEFANS" | "ORTA SAHA" | "FORVET" | "EFSANELER";

const GROUPS: { key: PF; plural: string }[] = [
  { key: "KALECİ",    plural: "KALECİLER"     },
  { key: "DEFANS",    plural: "DEFANS"         },
  { key: "ORTA SAHA", plural: "ORTA SAHA"      },
  { key: "FORVET",    plural: "FORVETLER"      },
  { key: "EFSANELER", plural: "EFSANELER"      },
];

const TABS: PF[] = ["TÜM","KALECİ","DEFANS","ORTA SAHA","FORVET","EFSANELER"];
const TAB_LABEL: Record<PF, string> = {
  TÜM: "Tümü", KALECİ: "Kaleci", DEFANS: "Defans",
  "ORTA SAHA": "O.Saha", FORVET: "Forvet", EFSANELER: "Efsane",
};

const KW: Record<string, string[]> = {
  KALECİ:      ["kaleci","goalkeeper"],
  DEFANS:      ["defans","bek","stoper","defender","back"],
  "ORTA SAHA": ["orta saha","midfielder","orta","mid"],
  FORVET:      ["forvet","forward","striker","winger","kanat","attacker"],
};

const inGroup = (p: PlayerDto, key: PF) =>
  key === "EFSANELER" ? !!p.isLegend
  : (KW[key] || []).some(kw => (p.position || "").toLowerCase().includes(kw));

const posLabel = (pos: string) => {
  const p = pos.toLowerCase();
  if (p.includes("kaleci") || p.includes("goalkeeper"))  return "Kaleci";
  if (p.includes("defans") || p.includes("bek") || p.includes("defender")) return "Defans";
  if (p.includes("orta")   || p.includes("midfielder"))  return "Orta Saha";
  if (p.includes("forvet") || p.includes("forward") || p.includes("striker")) return "Forvet";
  return pos;
};

const ini = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const ageOf = (bd?: string | null) =>
  bd ? Math.floor((Date.now() - new Date(bd).getTime()) / 3.15576e10) : null;
const pairs = <T,>(arr: T[]): [T, T | null][] =>
  arr.reduce<[T, T | null][]>((a, x, i) => {
    if (i % 2 === 0) a.push([x, arr[i + 1] ?? null]);
    return a;
  }, []);

// ══════════════════════════════════════════════════════════════════════════════
// OYUNCU KARTI
// ──────────────────────────────────────────────────────────────────────────────
// Fotoğraf → koyu gradient geçişi → koyu alt bilgi bandı
// Aksan: sadece ALTIN (#FFC72C) — forma numarası, ince üst çizgi
// ══════════════════════════════════════════════════════════════════════════════
const PlayerCard: React.FC<{ player: PlayerDto; onPress: () => void }> = ({ player, onPress }) => {
  const letters = ini(player.name);
  const display = (player.commonName || player.name).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        $.card,
        pressed && { opacity: 0.72, transform: [{ scale: 0.955 }] },
      ]}
    >
      {/* ── Fotoğraf ya da baş-harf ── */}
      {player.imageUrl ? (
        <Image
          source={{ uri: player.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, $.cardFallback]}>
          <Text style={$.cardIni}>{letters}</Text>
        </View>
      )}

      {/* ── Üst-alt köşe karartması (vignette) ── */}
      <LinearGradient
        colors={["rgba(8,8,16,0.45)", "transparent", "transparent", "rgba(8,8,16,0.72)", "rgba(8,8,16,0.97)"]}
        locations={[0, 0.08, 0.45, 0.72, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Altın üst çizgi ── */}
      <View style={$.cardTopLine} />

      {/* ── Forma numarası (sağ üst) ── */}
      <View style={$.numBadge}>
        <Text style={$.numText}>{player.jerseyNumber}</Text>
      </View>

      {/* ── Sakatlık ikonu (sol üst) ── */}
      {player.injuryStatus ? (
        <View style={$.injuryDot}>
          <Ionicons name="medical" size={8} color={C.white} />
        </View>
      ) : null}

      {/* ── Alt bilgi ── */}
      <View style={$.cardBottom}>
        <Text style={$.cardName} numberOfLines={1}>{display}</Text>
        <Text style={$.cardPos} numberOfLines={1}>{posLabel(player.position || "")}</Text>
        {player.nationalityName ? (
          <Text style={$.cardNat} numberOfLines={1}>{player.nationalityName}</Text>
        ) : null}
      </View>
    </Pressable>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DETAY MODALİ
// ══════════════════════════════════════════════════════════════════════════════
const Detail: React.FC<{
  player: PlayerDto | null;
  visible: boolean;
  onClose: () => void;
}> = ({ player, visible, onClose }) => {
  if (!player) return null;

  const a = player.age ?? ageOf(player.birthDate);

  const stats: { label: string; val: string; gold?: boolean }[] = [
    { label: "FORMA",   val: `#${player.jerseyNumber}`,              gold: true },
    { label: "YAŞ",     val: a ? String(a) : "—"                               },
    { label: "BOY",     val: player.height   ? `${player.height}cm`  : "—"     },
    { label: "KİLO",    val: player.weight   ? `${player.weight}kg`  : "—"     },
    { label: "AYAK",    val: player.preferredFoot  || "—"                       },
    { label: "UYRUK",   val: player.nationalityName || "—"                      },
    { label: "DOĞUM",   val: player.birthPlace || "—"                           },
    { label: "DEĞER",   val: player.marketValue  || "—",             gold: true },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={m.root}>
        <View style={m.handle} />

        <ScrollView showsVerticalScrollIndicator={false} bounces>

          {/* ── Hero ── */}
          <View style={m.hero}>
            {player.imageUrl ? (
              <Image source={{ uri: player.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, m.heroFallback]}>
                <Text style={m.heroIni}>{ini(player.name)}</Text>
              </View>
            )}

            {/* Hero gradient */}
            <LinearGradient
              colors={["rgba(8,8,16,0.3)","transparent","rgba(8,8,16,0.55)","rgba(8,8,16,0.97)"]}
              locations={[0, 0.25, 0.65, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Altın üst çizgi */}
            <View style={m.heroTopLine} />

            {/* Forma no watermark */}
            <Text style={m.heroWm}>{player.jerseyNumber}</Text>

            {/* Kapat */}
            <Pressable style={m.closeBtn} onPress={onClose} hitSlop={16}>
              <Ionicons name="close" size={17} color={C.t1} />
            </Pressable>

            {/* İsim overlay */}
            <View style={m.heroOverlay}>
              <View style={m.heroBadges}>
                <View style={m.posBadge}>
                  <Text style={m.posText}>{posLabel(player.position || "—").toUpperCase()}</Text>
                </View>
                {player.nationalityName ? (
                  <View style={m.natBadge}>
                    <Text style={m.natText}>{player.nationalityName}</Text>
                  </View>
                ) : null}
                {player.isLegend ? (
                  <View style={[m.natBadge, { backgroundColor: `${C.gold}18`, borderColor: `${C.gold}40` }]}>
                    <Ionicons name="star" size={10} color={C.gold} />
                    <Text style={[m.natText, { color: C.gold }]}>Efsane</Text>
                  </View>
                ) : null}
                {player.injuryStatus ? (
                  <View style={[m.natBadge, { backgroundColor: "#EF444418", borderColor: "#EF444440" }]}>
                    <Ionicons name="medical" size={10} color="#EF4444" />
                    <Text style={[m.natText, { color: "#EF4444" }]}>{player.injuryStatus}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={m.heroName}>{player.name.toUpperCase()}</Text>
              {player.commonName && player.commonName !== player.name ? (
                <Text style={m.heroSub}>{player.commonName}</Text>
              ) : null}
            </View>
          </View>

          {/* ── İstatistikler ── */}
          <View style={m.section}>
            <View style={m.sHead}>
              <View style={m.sLine} />
              <Text style={m.sTitle}>OYUNCU BİLGİLERİ</Text>
            </View>
            <View style={m.statsGrid}>
              {[0, 1].map(row => (
                <View key={row} style={[m.statsRow, row === 0 && m.statsRowBorder]}>
                  {stats.slice(row * 4, row * 4 + 4).map((st, ci) => (
                    <View key={ci} style={[m.statsCell, ci < 3 && m.statsBorder]}>
                      <Text style={[m.statsVal, st.gold && { color: C.gold }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
                        {st.val}
                      </Text>
                      <Text style={m.statsLabel}>{st.label}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* ── Biyografi ── */}
          {player.biography ? (
            <View style={m.section}>
              <View style={m.sHead}>
                <View style={m.sLine} />
                <Text style={m.sTitle}>BİYOGRAFİ</Text>
              </View>
              <Text style={m.bio}>{player.biography}</Text>
            </View>
          ) : null}

          {/* ── Sosyal medya ── */}
          {(player.instagramUrl || player.twitterUrl) ? (
            <View style={m.section}>
              <View style={m.sHead}>
                <View style={m.sLine} />
                <Text style={m.sTitle}>SOSYAL MEDYA</Text>
              </View>
              <View style={m.socialWrap}>
                {player.instagramUrl ? (
                  <Pressable style={m.socialBtn} onPress={() => Linking.openURL(player.instagramUrl!)}>
                    <View style={[m.socialIcon, { backgroundColor: "#E1306C20" }]}>
                      <Ionicons name="logo-instagram" size={20} color="#E1306C" />
                    </View>
                    <Text style={[m.socialLabel, { color: "#E1306C" }]}>Instagram</Text>
                    <Ionicons name="chevron-forward" size={15} color={C.t3} style={{ marginLeft: "auto" }} />
                  </Pressable>
                ) : null}
                {player.twitterUrl ? (
                  <Pressable style={m.socialBtn} onPress={() => Linking.openURL(player.twitterUrl!)}>
                    <View style={[m.socialIcon, { backgroundColor: "#1DA1F220" }]}>
                      <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                    </View>
                    <Text style={[m.socialLabel, { color: "#1DA1F2" }]}>Twitter / X</Text>
                    <Ionicons name="chevron-forward" size={15} color={C.t3} style={{ marginLeft: "auto" }} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          <View style={{ height: 56 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ANA EKRAN
// ══════════════════════════════════════════════════════════════════════════════
export default function PlayersScreen() {
  const nav = useNavigation();

  const [players,    setPlayers]    = useState<PlayerDto[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState<PF>("TÜM");
  const [selected,   setSelected]   = useState<PlayerDto | null>(null);
  const [open,       setOpen]       = useState(false);

  const load = useCallback(async () => {
    const r = await playerService.getPlayers("Mens");
    if (r.success && r.data) setPlayers(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  }, [load]);

  const openDetail = useCallback((p: PlayerDto) => {
    setSelected(p); setOpen(true);
  }, []);

  const sections = useMemo(() =>
    GROUPS.map(g => ({
      ...g,
      players: players.filter(p => inGroup(p, g.key)),
    })).filter(s => s.players.length > 0),
  [players]);

  const activeSections = useMemo(() =>
    filter === "TÜM" ? sections : sections.filter(s => s.key === filter),
  [sections, filter]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { TÜM: players.length };
    sections.forEach(s => { m[s.key] = s.players.length; });
    return m;
  }, [sections, players.length]);

  return (
    <View style={p.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={p.hdr}>
        {/* GS stripe */}
        <View style={p.gsStripe}>
          <View style={[p.stripe, { backgroundColor: C.gsRed }]} />
          <View style={[p.stripe, { backgroundColor: C.gold  }]} />
        </View>

        <SafeAreaView edges={["top"]}>
          <View style={p.hdrRow}>
            <Pressable style={p.backBtn} onPress={() => nav.goBack()} hitSlop={14}>
              <Ionicons name="chevron-back" size={22} color={C.t1} />
            </Pressable>
            <View style={p.hdrMid}>
              <Text style={p.hdrSup}>GALATASARAY A.Ş.</Text>
              <Text style={p.hdrTitle}>KADRO</Text>
            </View>
            <View style={p.cntPill}>
              <Text style={p.cntNum}>{players.length}</Text>
              <Text style={p.cntLbl}>oyuncu</Text>
            </View>
          </View>
        </SafeAreaView>

        <View style={p.div} />

        {/* ── Filtre tabları ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={p.tabsWrap}
          style={p.tabsScroll}
        >
          {TABS.map(key => {
            const active = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={[p.tab, active && p.tabActive]}
              >
                <Text style={[p.tabTxt, active && p.tabTxtActive]}>
                  {TAB_LABEL[key]}
                </Text>
                {active && (
                  <View style={p.tabCntWrap}>
                    <Text style={p.tabCntTxt}>{counts[key] ?? 0}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── İçerik ── */}
      {loading ? (
        <View style={p.center}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={p.stateText}>Kadro yükleniyor…</Text>
        </View>
      ) : activeSections.length === 0 ? (
        <View style={p.center}>
          <View style={p.emptyCircle}>
            <Ionicons name="shirt-outline" size={32} color={C.t3} />
          </View>
          <Text style={p.emptyTitle}>Oyuncu bulunamadı</Text>
          <Text style={p.stateText}>Bu filtre için kayıtlı oyuncu yok</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={p.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} colors={[C.gold]} />}
        >
          {activeSections.map(sec => (
            <View key={sec.key} style={p.section}>
              {filter === "TÜM" && (
                <View style={p.secHdr}>
                  <View style={p.secGold} />
                  <Text style={p.secLabel}>{sec.plural}</Text>
                  <Text style={p.secCount}>{sec.players.length}</Text>
                  <View style={p.secLine} />
                </View>
              )}
              {pairs(sec.players).map(([a, b], i) => (
                <View key={i} style={p.row}>
                  <PlayerCard player={a} onPress={() => openDetail(a)} />
                  {b ? <PlayerCard player={b} onPress={() => openDetail(b!)} /> : <View style={{ width: CW }} />}
                </View>
              ))}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <Detail player={selected} visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STİLLER
// ══════════════════════════════════════════════════════════════════════════════

// ── Kart stilleri ──────────────────────────────────────────────────────────────
const $ = StyleSheet.create({
  card: {
    width: CW, height: CH,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: C.surf1,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 16 },
      android: { elevation: 14 },
    }),
  },
  cardFallback: {
    backgroundColor: C.surf2,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIni: {
    fontSize: 52,
    fontWeight: "900",
    color: C.t3,
    letterSpacing: -2,
  },

  cardTopLine: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: C.gold,
    zIndex: 10,
  },

  numBadge: {
    position: "absolute",
    top: 10, right: 10,
    zIndex: 10,
  },
  numText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.gold,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  injuryDot: {
    position: "absolute",
    top: 10, left: 10,
    width: 18, height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  cardBottom: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 11,
    paddingBottom: 12,
    paddingTop: 6,
    zIndex: 5,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "800",
    color: C.t1,
    letterSpacing: 0.4,
    marginBottom: 3,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardPos: {
    fontSize: 10,
    fontWeight: "600",
    color: C.t2,
    letterSpacing: 0.2,
  },
  cardNat: {
    fontSize: 9,
    color: C.t3,
    fontWeight: "500",
    marginTop: 1,
  },
});

// ── Ekran stilleri ─────────────────────────────────────────────────────────────
const p = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },

  // Header
  hdr:     { backgroundColor: C.surf1, borderBottomWidth: 1, borderBottomColor: C.border },
  gsStripe:{ flexDirection: "row", height: 3 },
  stripe:  { flex: 1 },

  hdrRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: PAD, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  hdrMid:  { flex: 1, alignItems: "center" },
  hdrSup:  { fontSize: 9,  fontWeight: "600", color: C.t3, letterSpacing: 2.5, marginBottom: 2 },
  hdrTitle:{ fontSize: 22, fontWeight: "900", color: C.t1, letterSpacing: 6   },

  cntPill: {
    width: 46, alignItems: "center",
    backgroundColor: "rgba(255,199,44,0.08)",
    borderWidth: 1, borderColor: "rgba(255,199,44,0.2)",
    borderRadius: 10, paddingVertical: 5,
  },
  cntNum: { fontSize: 14, fontWeight: "800", color: C.gold },
  cntLbl: { fontSize: 8,  fontWeight: "600", color: C.goldDim, letterSpacing: 0.3 },

  div: { height: StyleSheet.hairlineWidth, backgroundColor: C.border },

  // Tabs
  tabsScroll: { paddingVertical: 10 },
  tabsWrap:   { paddingHorizontal: PAD, gap: 6 },

  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surf2,
  },
  tabActive: {
    backgroundColor: "rgba(255,199,44,0.1)",
    borderColor: "rgba(255,199,44,0.35)",
  },
  tabTxt:       { fontSize: 12, fontWeight: "600", color: C.t3 },
  tabTxtActive: { fontWeight: "700", color: C.gold },
  tabCntWrap: {
    minWidth: 18, height: 17,
    borderRadius: 9,
    backgroundColor: "rgba(255,199,44,0.2)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabCntTxt: { fontSize: 9, fontWeight: "800", color: C.gold },

  // Liste
  list:    { paddingHorizontal: PAD, paddingTop: 14 },
  section: { marginBottom: 4 },
  row:     { flexDirection: "row", gap: GAP, marginBottom: GAP },

  // Bölüm başlığı
  secHdr:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  secGold: { width: 3, height: 15, borderRadius: 2, backgroundColor: C.gold },
  secLabel:{ fontSize: 11, fontWeight: "800", color: C.t2, letterSpacing: 1.8 },
  secCount:{ fontSize: 11, fontWeight: "800", color: C.goldDim },
  secLine: { flex: 1, height: 1, backgroundColor: C.border },

  // Durum
  center:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: C.surf2, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: C.t1 },
  stateText:  { fontSize: 13, color: C.t3 },
});

// ── Modal stilleri ─────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg, paddingTop: 10 },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center", marginBottom: 4,
  },

  hero: {
    width: "100%",
    height: SW * 0.76,
    overflow: "hidden",
    backgroundColor: C.surf1,
  },
  heroFallback: { alignItems: "center", justifyContent: "center" },
  heroIni: { fontSize: 88, fontWeight: "900", color: C.t3 },

  heroTopLine: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 3, backgroundColor: C.gold, zIndex: 10,
  },
  heroWm: {
    position: "absolute", right: -8, top: -8,
    fontSize: 200, fontWeight: "900", letterSpacing: -12,
    lineHeight: 200, color: "rgba(255,255,255,0.04)", zIndex: 1,
  },
  closeBtn: {
    position: "absolute", top: 14, right: PAD, zIndex: 30,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  heroOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAD, paddingBottom: 20, zIndex: 10,
  },
  heroBadges: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 8 },
  posBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255,199,44,0.15)",
    borderWidth: 1, borderColor: "rgba(255,199,44,0.35)",
  },
  posText: { fontSize: 10, fontWeight: "800", color: C.gold, letterSpacing: 1 },
  natBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  natText: { fontSize: 10, color: C.t2, fontWeight: "600" },

  heroName: {
    fontSize: 28, fontWeight: "900", color: C.t1,
    letterSpacing: 0.8, marginBottom: 2,
  },
  heroSub: { fontSize: 13, color: C.t2, fontWeight: "500" },

  // Section
  section: { paddingHorizontal: PAD, marginTop: 24, marginBottom: 4 },
  sHead:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sLine:   { width: 3, height: 12, borderRadius: 2, backgroundColor: C.gold },
  sTitle:  { fontSize: 10, fontWeight: "800", color: C.t3, letterSpacing: 2.4 },

  // İstatistik tablosu
  statsGrid: {
    borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surf2,
  },
  statsRow:       { flexDirection: "row" },
  statsRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  statsCell:      { flex: 1, paddingVertical: 17, alignItems: "center", paddingHorizontal: 4 },
  statsBorder:    { borderRightWidth: 1, borderRightColor: C.border },
  statsVal:       { fontSize: 15, fontWeight: "800", color: C.t1, marginBottom: 5, textAlign: "center" },
  statsLabel:     { fontSize: 8,  fontWeight: "700", color: C.t3, letterSpacing: 0.8, textAlign: "center" },

  bio: {
    fontSize: 14, color: C.t2, lineHeight: 23,
    backgroundColor: C.surf2, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: C.border,
  },

  // Sosyal
  socialWrap: { gap: 8 },
  socialBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surf2, overflow: "hidden",
  },
  socialIcon:  { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  socialLabel: { fontSize: 14, fontWeight: "700" },
});
