import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type BannerSliderProps = {
  images: number[];
};

const BannerSlider: React.FC<BannerSliderProps> = ({ images }) => {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const slideWidth = useMemo(() => width - spacing.lg * 2, [width]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
          setActiveIndex(nextIndex);
        }}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      >
        {images.map((img, index) => (
          <View key={index} style={[styles.slideWrapper, { width: slideWidth }]}>
            <ImageBackground source={img} style={styles.slide} imageStyle={styles.image}>
              <View style={styles.overlay} />
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {images.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  slideWrapper: {
    height: 160,
  },
  slide: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  image: {
    borderRadius: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: colors.tabInactive,
  },
});

export default BannerSlider;
