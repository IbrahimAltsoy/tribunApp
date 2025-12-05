import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { announcements } from "../../data/mockData";

type Props = {
  announcement: (typeof announcements)[0];
};

const AnnouncementCard: React.FC<Props> = ({ announcement }) => (
  <View style={styles.announcementCard}>
    <View style={styles.announcementHeader}>
      <Text style={styles.announcementTitle}>{announcement.title}</Text>
      <Ionicons name="map-outline" size={20} color={colors.text} />
    </View>
    <Text style={styles.announcementMeta}>
      {announcement.city} ƒ?½ {announcement.date}
    </Text>
    <Text style={styles.announcementMeta}>{announcement.location}</Text>
    <Text style={styles.announcementNote}>{announcement.note}</Text>
    <Text style={styles.announcementContact}>
      ŽøletiYim: {announcement.contact}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  announcementCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  announcementTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: 16,
    flex: 1,
  },
  announcementMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  announcementNote: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  announcementContact: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
});

export default AnnouncementCard;
