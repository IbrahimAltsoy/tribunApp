/**
 * PlayersScreen — Premium V2
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, Pressable, Image, Modal,
  ScrollView, ActivityIndicator, RefreshControl,
  Linking, StatusBar, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { playerService, PlayerDto } from "../services/playerService";
import { colors } from "../theme/colors";

// ─── Design tokens ────────────────────────────────────────────────────────────
const PAD        = 16;
const AVATAR     = 62;
const LEG_AVATAR = 80;
const GOLD       = "#C8A84B";

const POS: Record<string, string> = {
  KALECİ:      "#5490F5",
  DEFANS:       "#27BF77",
  "ORTA SAHA":  "#EFAA2A",
  FORVET:       "#F05252",
  EFSANELER:    GOLD,
};

// ─── Types & constants ────────────────────────────────────────────────────────
type PF = "TÜM" | "KALECİ" | "DEFANS" | "ORTA SAHA" | "FORVET" | "EFSANELER";

const GROUPS: { key: PF; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "KALECİ",    label: "Kaleci",  icon: "hand-left-outline" },
  { key: "DEFANS",    label: "Defans",  icon: "shield-outline"    },
  { key: "ORTA SAHA", label: "Orta",    icon: "sync-outline"      },
  { key: "FORVET",    label: "Forvet",  icon: "football-outline"  },
  { key: "EFSANELER", label: "Efsane",  icon: "star-outline"      },
];

const TABS: PF[] = ["TÜM", "KALECİ", "DEFANS", "ORTA SAHA", "FORVET", "EFSANELER"];
const TAB_LABEL: Record<PF, string> = {
  TÜM: "Tümü", KALECİ: "Kaleci", DEFANS: "Defans",
  "ORTA SAHA": "Orta", FORVET: "Forvet", EFSANELER: "Efsane",
};

const KW: Record<string, string[]> = {
  KALECİ:      ["kaleci", "goalkeeper"],
  DEFANS:      ["defans", "bek", "stoper", "defender", "back"],
  "ORTA SAHA": ["orta saha", "midfielder", "orta", "mid"],
  FORVET:      ["forvet", "forward", "striker", "winger", "kanat", "attacker"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inGroup = (p: PlayerDto, key: PF) =>
  key === "EFSANELER"
    ? !!p.isLegend
    : !p.isLegend && (KW[key] || []).some(kw => (p.position || "").toLowerCase().includes(kw));

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

const ini   = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const ageOf = (bd?: string | null) =>
  bd ? Math.floor((Date.now() - new Date(bd).getTime()) / 3.15576e10) : null;

// ══════════════════════════════════════════════════════════════════════════════
// PLAYER CARD
// ══════════════════════════════════════════════════════════════════════════════
const PlayerCard: React.FC<{ player: PlayerDto; onPress: () => void }> = ({ player, onPress }) => {
  const pk     = player.isLegend ? "EFSANELER" : posKey(player.position || "");
  const accent = POS[pk] || colors.textTertiary;
  const label  = posLabel(player.position || "");
  const name   = player.commonName || player.name;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pc.wrap,
        pressed && { opacity: 0.78, transform: [{ scale: 0.982 }] },
      ]}
    >
      {/* Position-tinted gradient wash */}
      <LinearGradient
        colors={[`${accent}1C`, "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Left accent strip */}
      <View style={[pc.strip, { backgroundColor: accent }]} />

      {/* Avatar */}
      <View style={[pc.av, { borderColor: `${accent}55` }]}>
        {player.imageUrl ? (
          <Image source={{ uri: player.imageUrl }} style={pc.avImg} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[`${accent}38`, `${accent}0C`]} style={pc.avFb}>
            <Text style={[pc.avIni, { color: accent }]}>{ini(player.name)}</Text>
          </LinearGradient>
        )}
      </View>

      {/* Info */}
      <View style={pc.info}>
        <Text style={pc.name} numberOfLines={1}>{name}</Text>
        <View style={pc.posRow}>
          <View style={[pc.posDot, { backgroundColor: accent }]} />
          <Text style={[pc.posText, { color: `${accent}CC` }]}>{label}</Text>
        </View>
      </View>

      {/* Jersey number */}
      <Text style={[pc.num, { color: `${accent}90` }]}>{player.jerseyNumber}</Text>
    </Pressable>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// LEGEND CARD
// ══════════════════════════════════════════════════════════════════════════════
const LegendCard: React.FC<{ player: PlayerDto; onPress: () => void }> = ({ player, onPress }) => {
  const name = player.commonName || player.name;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        lc.wrap,
        pressed && { opacity: 0.78, transform: [{ scale: 0.982 }] },
      ]}
    >
      {/* Gold gradient background */}
      <LinearGradient
        colors={[`${GOLD}22`, `${GOLD}08`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top gold line */}
      <LinearGradient
        colors={[GOLD, `${GOLD}00`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={lc.topBar}
      />

      {/* Left strip */}
      <View style={[lc.strip, { backgroundColor: GOLD }]} />

      {/* Star watermark */}
      <Text style={lc.starWm}>★</Text>

      {/* Main row */}
      <View style={lc.row}>
        {/* Avatar */}
        <View style={[lc.av, { borderColor: `${GOLD}60` }]}>
          {player.imageUrl ? (
            <Image source={{ uri: player.imageUrl }} style={lc.avImg} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[`${GOLD}45`, `${GOLD}15`]} style={lc.avFb}>
              <Text style={[lc.avIni, { color: GOLD }]}>{ini(player.name)}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Info */}
        <View style={lc.info}>
          <View style={lc.badge}>
            <Ionicons name="star" size={8} color={GOLD} />
            <Text style={lc.badgeTxt}>EFSANE</Text>
          </View>
          <Text style={lc.name} numberOfLines={1}>{name}</Text>
          {player.biography ? (
            <Text style={lc.bio} numberOfLines={2}>{player.biography}</Text>
          ) : null}
        </View>

        {/* Jersey number */}
        <Text style={lc.num}>{player.jerseyNumber}</Text>
      </View>
    </Pressable>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL MODAL
// ══════════════════════════════════════════════════════════════════════════════
const Detail: React.FC<{
  player: PlayerDto | null;
  visible: boolean;
  onClose: () => void;
}> = ({ player, visible, onClose }) => {
  if (!player) return null;

  const pk     = player.isLegend ? "EFSANELER" : posKey(player.position || "");
  const accent = POS[pk] || colors.textTertiary;
  const age    = player.age ?? ageOf(player.birthDate);
  const name   = player.commonName || player.name;

  const birthDateFmt = player.birthDate
    ? new Date(player.birthDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  const stats: { label: string; val: string; hi?: boolean }[] = [
    { label: "FORMA",  val: `#${player.jerseyNumber}`,                   hi: true },
    { label: "MEVKİ",  val: player.isLegend ? "Efsane" : posLabel(player.position || "") },
    { label: "BOY",    val: player.height ? `${player.height} cm` : "—" },
    { label: "KİLO",   val: player.weight ? `${player.weight} kg` : "—" },
    { label: "YAŞ",    val: age ? `${age}` : "—"                        },
    { label: "ÜLKE",   val: player.nationalityName || "—"                },
    { label: "DOĞUM",  val: birthDateFmt                                 },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={dm.root}>
        <View style={dm.handle} />
        <Pressable style={dm.closeBtn} onPress={onClose} hitSlop={16}>
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false} bounces contentContainerStyle={{ paddingBottom: 60 }}>

          {/* ── Hero ── */}
          <LinearGradient
            colors={[`${accent}30`, `${accent}0E`, colors.background]}
            locations={[0, 0.5, 1]}
            style={dm.hero}
          >
            <Text style={[dm.jerseyWm, { color: `${accent}0D` }]}>{player.jerseyNumber}</Text>

            <View style={[dm.avRing, { borderColor: `${accent}55` }]}>
              <View style={[dm.avInner, { borderColor: `${accent}22` }]}>
                {player.imageUrl ? (
                  <Image source={{ uri: player.imageUrl }} style={dm.avImg} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={[`${accent}42`, `${accent}12`]} style={dm.avFb}>
                    <Text style={[dm.avIni, { color: accent }]}>{ini(player.name)}</Text>
                  </LinearGradient>
                )}
              </View>
            </View>

            <View style={dm.heroInfo}>
              <Text style={dm.heroName}>{name.toUpperCase()}</Text>
              {player.commonName && player.commonName !== player.name && (
                <Text style={dm.heroSubName}>{player.name}</Text>
              )}
              <View style={dm.badgeRow}>
                <View style={[dm.badge, { backgroundColor: `${accent}1E`, borderColor: `${accent}45` }]}>
                  <Text style={[dm.badgeTxt, { color: accent }]}>
                    {player.isLegend ? "EFSANE" : posLabel(player.position || "").toUpperCase()}
                  </Text>
                </View>
                {player.nationalityName ? (
                  <View style={dm.badgeGlass}>
                    <Text style={dm.badgeGlassTxt}>{player.nationalityName}</Text>
                  </View>
                ) : null}
                {player.isLegend ? (
                  <View style={[dm.badge, { backgroundColor: `${GOLD}1E`, borderColor: `${GOLD}45` }]}>
                    <Ionicons name="star" size={9} color={GOLD} />
                    <Text style={[dm.badgeTxt, { color: GOLD, marginLeft: 3 }]}>Efsane</Text>
                  </View>
                ) : null}
                {player.injuryStatus ? (
                  <View style={[dm.badge, { backgroundColor: "rgba(240,82,82,0.18)", borderColor: "rgba(240,82,82,0.40)" }]}>
                    <Ionicons name="medical" size={9} color={colors.error} />
                    <Text style={[dm.badgeTxt, { color: colors.error, marginLeft: 3 }]}>{player.injuryStatus}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </LinearGradient>

          {/* ── Stats ── */}
          <View style={dm.section}>
            <SecHead title="OYUNCU BİLGİLERİ" accent={accent} />
            <View style={dm.grid}>
              {(() => {
                const half = Math.ceil(stats.length / 2);
                return [stats.slice(0, half), stats.slice(half)].map((row, ri) => (
                  <View key={ri} style={[dm.gridRow, ri === 0 && dm.gridRowDiv]}>
                    {row.map((s, ci) => (
                      <View key={ci} style={[dm.gridCell, ci < row.length - 1 && dm.gridCellDiv]}>
                        <Text
                          style={[dm.cellVal, s.hi && { color: accent }]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.65}
                        >
                          {s.val}
                        </Text>
                        <Text style={dm.cellKey}>{s.label}</Text>
                      </View>
                    ))}
                  </View>
                ));
              })()}
            </View>
          </View>

          {/* ── Biography ── */}
          {player.biography ? (
            <View style={dm.section}>
              <SecHead title="BİYOGRAFİ" accent={accent} />
              <View style={dm.bioBox}>
                <Text style={dm.bioTxt}>{player.biography}</Text>
              </View>
            </View>
          ) : null}

          {/* ── Social ── */}
          {(player.instagramUrl || player.twitterUrl) ? (
            <View style={dm.section}>
              <SecHead title="SOSYAL MEDYA" accent={accent} />
              <View style={{ gap: 8 }}>
                {player.instagramUrl ? (
                  <SocialBtn icon="logo-instagram" label="Instagram" color="#E1306C" onPress={() => Linking.openURL(player.instagramUrl!)} />
                ) : null}
                {player.twitterUrl ? (
                  <SocialBtn icon="logo-twitter" label="Twitter / X" color="#1DA1F2" onPress={() => Linking.openURL(player.twitterUrl!)} />
                ) : null}
              </View>
            </View>
          ) : null}

        </ScrollView>
      </View>
    </Modal>
  );
};

// ─── Section head ─────────────────────────────────────────────────────────────
const SecHead: React.FC<{ title: string; accent: string }> = ({ title, accent }) => (
  <View style={sh.row}>
    <View style={[sh.bar, { backgroundColor: accent }]} />
    <Text style={sh.title}>{title}</Text>
    <View style={sh.line} />
  </View>
);

// ─── Social button ────────────────────────────────────────────────────────────
const SocialBtn: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}> = ({ icon, label, color, onPress }) => (
  <Pressable style={({ pressed }) => [sb.row, pressed && { opacity: 0.7 }]} onPress={onPress}>
    <View style={[sb.iconWrap, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={[sb.label, { color }]}>{label}</Text>
    <Ionicons name="open-outline" size={14} color={colors.textQuaternary} style={{ marginLeft: "auto" }} />
  </Pressable>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
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
    filter === "TÜM"
      ? sections.filter(s => s.key !== "EFSANELER")
      : sections.filter(s => s.key === filter),
  [sections, filter]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { TÜM: players.filter(p => !p.isLegend).length };
    sections.forEach(s => { m[s.key] = s.players.length; });
    return m;
  }, [sections, players]);

  return (
    <View style={scr.root}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={[`${colors.primary}16`, colors.backgroundElevated, colors.backgroundElevated]}
        locations={[0, 0.55, 1]}
        style={scr.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={scr.headerRow}>
            <Pressable style={scr.backBtn} onPress={() => nav.goBack()} hitSlop={16}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>

            <View style={scr.headerCenter}>
              <Text style={scr.headerEyebrow}>GALATASARAY A.Ş.</Text>
              <Text style={scr.headerTitle}>KADRO</Text>
            </View>

            <View style={scr.countBadge}>
              <Text style={scr.countNum}>{players.filter(p => !p.isLegend).length}</Text>
              <Text style={scr.countLbl}>oyuncu</Text>
            </View>
          </View>
        </SafeAreaView>

        <View style={scr.headerDivider} />

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={scr.tabsInner}
          style={{ paddingVertical: 10 }}
        >
          {TABS.map(key => {
            const active = filter === key;
            const col    = key === "TÜM" ? colors.primary : (POS[key] ?? colors.primary);
            const g      = GROUPS.find(x => x.key === key);
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={[
                  scr.tab,
                  active
                    ? { backgroundColor: col, borderColor: col }
                    : { backgroundColor: "transparent", borderColor: colors.border },
                ]}
              >
                {g && (
                  <Ionicons
                    name={g.icon}
                    size={11}
                    color={active ? "#FFFFFF" : colors.textQuaternary}
                  />
                )}
                <Text style={[scr.tabTxt, active && scr.tabTxtActive]}>
                  {TAB_LABEL[key]}
                </Text>
                {active && counts[key] != null && (
                  <View style={scr.tabCount}>
                    <Text style={scr.tabCountTxt}>{counts[key]}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* ── CONTENT ── */}
      {loading ? (
        <View style={scr.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={scr.stateText}>Kadro yükleniyor…</Text>
        </View>
      ) : activeSections.length === 0 ? (
        <View style={scr.center}>
          <View style={scr.emptyIcon}>
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
            const secCol = POS[sec.key] ?? colors.primary;
            return (
              <View key={sec.key} style={scr.section}>
                {filter === "TÜM" && (
                  <View style={scr.secHdr}>
                    <View style={[scr.secDot, { backgroundColor: secCol }]} />
                    <Text style={[scr.secLabel, { color: secCol }]}>
                      {sec.label.toUpperCase()}
                    </Text>
                    <View style={[scr.secCount, { backgroundColor: `${secCol}15`, borderColor: `${secCol}32` }]}>
                      <Text style={[scr.secCountTxt, { color: secCol }]}>{sec.players.length}</Text>
                    </View>
                    <View style={[scr.secLine, { backgroundColor: `${secCol}18` }]} />
                  </View>
                )}
                <View style={scr.cards}>
                  {sec.players.map(p =>
                    p.isLegend
                      ? <LegendCard key={p.id} player={p} onPress={() => openDetail(p)} />
                      : <PlayerCard key={p.id} player={p} onPress={() => openDetail(p)} />
                  )}
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
// STYLES
// ══════════════════════════════════════════════════════════════════════════════

// ── Player card ───────────────────────────────────────────────────────────────
const pc = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    paddingRight: 16,
    paddingLeft: 18,
    gap: 14,
    overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  strip: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: 3,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  av: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  avImg: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  avFb: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avIni: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.1,
  },
  posRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  posDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  posText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  num: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1.5,
    minWidth: 36,
    textAlign: "right",
  },
});

// ── Legend card ───────────────────────────────────────────────────────────────
const lc = StyleSheet.create({
  wrap: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${GOLD}42`,
    overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: GOLD, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14 },
      android: { elevation: 7 },
    }),
  },
  topBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 2,
  },
  strip: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: 3,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  starWm: {
    position: "absolute",
    right: 8,
    top: -8,
    fontSize: 100,
    color: `${GOLD}0A`,
    fontWeight: "900",
    lineHeight: 110,
    zIndex: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 16,
    zIndex: 1,
  },
  av: {
    width: LEG_AVATAR,
    height: LEG_AVATAR,
    borderRadius: LEG_AVATAR / 2,
    borderWidth: 2,
    overflow: "hidden",
  },
  avImg: {
    width: LEG_AVATAR,
    height: LEG_AVATAR,
    borderRadius: LEG_AVATAR / 2,
  },
  avFb: {
    width: LEG_AVATAR,
    height: LEG_AVATAR,
    borderRadius: LEG_AVATAR / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avIni: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: `${GOLD}18`,
    borderWidth: 1,
    borderColor: `${GOLD}40`,
  },
  badgeTxt: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: GOLD,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.1,
  },
  bio: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    fontStyle: "italic",
  },
  num: {
    fontSize: 32,
    fontWeight: "900",
    color: `${GOLD}70`,
    letterSpacing: -2,
    minWidth: 40,
    textAlign: "right",
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────
const scr = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerEyebrow: {
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
  countBadge: {
    width: 46,
    alignItems: "center",
    backgroundColor: `${colors.primary}12`,
    borderWidth: 1,
    borderColor: `${colors.primary}28`,
    borderRadius: 14,
    paddingVertical: 5,
  },
  countNum: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    lineHeight: 18,
  },
  countLbl: {
    fontSize: 8,
    fontWeight: "600",
    color: `${colors.primary}70`,
    letterSpacing: 0.2,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginHorizontal: PAD,
  },
  tabsInner: {
    paddingHorizontal: PAD,
    gap: 7,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textTertiary,
  },
  tabTxtActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  tabCount: {
    minWidth: 18,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabCountTxt: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
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
  secHdr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  secDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  secLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.2,
  },
  secCount: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  secCountTxt: {
    fontSize: 10,
    fontWeight: "800",
  },
  secLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyIcon: {
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

// ── Detail modal ──────────────────────────────────────────────────────────────
const dm = StyleSheet.create({
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
  hero: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: PAD,
    overflow: "hidden",
  },
  jerseyWm: {
    position: "absolute",
    right: 8,
    top: 8,
    fontSize: 120,
    fontWeight: "900",
    letterSpacing: -8,
    lineHeight: 130,
    zIndex: 0,
  },
  avRing: {
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios:     { shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } },
      android: { elevation: 12 },
    }),
  },
  avInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    overflow: "hidden",
  },
  avImg: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avFb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  avIni: {
    fontSize: 50,
    fontWeight: "900",
    letterSpacing: -2,
  },
  heroInfo: {
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  heroSubName: {
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
  badgeTxt: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  badgeGlass: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  badgeGlassTxt: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: PAD,
    marginTop: 24,
  },
  grid: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  gridRow: { flexDirection: "row" },
  gridRowDiv: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  gridCell: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  gridCellDiv: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.borderLight,
  },
  cellVal: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 5,
    textAlign: "center",
  },
  cellKey: {
    fontSize: 8,
    fontWeight: "700",
    color: colors.textQuaternary,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  bioBox: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioTxt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

// ── Section head ──────────────────────────────────────────────────────────────
const sh = StyleSheet.create({
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

// ── Social button ─────────────────────────────────────────────────────────────
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
  iconWrap: {
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
