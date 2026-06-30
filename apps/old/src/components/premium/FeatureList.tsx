import { View, Text, StyleSheet } from 'react-native';
import { Styles } from '@/src/constants/Styles';
import PagerView from 'react-native-pager-view';
import { BlurView } from 'expo-blur';
import { Colors, Themes } from '@/src/constants/Colors';
import { useEffect, useRef, useState } from 'react';

export default function FeatureList() {

  const [page, setPage] = useState(0);
  const autoScroll = useRef(true);
  const pagerRef = useRef<PagerView>(null);

  const intensity = 20;

  const features = [
    {
      title: 'Ad Free',
      description: 'No more ads when importing, exporting, or listening to your music',
    },
    {
      title: 'Bulk Actions',
      description: 'Import & export multiple files at once',
    },
    {
      title: 'Themes',
      description: 'Pick your favorite accent color',
    },
    {
      title: 'App Icon',
      description: 'Choose a new home page app icon',
    },
    {
      title: 'Backup & Restore',
      description: 'Backup your entire library, including all of your playlists, albums, and artists',
    },
  ];

  useEffect(() => {

    if (!autoScroll.current) return;

    const interval = setInterval(() => {
      setPage(currentPage => {
        if (autoScroll.current) {
          const nextPage = (currentPage + 1) % features.length;
          pagerRef.current?.setPage(nextPage);
          return nextPage;
        }
        else {
          clearInterval(interval);
          return currentPage;
        }
      });
    }, 3000);

    return () => clearInterval(interval);

  }, [features.length]);

  return (
    <View 
      style={styles.container}
      onTouchStart={() => autoScroll.current = false}
    >
      <PagerView 
        style={styles.container} 
        ref={pagerRef}
        overdrag
      >
        {features.map((feature, index) => (
          <View style={styles.page} key={index}>
            <BlurView intensity={intensity} tint="dark" style={styles.blurView}>
              <Text style={styles.title}>{feature.title}</Text>
              <Text style={styles.description}>{feature.description}</Text>
            </BlurView>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 20,
    paddingHorizontal: 25,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  title: {
    ...Styles.h3,
    color: Colors.text,
    marginBottom: 5,
  },
  description: {
    ...Styles.p,
    color: Colors.infoText,
  },
});