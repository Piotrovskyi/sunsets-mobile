import * as React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SegmentedControlIOS,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import MapView, { Polygon } from 'react-native-maps';

import { MonoText } from '../components/StyledText';
import { useObserver } from 'mobx-react-lite';
import { useStore } from '../App';
import { ButtonGroup } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { toJS } from 'mobx';

const makePoint = (c) => ({ latitude: parseFloat(c[1]), longitude: parseFloat(c[0]) });

const makeLine = (l) => l.map(makePoint);
const makeCoordinates = (feature) => {
  const g = feature.geometry;
  if (g.type === 'Point') {
    return [makePoint(g.coordinates)];
  } else if (g.type === 'MultiPoint') {
    return g.coordinates.map(makePoint);
  } else if (g.type === 'LineString') {
    return [makeLine(g.coordinates)];
  } else if (g.type === 'MultiLineString') {
    return g.coordinates.map(makeLine);
  } else if (g.type === 'Polygon') {
    return g.coordinates.map(makeLine);
  } else if (g.type === 'MultiPolygon') {
    return g.coordinates.map((p) => p.map(makeLine));
  } else {
    return [];
  }
};
const flatten = (prev, curr) => prev.concat(curr);
const makeOverlay = (coordinates, feature) => {
  let overlay = {
    feature,
  };
  if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
    overlay.coordinates = coordinates[0];
    if (coordinates.length > 1) {
      overlay.holes = coordinates.slice(1);
    }
  } else {
    overlay.coordinates = coordinates;
  }
  return overlay;
};
export const makeOverlays = (features) => {
  const points = features
    .filter((f) => f.geometry && (f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'))
    .map((feature) =>
      makeCoordinates(feature).map((coordinates) => makeOverlay(coordinates, feature)),
    )
    .reduce(flatten, [])
    .map((overlay) => ({ ...overlay, type: 'point' }));

  const lines = features
    .filter(
      (f) =>
        f.geometry && (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'),
    )
    .map((feature) =>
      makeCoordinates(feature).map((coordinates) => makeOverlay(coordinates, feature)),
    )
    .reduce(flatten, [])
    .map((overlay) => ({ ...overlay, type: 'polyline' }));

  const multipolygons = features
    .filter((f) => f.geometry && f.geometry.type === 'MultiPolygon')
    .map((feature) =>
      makeCoordinates(feature).map((coordinates) => makeOverlay(coordinates, feature)),
    )
    .reduce(flatten, []);

  const polygons = features
    .filter((f) => f.geometry && f.geometry.type === 'Polygon')
    .map((feature) => makeOverlay(makeCoordinates(feature), feature))
    .reduce(flatten, [])
    .concat(multipolygons)
    .map((overlay) => ({ ...overlay, type: 'polygon' }));

  return points.concat(lines).concat(polygons);
};

const PhotoSpotsScreen = () => {
  const rootStore = useStore();

  return useObserver(() => {
    const overlays = React.useMemo(() => makeOverlays(rootStore.photoSpotsFeatures), [
      rootStore.photoSpotsFeatures,
    ]);
    return (
      <View style={styles.container}>
        <ButtonGroup
          onPress={(day) => {
            rootStore.day = day;
            rootStore.getPhotoSpotsParams();
          }}
          selectedIndex={rootStore.day}
          buttons={['Today', 'Tomorrow', 'Today + 2']}
          containerStyle={{ height: 40 }}
        />
        <View style={styles.mapContainer}>
          <MapView
            style={styles.mapStyle}
            initialRegion={{
              latitude: 32.084422,
              longitude: 34.775957,
              latitudeDelta: 2,
              longitudeDelta: 2,
            }}>
            {overlays.map((overlay, index) => (
              <Polygon
                key={overlay.feature.geometry.name}
                coordinates={overlay.coordinates}
                fillColor={overlay.feature.properties.color}
                strokeColor={rootStore.photoSpotsPolygon?.index ===index ? 'black': null}
                tappable
                onPress={() => rootStore.selectPhotoSpotPolygon({...overlay.feature, index})}
              />
            ))}
          </MapView>
          {rootStore.photoSpotsPolygon && (
            <View style={styles.mapText}>
              {rootStore.photoSpotsPolygon.properties.text.split('. ').map((el) => (
                <Text style={{ color: 'white' }}>{el}</Text>
              ))}
            </View>
          )}
        </View>
        <RNPickerSelect
          style={pickerSelectStyles}
          onValueChange={(value) => (rootStore.currentPhotoSpotsParam = value)}
          items={rootStore.photoSpotsList}
          value={rootStore.currentPhotoSpotsParam}
          Icon={() => {
            return <Ionicons size={22} name="md-arrow-dropup" />;
          }}
        />
      </View>
    );
  });
};

export default PhotoSpotsScreen;

PhotoSpotsScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapText: {
    position: 'absolute',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
  },
  mapStyle: {
    flex: 1,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
    top: 18,
    right: 22,
  },
});
