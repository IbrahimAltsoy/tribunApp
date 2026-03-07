import React from "react";
import Svg, { Text, Defs, LinearGradient, Stop } from "react-native-svg";
import { View, StyleSheet } from "react-native";

type BihevraLogoProps = {
  width?: number;
  height?: number;
  fontSize?: number;
  variant?: "default" | "watermark" | "splash";
};

const BihevraLogo: React.FC<BihevraLogoProps> = ({
  width = 180,
  height = 44,
  fontSize = 28,
  variant = "default",
}) => {
  const opacity = variant === "watermark" ? 0.85 : 1;
  const fontWeight = "800";

  return (
    <View style={[styles.container, { width, height, opacity }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="gsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFC72C" />
            <Stop offset="100%" stopColor="#FFD45A" />
          </LinearGradient>
        </Defs>

        {/* "GS" - Sarı gradient */}
        <Text
          x="0"
          y={fontSize + 4}
          fill="url(#gsGradient)"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily="Montserrat-Bold, Montserrat, sans-serif"
          letterSpacing="1"
        >
          GS
        </Text>

        {/* " Tribün" - Beyaz */}
        <Text
          x={fontSize * 1.55}
          y={fontSize + 4}
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily="Montserrat-Bold, Montserrat, sans-serif"
          letterSpacing="0.5"
        >
          Tribün
        </Text>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BihevraLogo;
