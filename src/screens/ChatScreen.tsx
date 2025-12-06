// == Yeni Senior & Modern Tasarım Chat Screen ==
// hero küçültüldü, UI akışı hızlandırıldı, minimal/şık hale getirildi.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import ChatBubble, { Message } from "../components/ChatBubble";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import randomNameGenerator from "../utils/randomNameGenerator";
import { matchRooms, MatchRoomPhase } from "../data/mockData";

const ChatScreen = () => {
  const [nickname, setNickname] = useState(randomNameGenerator());
  const [inputText, setInputText] = useState("");
  const [activePhase, setActivePhase] = useState<MatchRoomPhase>("pre");
  const [selectedRoom, setSelectedRoom] = useState(matchRooms[0].id);

  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList>(null);

  const roomMessages = useMemo(
    () =>
      matchRooms.reduce((acc, room: any) => {
        acc[room.id] = room.messages;
        return acc;
      }, {} as Record<string, Message[]>),
    []
  );

  const currentMessages = roomMessages[selectedRoom];

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    Animated.sequence([
      Animated.spring(sendButtonScale, {
        toValue: 0.85,
        useNativeDriver: true,
      }),
      Animated.spring(sendButtonScale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    currentMessages.push({
      id: Date.now().toString(),
      text: inputText,
      sender: nickname,
      timestamp: "",
      isMine: true,
    });

    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputText, nickname]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0fa958", "#0fa95890", colors.background]}
        style={styles.heroSmall}
      >
        <View>
          <Text style={styles.heroTitle}>Amedspor Sohbet</Text>
          <Text style={styles.heroSub}>Maç öncesi & sonrası muhabbet</Text>
        </View>
      </LinearGradient>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {/* nickname bar */}
          <View style={styles.nickBar}>
            <Ionicons name="person-circle-outline" size={22} color="#fff" />
            <TextInput
              style={styles.nickInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Takma ad"
              placeholderTextColor="#7e7e7e"
            />
            <Pressable onPress={() => setNickname(randomNameGenerator())}>
              <Feather name="refresh-ccw" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Phase Tabs */}
          <View style={styles.tabs}>
            {["pre", "post"].map((p) => (
              <Pressable
                key={p}
                onPress={() => setActivePhase(p as MatchRoomPhase)}
                style={[styles.tab, activePhase === p && styles.tabActive]}
              >
                <Text
                  style={
                    activePhase === p ? styles.tabTextActive : styles.tabText
                  }
                >
                  {p === "pre" ? "Maç Öncesi" : "Maç Sonrası"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Rooms */}
          <View style={styles.roomRow}>
            {matchRooms
              .filter((r) => r.phase === activePhase)
              .map((room) => (
                <Pressable
                  key={room.id}
                  onPress={() => setSelectedRoom(room.id)}
                  style={[
                    styles.roomChip,
                    selectedRoom === room.id && styles.roomChipActive,
                  ]}
                >
                  <Text style={styles.roomTitle}>{room.title}</Text>
                  <Text style={styles.roomTime}>{room.time}</Text>
                </Pressable>
              ))}
          </View>

          {/* Chat Area */}
          <FlatList
            ref={flatListRef}
            data={currentMessages}
            renderItem={({ item }) => <ChatBubble message={item} />}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            style={{ flex: 1, paddingHorizontal: 16 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />

          {/* Input */}
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Mesaj yaz..."
              placeholderTextColor="#7e7e7e"
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
            />
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <Pressable style={styles.sendBtn} onPress={handleSend}>
                <Ionicons name="send" size={18} color="white" />
              </Pressable>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  heroSmall: {
    padding: 18,
    paddingTop: 50,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  heroTitle: { fontSize: 22, color: "#fff", fontFamily: typography.bold },
  heroSub: {
    color: "#e6e6e6",
    marginTop: 2,
    fontFamily: typography.medium,
    fontSize: 13,
  },

  nickBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    margin: 14,
    padding: 10,
    borderRadius: 14,
    gap: 8,
  },
  nickInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontFamily: typography.medium,
  },

  tabs: { flexDirection: "row", justifyContent: "center", marginBottom: 6 },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  tabActive: { backgroundColor: "#0fa95855" },
  tabText: { color: "#aaa", fontFamily: typography.semiBold, fontSize: 13 },
  tabTextActive: {
    color: "#fff",
    fontFamily: typography.semiBold,
    fontSize: 13,
  },

  roomRow: { flexDirection: "row", paddingHorizontal: 12, marginBottom: 8 },
  roomChip: {
    padding: 10,
    backgroundColor: "#111",
    borderRadius: 10,
    marginRight: 8,
  },
  roomChipActive: {
    backgroundColor: "#0fa95833",
    borderWidth: 1,
    borderColor: "#0fa958",
  },
  roomTitle: { color: "#fff", fontFamily: typography.semiBold },
  roomTime: { color: "#999", fontSize: 11, marginTop: 2 },

  inputBox: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#111",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: { flex: 1, color: "#fff", fontSize: 14 },
  sendBtn: { backgroundColor: "#0fa958", padding: 10, borderRadius: 25 },
});

export default ChatScreen;
