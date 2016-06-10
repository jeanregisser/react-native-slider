'use strict';

var React = require('react');
var ReactNative = require('react-native');
var Slider = require('../src/Slider');
var {
  AppRegistry,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SliderIOS,
} = ReactNative;

var DEFAULT_VALUE = 0.2;

var SliderContainer = React.createClass({
  getInitialState() {
    return {
      value: DEFAULT_VALUE,
    };
  },

  render() {
    var value = this.state.value;

    return (
      <View>
        <View style={styles.titleContainer}>
          <Text style={styles.caption} numberOfLines={1}>{this.props.caption}</Text>
          <Text style={styles.value} numberOfLines={1}>{value}</Text>
        </View>
        {this._renderChildren()}
      </View>
    );
  },

  _renderChildren() {
    return React.Children.map(this.props.children, (child) => {
      if (child.type === Slider
          || child.type === ReactNative.Slider) {
        var value = this.state.value;
        return React.cloneElement(child, {
          value: value,
          onValueChange: (val) => this.setState({value: val}),
        });
      } else {
        return child;
      }
    });
  },
});

var SliderExample = React.createClass({
  getInitialState() {
    return {
      //value: 0.2,
    };
  },

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <SliderContainer caption='<React.Slider/>'>
          <ReactNative.Slider />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with default style'>
          <Slider />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with min, max and custom tints '>
          <Slider
            minimumValue={-10}
            maximumValue={42}
            minimumTrackTintColor='#1fb28a'
            maximumTrackTintColor='#d3d3d3'
            thumbTintColor='#1a9274'
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style'>
          <Slider
            trackStyle={iosStyles.track}
            thumbStyle={iosStyles.thumb}
            minimumTrackTintColor='#1073ff'
            maximumTrackTintColor='#b7b7b7'
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style #2'>
          <Slider
            trackStyle={customStyles2.track}
            thumbStyle={customStyles2.thumb}
            minimumTrackTintColor='#30a935'
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style #3'>
          <Slider
            trackStyle={customStyles3.track}
            thumbStyle={customStyles3.thumb}
            minimumTrackTintColor='#eecba8'
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style #4'>
          <Slider
            trackStyle={customStyles4.track}
            thumbStyle={customStyles4.thumb}
            minimumTrackTintColor='#d14ba6'
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style #5'>
          <Slider
            trackStyle={customStyles5.track}
            thumbStyle={customStyles5.thumb}
            minimumTrackTintColor='#ec4c46'
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style #6'>
          <Slider
            trackStyle={customStyles6.track}
            thumbStyle={customStyles6.thumb}
            minimumTrackTintColor='#e6a954'
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style #7'>
          <Slider
            trackStyle={customStyles7.track}
            thumbStyle={customStyles7.thumb}
            minimumTrackTintColor='#2f2f2f'
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style #8 and thumbTouchSize'>
          <Slider
            style={customStyles8.container}
            trackStyle={customStyles8.track}
            thumbStyle={customStyles8.thumb}
            minimumTrackTintColor='#31a4db'
            thumbTouchSize={{width: 50, height: 40}}
          />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style #9 and thumbImage'>
          <Slider
            minimumTrackTintColor='#13a9d6'
            thumbImage={require('./img/thumb.png')}
            thumbStyle={customStyles9.thumb}
            thumbTintColor='#0c6692'
          />
        </SliderContainer>
      </ScrollView>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    margin: 20,
    paddingBottom: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caption: {
    //flex: 1,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  }
});

var iosStyles = StyleSheet.create({
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    shadowOpacity: 0.35,
  }
});

var customStyles2 = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'white',
    borderColor: '#30a935',
    borderWidth: 2,
  }
});

var customStyles3 = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d0d0d0',
  },
  thumb: {
    width: 10,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#eb6e1b',
  }
});

var customStyles4 = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 4,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 1,
    shadowOpacity: 0.15,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: '#f8a1d6',
    borderColor: '#a4126e',
    borderWidth: 5,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    shadowOpacity: 0.35,
  }
});

var customStyles5 = StyleSheet.create({
  track: {
    height: 18,
    borderRadius: 1,
    backgroundColor: '#d5d8e8',
  },
  thumb: {
    width: 20,
    height: 30,
    borderRadius: 1,
    backgroundColor: '#838486',
  }
});

var customStyles6 = StyleSheet.create({
  track: {
    height: 14,
    borderRadius: 2,
    backgroundColor: 'white',
    borderColor: '#9a9a9a',
    borderWidth: 1,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#eaeaea',
    borderColor: '#9a9a9a',
    borderWidth: 1,
  }
});

var customStyles7 = StyleSheet.create({
  track: {
    height: 1,
    backgroundColor: '#303030',
  },
  thumb: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    borderColor: 'rgba(150, 150, 150, 0.6)',
    borderWidth: 14,
    borderRadius: 15,
  }
});

var customStyles8 = StyleSheet.create({
  container: {
    height: 30,
  },
  track: {
    height: 2,
    backgroundColor: '#303030',
  },
  thumb: {
    width: 10,
    height: 10,
    backgroundColor: '#31a4db',
    borderRadius: 10 / 2,
    shadowColor: '#31a4db',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 2,
    shadowOpacity: 1,
  }
});

var customStyles9 = StyleSheet.create({
  thumb: {
    width: 30,
    height: 30,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 1,
  }
});

AppRegistry.registerComponent('Example', () => SliderExample);
