import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { typography } from "../theme/typography";
import { colors } from "../theme/colors";

type BihevraTextProps = {
  fontSize?: number;
  variant?: "default" | "watermark" | "splash" | "header";
  style?: ViewStyle;
};

/**
 * GS Tribün stilize text logosu
 * "GS" sarı, "Tribün" beyaz
 */
const BihevraText: React.FC<BihevraTextProps> = ({
  fontSize = 24,
  variant = "default",
  style,
}) => {
  const getOpacity = () => {
    switch (variant) {
      case "watermark":
        return 0.9;
      case "splash":
        return 1;
      default:
        return 1;
    }
  };

  const getShadow = () => {
    if (variant === "watermark") {
      return {
        textShadowColor: "rgba(0, 0, 0, 0.8)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      };
    }
    if (variant === "splash") {
      return {
        textShadowColor: "rgba(255, 199, 44, 0.5)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
      };
    }
    return {};
  };

  return (
    <View style={[styles.container, { opacity: getOpacity() }, style]}>
      <Text
        style={[
          styles.text,
          { fontSize, color: colors.accent },
          getShadow(),
        ]}
      >
        GS{" "}
      </Text>
      <Text
        style={[
          styles.text,
          { fontSize, color: colors.white },
          getShadow(),
        ]}
      >
        Tribün
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
});

export default BihevraText;
