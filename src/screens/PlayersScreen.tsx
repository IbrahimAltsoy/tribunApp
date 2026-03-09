/**
 * PlayersScreen — Circular Avatar List redesign
 * Dairesel fotoğraf + pozisyon renkli halka + full-width cam kartlar
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, Pressable, Image, Modal,
  ScrollView, ActivityIndicator, RefreshControl,
  Dimensions, Linking, StatusBar, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { playerService, PlayerDto } from "../services/playerService";
import { colors } from "../theme/colors";

// ─── Sabitler ────────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get("window");
const PAD  = 16;
const AVATAR = 72;

// ─── Pozisyon renk sistemi ────────────────────────────────────────────────────
const POS_COLOR: Record<string, string> = {
  KALECİ:     "#5B9CF6",
  DEFANS:      "#34D399",
  "ORTA SAHA": "#FBBF24",
  FORVET:      "#F87171",
  EFSANELER:   colors.primary,
};

// ─── Tipler & yardımcılar ─────────────────────────────────────────────────────
type PF = "TÜM" | "KALECİ" | "DEFANS" | "ORTA SAHA" | "FORVET" | "EFSANELER";

const GROUPS: { key: PF; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "KALECİ",    label: "Kaleci",   icon: "hand-left-outline" },
  { key: "DEFANS",    label: "Defans",   icon: "shield-outline"    },
  { key: "ORTA SAHA", label: "Orta",     icon: "sync-outline"      },
  { key: "FORVET",    label: "Forvet",   icon: "football-outline"  },
  { key: "EFSANELER", label: "Efsane",   icon: "star-outline"      },
];

const TABS: PF[] = ["TÜM", "KALECİ", "DEFANS", "ORTA SAHA", "FORVET", "EFSANELER"];
const TAB_LABEL: Record<PF, string> = {
  TÜM: "Tümü", KALECİ: "Kaleci", DEFANS: "Defans",
  "ORTA SAHA": "Orta", FORVET: "Forvet", EFSANELER: "Efsane",
};

const KW: Record<string, string[]> = {
  KALECİ:      ["kaleci","goalkeeper"],
  DEFANS:      ["defans","bek","stoper","defender","back"],
  "ORTA SAHA": ["orta saha","midfielder","orta","mid"],
  FORVET:      ["forvet","forward","striker","winger","kanat","attacker"],
};

const inGroup = (p: PlayerDto, key: PF) =>
  key === "EFSANELER"
    ? !!p.isLegend
    : (KW[key] || []).some(kw => (p.position || "").toLowerCase().includes(kw));

const posKey = (pos: string): string => {
  const p = pos.toLowerCase();
  if (p.includes("kaleci") || p.includes("goalkeeper")) return "KALECİ";
  if (p.includes("defans") || p.includes("bek") || p.includes("defender")) return "DEFANS";
  if (p.includes("orta") || p.includes("midfielder")) return "ORTA SAHA";
  if (p.includes("forvet") || p.includes("forward") || p.includes("striker")) return "FORVET";
  return "";
};

const posLabel = (pos: string): string => {
  const p = pos.toLowerCase();
  if (p.includes("kaleci") || p.includes("goalkeeper")) return "Kaleci";
  if (p.includes("defans") || p.includes("bek") || p.includes("defender")) return "Defans";
  if (p.includes("orta") || p.includes("midfielder")) return "Orta Saha";
  if (p.includes("forvet") || p.includes("forward") || p.includes("striker")) return "Forvet";
  return pos;
};

const ini = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const ageOf = (bd?: string | null) =>
  bd ? Math.floor((Date.now() - new Date(bd).getTime()) / 3.15576e10) : null;

// ══════════════════════════════════════════════════════════════════════════════
// OYUNCU KARTI — yatay, dairesel avatar
// ══════════════════════════════════════════════════════════════════════════════
const PlayerCard: React.FC<{ player: PlayerDto; onPress: () => void }> = ({ player, onPress }) => {
  const pk     = player.isLegend ? "EFSANELER" : posKey(player.position || "");
  const accent = POS_COLOR[pk] || colors.textTertiary;
  const label  = player.isLegend ? "Efsane" : posLabel(player.position || "");
  const name   = player.commonName || player.name;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        card.wrap,
        pressed && { opacity: 0.75, transform: [{ scale: 0.975 }] },
      ]}
    >
      {/* Sol renkli çubuk */}
      <View style={[card.stripe, { backgroundColor: accent }]} />

      {/* Dairesel avatar */}
      <View style={[card.ring, { borderColor: `${accent}70` }]}>
        <View style={[card.ringInner, { borderColor: `${accent}30` }]}>
          {player.imageUrl ? (
            <Image source={{ uri: player.imageUrl }} style={card.photo} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[`${accent}35`, `${accent}12`]} style={card.avatarFallback}>
              <Text style={[card.ini, { color: accent }]}>{ini(player.name)}</Text>
            </LinearGradient>
          )}
        </View>
      </View>

      {/* Bilgi */}
      <View style={card.info}>
        <Text style={card.name} numberOfLines={1}>{name}</Text>
        <View style={card.meta}>
          <View style={[card.posBadge, { backgroundColor: `${accent}18`, borderColor: `${accent}40` }]}>
            <Text style={[card.posText, { color: accent }]}>{label}</Text>
          </View>
          {player.nationalityName ? (
            <Text style={card.nat} numberOfLines={1}>{player.nationalityName}</Text>
          ) : null}
        </View>
      </View>

      {/* Sağ — forma no */}
      <View style={card.right}>
        <View style={[card.numCircle, { borderColor: `${accent}35`, backgroundColor: `${accent}10` }]}>
          <Text style={[card.numText, { color: accent }]}>{player.jerseyNumber}</Text>
        </View>
        {player.injuryStatus ? (
          <Ionicons name="medical" size={11} color={colors.error} style={{ marginTop: 4 }} />
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

  const pk     = player.isLegend ? "EFSANELER" : posKey(player.position || "");
  const accent = POS_COLOR[pk] || colors.textTertiary;
  const age    = player.age ?? ageOf(player.birthDate);
  const name   = player.commonName || player.name;

  const stats: { label: string; val: string; hi?: boolean }[] = [
    { label: "FORMA",  val: `#${player.jerseyNumber}`,           hi: true },
    { label: "YAŞ",    val: age ? `${age}` : "—"                         },
    { label: "BOY",    val: player.height ? `${player.height} cm` : "—"  },
    { label: "KİLO",   val: player.weight ? `${player.weight} kg` : "—"  },
    { label: "AYAK",   val: player.preferredFoot   || "—"                 },
    { label: "UYRUK",  val: player.nationalityName || "—"                 },
    { label: "DOĞUM",  val: player.birthPlace || "—"                      },
    { label: "DEĞER",  val: player.marketValue || "—",            hi: true },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={md.root}>
        {/* Handle */}
        <View style={md.handle} />

        {/* Kapat */}
        <Pressable style={md.closeBtn} onPress={onClose} hitSlop={14}>
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false} bounces contentContainerStyle={{ paddingBottom: 60 }}>

          {/* ── Hero alanı: gradient zemin + büyük dairesel fotoğraf ── */}
          <LinearGradient
            colors={[`${accent}28`, `${accent}08`, colors.background]}
            locations={[0, 0.55, 1]}
            style={md.hero}
          >
            {/* Büyük dairesel avatar */}
            <View style={[md.bigRing, { borderColor: `${accent}60` }]}>
              <View style={[md.bigRingInner, { borderColor: `${accent}28` }]}>
                {player.imageUrl ? (
                  <Image source={{ uri: player.imageUrl }} style={md.bigPhoto} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={[`${accent}40`, `${accent}15`]} style={md.bigFallback}>
                    <Text style={[md.bigIni, { color: accent }]}>{ini(player.name)}</Text>
                  </LinearGradient>
                )}
              </View>
            </View>

            {/* Jersey watermark */}
            <Text style={[md.jersey, { color: `${accent}12` }]}>{player.jerseyNumber}</Text>

            {/* İsim & rozetler */}
            <View style={md.heroInfo}>
              <Text style={md.heroName}>{name.toUpperCase()}</Text>
              {player.commonName && player.commonName !== player.name && (
                <Text style={md.heroFull}>{player.name}</Text>
              )}
              <View style={md.badgeRow}>
                <View style={[md.badge, { backgroundColor: `${accent}20`, borderColor: `${accent}50` }]}>
                  <Text style={[md.badgeText, { color: accent }]}>
                    {player.isLegend ? "EFSANE" : posLabel(player.position || "").toUpperCase()}
                  </Text>
                </View>
                {player.nationalityName && (
                  <View style={md.badgeNeutral}>
                    <Text style={md.badgeNeutralText}>{player.nationalityName}</Text>
                  </View>
                )}
                {player.isLegend && (
                  <View style={[md.badge, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}50` }]}>
                    <Ionicons name="star" size={9} color={colors.primary} />
                    <Text style={[md.badgeText, { color: colors.primary, marginLeft: 3 }]}>Efsane</Text>
                  </View>
                )}
                {player.injuryStatus && (
                  <View style={[md.badge, { backgroundColor: "rgba(248,113,113,0.18)", borderColor: "rgba(248,113,113,0.45)" }]}>
                    <Ionicons name="medical" size={9} color={colors.error} />
                    <Text style={[md.badgeText, { color: colors.error, marginLeft: 3 }]}>{player.injuryStatus}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* ── İstatistikler ── */}
          <View style={md.section}>
            <ModalSecHead title="OYUNCU BİLGİLERİ" accent={accent} />
            <View style={md.statsGrid}>
              {[0, 1].map(row => (
                <View key={row} style={[md.statsRow, row === 0 && md.statsRowDiv]}>
                  {stats.slice(row * 4, row * 4 + 4).map((s, ci) => (
                    <View key={ci} style={[md.statsCell, ci < 3 && md.statsCellDiv]}>
                      <Text
                        style={[md.statsVal, s.hi && { color: accent }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.65}
                      >
                        {s.val}
                      </Text>
                      <Text style={md.statsKey}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* ── Biyografi ── */}
          {player.biography ? (
            <View style={md.section}>
              <ModalSecHead title="BİYOGRAFİ" accent={accent} />
              <View style={md.bioBox}>
                <Text style={md.bioText}>{player.biography}</Text>
              </View>
            </View>
          ) : null}

          {/* ── Sosyal medya ── */}
          {(player.instagramUrl || player.twitterUrl) ? (
            <View style={md.section}>
              <ModalSecHead title="SOSYAL MEDYA" accent={accent} />
              <View style={{ gap: 8 }}>
                {player.instagramUrl && (
                  <SocialBtn icon="logo-instagram" label="Instagram" color="#E1306C" onPress={() => Linking.openURL(player.instagramUrl!)} />
                )}
                {player.twitterUrl && (
                  <SocialBtn icon="logo-twitter" label="Twitter / X" color="#1DA1F2" onPress={() => Linking.openURL(player.twitterUrl!)} />
                )}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
};

// ─── Modal bölüm başlığı ──────────────────────────────────────────────────────
const ModalSecHead: React.FC<{ title: string; accent: string }> = ({ title, accent }) => (
  <View style={msh.row}>
    <View style={[msh.bar, { backgroundColor: accent }]} />
    <Text style={msh.title}>{title}</Text>
    <View style={msh.line} />
  </View>
);

// ─── Sosyal buton ────────────────────────────────────────────────────────────
const SocialBtn: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}> = ({ icon, label, color, onPress }) => (
  <Pressable
    style={({ pressed }) => [sb.row, pressed && { opacity: 0.7 }]}
    onPress={onPress}
  >
    <View style={[sb.icon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={[sb.label, { color }]}>{label}</Text>
    <Ionicons name="open-outline" size={14} color={colors.textQuaternary} style={{ marginLeft: "auto" }} />
  </Pressable>
);

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
    setRefreshing(true);
    await load();
    setRefreshing(false);
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
    <View style={scr.root}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={[`${colors.primary}10`, colors.backgroundElevated, colors.backgroundElevated]}
        locations={[0, 0.5, 1]}
        style={scr.headerWrap}
      >
        <SafeAreaView edges={["top"]}>
          <View style={scr.headerRow}>
            <Pressable style={scr.backBtn} onPress={() => nav.goBack()} hitSlop={14}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>

            <View style={scr.headerMid}>
              <Text style={scr.headerSup}>GALATASARAY A.Ş.</Text>
              <Text style={scr.headerTitle}>KADRO</Text>
            </View>

            <View style={scr.countPill}>
              <Text style={scr.countNum}>{players.length}</Text>
              <Text style={scr.countLbl}>oyuncu</Text>
            </View>
          </View>
        </SafeAreaView>

        <View style={scr.divider} />

        {/* ── Filtre tabları ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={scr.tabsInner}
          style={{ paddingVertical: 10 }}
        >
          {TABS.map(key => {
            const active = filter === key;
            const col    = key === "TÜM" ? colors.primary : (POS_COLOR[key] ?? colors.primary);
            const g      = GROUPS.find(x => x.key === key);
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={[scr.tab, active && { backgroundColor: `${col}18`, borderColor: `${col}55` }]}
              >
                {g && (
                  <Ionicons name={g.icon} size={11} color={active ? col : colors.textQuaternary} />
                )}
                <Text style={[scr.tabTxt, active && { color: col }]}>
                  {TAB_LABEL[key]}
                </Text>
                {active && counts[key] != null && (
                  <View style={[scr.tabBadge, { backgroundColor: `${col}25` }]}>
                    <Text style={[scr.tabBadgeTxt, { color: col }]}>{counts[key]}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* ── İÇERİK ── */}
      {loading ? (
        <View style={scr.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={scr.stateText}>Kadro yükleniyor…</Text>
        </View>
      ) : activeSections.length === 0 ? (
        <View style={scr.center}>
          <View style={scr.emptyCircle}>
            <Ionicons name="shirt-outline" size={28} color={colors.textQuaternary} />
          </View>
          <Text style={scr.emptyTitle}>Oyuncu bulunamadı</Text>
          <Text style={scr.stateText}>Bu filtre için kayıtlı oyuncu yok</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scr.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {activeSections.map(sec => {
            const secCol = POS_COLOR[sec.key] ?? colors.primary;
            return (
              <View key={sec.key} style={scr.section}>
                {filter === "TÜM" && (
                  <View style={scr.secHdr}>
                    <View style={[scr.secDot, { backgroundColor: secCol }]} />
                    <Text style={[scr.secLabel, { color: secCol }]}>{sec.label.toUpperCase()}</Text>
                    <View style={[scr.secBadge, { backgroundColor: `${secCol}18`, borderColor: `${secCol}38` }]}>
                      <Text style={[scr.secBadgeTxt, { color: secCol }]}>{sec.players.length}</Text>
                    </View>
                    <View style={scr.secLine} />
                  </View>
                )}
                <View style={scr.cards}>
                  {sec.players.map(p => (
                    <PlayerCard key={p.id} player={p} onPress={() => openDetail(p)} />
                  ))}
                </View>
              </View>
            );
          })}
          <View style={{ height: 48 }} />
        </ScrollView>
      )}

      <Detail player={selected} visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STİLLER
// ══════════════════════════════════════════════════════════════════════════════

// ── Kart ──────────────────────────────────────────────────────────────────────
const card = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 14,
    overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  stripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  // Dış halka
  ring: {
    width: AVATAR + 6,
    height: AVATAR + 6,
    borderRadius: (AVATAR + 6) / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  // İç halkası
  ringInner: {
    width: AVATAR + 1,
    height: AVATAR + 1,
    borderRadius: (AVATAR + 1) / 2,
    borderWidth: 1,
    overflow: "hidden",
  },
  photo: {
    width: AVATAR + 1,
    height: AVATAR + 1,
    borderRadius: (AVATAR + 1) / 2,
  },
  avatarFallback: {
    width: AVATAR + 1,
    height: AVATAR + 1,
    borderRadius: (AVATAR + 1) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ini: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -1,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  posBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  posText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  nat: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "500",
  },
  right: {
    alignItems: "center",
    gap: 4,
  },
  numCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  numText: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
});

// ── Ekran ──────────────────────────────────────────────────────────────────────
const scr = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  headerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PAD,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    alignItems: "center",
    justifyContent: "center",
  },
  headerMid: {
    flex: 1,
    alignItems: "center",
  },
  headerSup: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textQuaternary,
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 7,
  },
  countPill: {
    width: 46,
    alignItems: "center",
    backgroundColor: `${colors.primary}12`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    borderRadius: 14,
    paddingVertical: 5,
  },
  countNum: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  countLbl: {
    fontSize: 8,
    fontWeight: "600",
    color: `${colors.primary}80`,
    letterSpacing: 0.3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginHorizontal: PAD,
  },

  // Filtre tabları
  tabsInner: {
    paddingHorizontal: PAD,
    gap: 7,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tabTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textTertiary,
  },
  tabBadge: {
    minWidth: 18,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeTxt: {
    fontSize: 9,
    fontWeight: "800",
  },

  // Liste
  list: {
    paddingHorizontal: PAD,
    paddingTop: 14,
  },
  section: {
    marginBottom: 8,
  },
  cards: {
    gap: 9,
  },

  // Bölüm başlığı
  secHdr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    marginTop: 6,
  },
  secDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  secLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  secBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  secBadgeTxt: {
    fontSize: 10,
    fontWeight: "800",
  },
  secLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
  },

  // Durum
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  stateText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});

// ── Modal ──────────────────────────────────────────────────────────────────────
const md = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassStrong,
    alignSelf: "center",
    marginBottom: 4,
  },
  closeBtn: {
    position: "absolute",
    top: 18,
    right: PAD,
    zIndex: 30,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero — gradient zemin + büyük dairesel avatar
  hero: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: PAD,
    overflow: "hidden",
  },
  bigRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios:     { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  bigRingInner: {
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 2,
    overflow: "hidden",
  },
  bigPhoto: {
    width: 138,
    height: 138,
    borderRadius: 69,
  },
  bigFallback: {
    width: 138,
    height: 138,
    borderRadius: 69,
    alignItems: "center",
    justifyContent: "center",
  },
  bigIni: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -2,
  },
  jersey: {
    position: "absolute",
    right: 10,
    top: 10,
    fontSize: 120,
    fontWeight: "900",
    letterSpacing: -8,
    lineHeight: 130,
    zIndex: 0,
  },
  heroInfo: {
    alignItems: "center",
    marginTop: 18,
    gap: 8,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 1,
    textAlign: "center",
  },
  heroFull: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: -4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  badgeNeutral: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  badgeNeutralText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "600",
  },

  // Bölüm
  section: {
    paddingHorizontal: PAD,
    marginTop: 22,
  },

  // Stats
  statsGrid: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  statsRow: { flexDirection: "row" },
  statsRowDiv: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  statsCell: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  statsCellDiv: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.borderLight,
  },
  statsVal: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 5,
    textAlign: "center",
  },
  statsKey: {
    fontSize: 8,
    fontWeight: "700",
    color: colors.textQuaternary,
    letterSpacing: 0.8,
    textAlign: "center",
  },

  // Biyografi
  bioBox: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

// ── Modal bölüm başlığı ───────────────────────────────────────────────────────
const msh = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  bar: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  title: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textQuaternary,
    letterSpacing: 2.4,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
  },
});

// ── Sosyal buton ──────────────────────────────────────────────────────────────
const sb = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
});
