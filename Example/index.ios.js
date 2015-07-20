'use strict';

var React = require('react-native');
var Slider = require('../Slider');
var {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  SliderIOS,
} = React;

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
    )
  },

  _renderChildren() {
    return React.Children.map(this.props.children, (child) => {
      if (child.type === Slider.type
          || child.type === SliderIOS.type) {
        var value = this.state.value;
        return React.addons.cloneWithProps(child, {
          value: value,
          onValueChange: (value) => this.setState({value: value}),
        })
      } else {
        return child;
      }
    }.bind(this))
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
      <View style={styles.container}>
        <SliderContainer caption='<SliderIOS/>'>
          <SliderIOS />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with default style'>
          <Slider />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with min, max and custom tints '>
          <Slider minimumValue={-10} maximumValue={42} minimumTrackTintColor='#1fb28a' maximumTrackTintColor='#d3d3d3' thumbTintColor='#1a9274' />
        </SliderContainer>
        <SliderContainer caption='<Slider/> with custom style'>
          <Slider styles={iosStyles} minimumTrackTintColor='#1073ff' maximumTrackTintColor='#b7b7b7' />
        </SliderContainer>
      </View>
    );
  },

  _addSlider(i, comp) {
    var valueKey = 'value' + i;
    var value = this.state[valueKey] !== undefined ? this.state[valueKey] : DEFAULT_VALUE;

    comp.props.value = value;
    comp.props.onValueChange = (value) => this.setState({[valueKey]: value});
    
    return (
      <View>
        {comp}
        <Text>Value: {value}</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginLeft: 20,
    marginRight: 20,
    //backgroundColor: 'rgb(43, 186, 180)',
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
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    marginTop: -16,
    position: 'absolute',
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

AppRegistry.registerComponent('SliderExample', () => SliderExample);
