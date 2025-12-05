import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BannerSlider from '../components/BannerSlider';
import GridCard from '../components/GridCard';
import Header from '../components/Header';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { BottomTabParamList } from '../navigation/BottomTabs';

type GridItem = {
  key: string;
  label: string;
  icon: string;
  iconSet?: 'Ionicons' | 'Feather';
  action: () => void;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<BottomTabParamList>>();

  const gridItems: GridItem[] = [
    { key: 'fixture', label: 'Fikstür', icon: 'calendar-outline', action: () => navigation.navigate('Fixture') },
    { key: 'feed', label: 'Paylaşımlar', icon: 'images-outline', action: () => navigation.navigate('Feed') },
    { key: 'chat', label: 'Chat', icon: 'chatbubbles-outline', action: () => navigation.navigate('Chat') },
    { key: 'mars', label: 'Marşlar', icon: 'musical-notes-outline', action: () => navigation.navigate('Mars') },
    { key: 'history', label: 'Tarihçe', icon: 'book-outline', action: () => console.log('yakında') },
    { key: 'legends', label: 'Efsaneler', icon: 'trophy-outline', action: () => console.log('yakında') },
  ];

  const bannerImages = [
    require('../assets/dummy/slide1.png'),
    require('../assets/dummy/slide2.png'),
    require('../assets/dummy/slide3.png'),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />
        <BannerSlider images={bannerImages} />
        <View style={styles.gridContainer}>
          {gridItems.map((item) => (
            <View key={item.key} style={styles.gridItem}>
              <GridCard
                label={item.label}
                iconName={item.icon}
                iconSet={item.iconSet ?? 'Ionicons'}
                onPress={item.action}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  gridItem: {
    width: '47%',
  },
});

export default HomeScreen;
