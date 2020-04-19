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
import { makeOverlays } from '../utils/makeOverlays';

const PhotoSpotsScreen = () => {
  const rootStore = useStore();

  return useObserver(() => {
    const overlays = React.useMemo(() => makeOverlays(rootStore.weatherFeatures), [
      rootStore.weatherFeatures,
    ]);
    return (
      <View style={styles.container}>
        <ButtonGroup
          onPress={(day) => {
            rootStore.day = day;
            rootStore.getWeatherParams();
          }}
          selectedIndex={rootStore.day}
          buttons={['Today', 'Tomorrow', 'Today + 2']}
          containerStyle={{ height: 50 }}
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
                key={index}
                coordinates={overlay.coordinates}
                fillColor={overlay.feature.properties.color}
                strokeColor={index === rootStore.currentPolygon.index ? 'black' : null}
                tappable
                onPress={() => rootStore.selectWeatherPolygon({...overlay.feature,index})}
              />
            ))}
          </MapView>
          {rootStore.currentPolygon && (
            <View style={styles.mapText}>
              <Text style={{ color: 'white' }}>{rootStore.currentPolygon.properties.text}</Text>
            </View>
          )}
        </View>
        <RNPickerSelect
          style={pickerSelectStyles}
          onValueChange={(value) => (rootStore.currentWeatherParam = value)}
          items={rootStore.weatherParamsList}
          value={rootStore.currentWeatherParam}
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
