'use strict';

var React = require('react-native');
var {
  PropTypes,
  StyleSheet,
  PanResponder,
  Text,
  TouchableWithoutFeedback,
  View
} = React;
var StyleSheetRegistry = require('StyleSheetRegistry');

var TRACK_SIZE = 4;
var THUMB_SIZE = 20;

var Slider = React.createClass({
  propTypes: {
    /**
     * Initial value of the slider. The value should be between minimumValue
     * and maximumValue, which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * *This is not a controlled component*, e.g. if you don't update
     * the value, the component won't be reset to its inital value.
     */
    value: PropTypes.number,

    /**
     * Initial minimum value of the slider. Default value is 0.
     */
    minimumValue: PropTypes.number,

    /**
     * Initial maximum value of the slider. Default value is 1.
     */
    maximumValue: PropTypes.number,

    /**
     * The color used for the track to the left of the button. Overrides the
     * default blue gradient image.
     */
    minimumTrackTintColor: PropTypes.string,

    /**
     * The color used for the track to the right of the button. Overrides the
     * default blue gradient image.
     */
    maximumTrackTintColor: PropTypes.string,

    /**
     * The color used for the thumb.
     */
    thumbTintColor: PropTypes.string,

    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange: PropTypes.func,

    /**
     * Callback called when the user finishes changing the value (e.g. when
     * the slider is released).
     */
    onSlidingComplete: PropTypes.func,
  },
  getInitialState() {
    return {
      containerSize: {},
      trackSize: {},
      thumbSize: {},
      previousLeft: 0,
      value: this.props.value,
    };
  },
  getDefaultProps() {
    return {
      value: 0,
      minimumValue: 0,
      maximumValue: 1,
      minimumTrackTintColor: '#3f3f3f',
      maximumTrackTintColor: '#b3b3b3',
      thumbTintColor: '#343434',
    };
  },
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
  },
  render() {
    var value = this.state.value;
    var styles = this.props.styles || DefaultStyles;
    var thumbLeft = this._getThumbLeft(value);
    var valueVisibleStyle = {};
    if (this.state.containerSize.width === undefined
        || this.state.trackSize.width === undefined
        || this.state.thumbSize.width === undefined) {
      valueVisibleStyle.opacity = 0;
    }

    //var arrowColor = StyleSheetRegistry.getStyleByID(styles.content).backgroundColor;
    var minimumTrackStyle = {
      position: 'absolute',
      width: 300, // needed to workaround a bug for borderRadius
      marginTop: - this.state.trackSize.height,
      backgroundColor: this.props.minimumTrackTintColor,
      ...valueVisibleStyle
    }

    if (thumbLeft >= 0 && this.state.thumbSize.width >= 0) {
      minimumTrackStyle.width = thumbLeft + this.state.thumbSize.width / 2;
    } 

    return (
      <View style={styles.container} onLayout={this._measureContainer}>
        <View 
          style={[{backgroundColor: this.props.maximumTrackTintColor}, styles.track]}
          onLayout={this._measureTrack} />
        <View style={[styles.track, minimumTrackStyle]} />
        <View 
          ref={(thumb) => this.thumb = thumb} 
          onLayout={this._measureThumb}
          style={[{backgroundColor: this.props.thumbTintColor}, styles.thumb, {left: thumbLeft, ...valueVisibleStyle}]} 
          {...this._panResponder.panHandlers} />
      </View>
    );
  },

  _handleStartShouldSetPanResponder: function(e: Object, gestureState: Object): boolean {
    // Should we become active when the user presses down on the thumb?
    return true;
  },

  _handleMoveShouldSetPanResponder: function(e: Object, gestureState: Object): boolean {
    // Should we become active when the user moves a touch over the thumb?
    return true;
  },

  _handlePanResponderGrant: function(e: Object, gestureState: Object) {
    this.setState({ previousLeft: this._getThumbLeft(this.state.value) }); 
  },
  _handlePanResponderMove: function(e: Object, gestureState: Object) {
    this.setState({ value: this._getValue(gestureState) }, 
      this._fireChangeEvent.bind(this, 'onValueChange'));
  },
  _handlePanResponderEnd: function(e: Object, gestureState: Object) {
    this.setState({ value: this._getValue(gestureState) },
      this._fireChangeEvent.bind(this, 'onSlidingComplete'));
  },

  _measureContainer(x: Object) {
    var {width, height} = x.nativeEvent.layout;
    var containerSize = {width: width, height: height};
    this.setState({ containerSize: containerSize });
  },

  _measureTrack(x: Object) {
    var {width, height} = x.nativeEvent.layout;
    var trackSize = {width: width, height: height};
    this.setState({ trackSize: trackSize }); 
  },

  _measureThumb(x: Object) {
    var {width, height} = x.nativeEvent.layout;
    var thumbSize = {width: width, height: height};
    this.setState({ thumbSize: thumbSize }); 
  },

  _getRatio(value: number) {
    return (value - this.props.minimumValue) / (this.props.maximumValue - this.props.minimumValue);
  },

  _getThumbLeft(value: number) {
    var ratio = this._getRatio(value);
    return ratio * (this.state.containerSize.width - this.state.thumbSize.width);
  },

  _getValue(gestureState: Object) {
    var length = this.state.containerSize.width - this.state.thumbSize.width
    var thumbLeft = Math.min(length, 
      Math.max(0, this.state.previousLeft + gestureState.dx));

    var ratio = thumbLeft / length;
      return ratio * (this.props.maximumValue - this.props.minimumValue) + this.props.minimumValue;
  },

  _fireChangeEvent(event) {
    if (this.props[event]) {
      this.props[event](this.state.value);
    }
  },
});


var DefaultStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    //backgroundColor: 'orange',
  },
  track: {
    height: TRACK_SIZE,
    borderRadius: TRACK_SIZE / 2,
  },
  thumb: {
    marginTop: - (TRACK_SIZE + THUMB_SIZE) / 2,
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  }
});

module.exports = Slider;