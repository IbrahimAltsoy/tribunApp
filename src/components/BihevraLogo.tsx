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
  width = 150,
  height = 40,
  fontSize = 28,
  variant = "default",
}) => {
  const opacity = variant === "watermark" ? 0.85 : 1;

  // Montserrat Bold benzeri ağırlık
  const fontWeight = "700";

  return (
    <View style={[styles.container, { width, height, opacity }]}>
      <Svg width={width} height={height} viewBox="0 0 150 40">
        <Defs>
          <LinearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#0FA958" />
            <Stop offset="100%" stopColor="#14B85F" />
          </LinearGradient>
        </Defs>

        {/* "Bi" - Yeşil gradient */}
        <Text
          x="0"
          y={fontSize + 4}
          fill="url(#greenGradient)"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily="Montserrat-Bold, Montserrat, sans-serif"
        >
          Bi
        </Text>

        {/* "hevra" - Beyaz */}
        <Text
          x={fontSize * 0.85}
          y={fontSize + 4}
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily="Montserrat-Bold, Montserrat, sans-serif"
        >
          hevra
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
