'use strict';

import React, {
  Component,
  PropTypes
} from "react";

import {
  Animated,
  StyleSheet,
  PanResponder,
  View,
  Easing
} from "react-native";

const shallowCompare = require('react-addons-shallow-compare'),
      styleEqual = require('style-equal');

var TRACK_SIZE = 4;
var THUMB_SIZE = 20;

function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Rect.prototype.containsPoint = function(x, y) {
  return (x >= this.x
          && y >= this.y
          && x <= this.x + this.width
          && y <= this.y + this.height);
};

var DEFAULT_ANIMATION_CONFIGS = {
  spring : {
    friction : 7,
    tension  : 100
  },
  timing : {
    duration : 150,
    easing   : Easing.inOut(Easing.ease),
    delay    : 0
  },
  // decay : { // This has a serious bug
  //   velocity     : 1,
  //   deceleration : 0.997
  // }
};

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
     * If true the user won't be able to move the slider.
     * Default value is false.
     */
    disabled: PropTypes.bool,

    /**
     * Initial minimum value of the slider. Default value is 0.
     */
    minimumValue: PropTypes.number,

    /**
     * Initial maximum value of the slider. Default value is 1.
     */
    maximumValue: PropTypes.number,

    /**
     * Step value of the slider. The value should be between 0 and
     * (maximumValue - minimumValue). Default value is 0.
     */
    step: PropTypes.number,

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
     * The size of the touch area that allows moving the thumb.
     * The touch area has the same center has the visible thumb.
     * This allows to have a visually small thumb while still allowing the user
     * to move it easily.
     * The default is {width: 40, height: 40}.
     */
    thumbTouchSize: PropTypes.shape(
      {width: PropTypes.number, height: PropTypes.number}
    ),

    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange: PropTypes.func,

    /**
     * Callback called when the user starts changing the value (e.g. when
     * the slider is pressed).
     */
    onSlidingStart: PropTypes.func,

    /**
     * Callback called when the user finishes changing the value (e.g. when
     * the slider is released).
     */
    onSlidingComplete: PropTypes.func,

    /**
     * The style applied to the slider container.
     */
    style: View.propTypes.style,

    /**
     * The style applied to the track.
     */
    trackStyle: View.propTypes.style,

    /**
     * The style applied to the thumb.
     */
    thumbStyle: View.propTypes.style,

    /**
     * Set this to true to visually see the thumb touch rect in green.
     */
    debugTouchArea: PropTypes.bool,

    /**
    * Set to true to animate values with default 'timing' animation type
    */
    animateTransitions : PropTypes.bool,

    /**
    * Custom Animation type. 'spring' or 'timing'.
    */
    animationType : PropTypes.oneOf(['spring', 'timing']),

    /**
    * Used to configure the animation parameters.  These are the same parameters in the Animated library.
    */
    animationConfig : PropTypes.object,

    /**
    * Used to change the slider orientation between horizontal and vertical
    */
    orientation : PropTypes.oneOf(['horizontal', 'vertical']),
  },
  getInitialState() {
    return {
      containerSize: {width: 0, height: 0},
      trackSize: {width: 0, height: 0},
      thumbSize: {width: 0, height: 0},
      allMeasured: false,
      value: new Animated.Value(this.props.value),
    };
  },
  getDefaultProps() {
    return {
      value: 0,
      minimumValue: 0,
      maximumValue: 1,
      step: 0,
      minimumTrackTintColor: '#3f3f3f',
      maximumTrackTintColor: '#b3b3b3',
      thumbTintColor: '#343434',
      thumbTouchSize: {width: 40, height: 40},
      debugTouchArea: false,
      animationType: 'timing',
      orientation: 'horizontal',
    };
  },
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminationRequest: this._handlePanResponderRequestEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
  },
  componentWillReceiveProps: function(nextProps) {
    var newValue = nextProps.value;

    if (this.props.value !== newValue) {
      if (this.props.animateTransitions) {
        this._setCurrentValueAnimated(newValue);
      }
      else {
        this._setCurrentValue(newValue);
      }
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    // We don't want to re-render in the following cases:
    // - when only the 'value' prop changes as it's already handled with the Animated.Value
    // - when the event handlers change (rendering doesn't depend on them)
    // - when the style props haven't actually change

    return shallowCompare(
      { props: this._getPropsForComponentUpdate(this.props), state: this.state },
      this._getPropsForComponentUpdate(nextProps),
      nextState
    ) || !styleEqual(this.props.style, nextProps.style)
      || !styleEqual(this.props.trackStyle, nextProps.trackStyle)
      || !styleEqual(this.props.thumbStyle, nextProps.thumbStyle);
  },
  render() {
    var {
      minimumValue,
      maximumValue,
      minimumTrackTintColor,
      maximumTrackTintColor,
      thumbTintColor,
      styles,
      style,
      trackStyle,
      thumbStyle,
      debugTouchArea,
      orientation,
      ...other
    } = this.props;
    var {value, containerSize, trackSize, thumbSize, allMeasured} = this.state;
    var mainStyles = styles || defaultStyles;
    var outputRangeEnd = 0;
    if (orientation === 'horizontal') {
      outputRangeEnd = containerSize.width - thumbSize.width;
    } else {
      outputRangeEnd = containerSize.height - thumbSize.height;
    }
    var thumbStart = value.interpolate({
        inputRange: [minimumValue, maximumValue],
        outputRange: [0, outputRangeEnd],
        //extrapolate: 'clamp',
      });
    var valueVisibleStyle = {};
    if (!allMeasured) {
      valueVisibleStyle.opacity = 0;
    }

    var minimumTrackStyle = {
      position: 'absolute',
      backgroundColor: minimumTrackTintColor,
      ...valueVisibleStyle
    };

    if (orientation === 'horizontal') {
      minimumTrackStyle.width = Animated.add(thumbStart, thumbSize.width / 2);
      minimumTrackStyle.marginTop = -trackSize.height;
    } else {
      minimumTrackStyle.height = Animated.add(thumbStart, thumbSize.height / 2);
      minimumTrackStyle.marginLeft = -trackSize.width;
    }

    var thumbPositionStyle = {
      backgroundColor: thumbTintColor,
      ...valueVisibleStyle,
    };

    if (orientation === 'horizontal') {
      thumbPositionStyle.marginTop = -(trackSize.height + thumbSize.height) / 2;
      thumbPositionStyle.left = thumbStart;
    } else {
      thumbPositionStyle.marginLeft = -(trackSize.width + thumbSize.width) / 2;
      thumbPositionStyle.top = thumbStart;
    }

    var touchOverflowStyle = this._getTouchOverflowStyle();

    var contentContainerStyle = {};
    if (orientation === 'horizontal') {
      contentContainerStyle.height = 40;
    } else {
      contentContainerStyle.width = 40;
      contentContainerStyle.flexDirection = 'row';
    }

    var trackDefaultStyle = {};
    if (orientation === 'horizontal') {
      trackDefaultStyle.height = TRACK_SIZE;
    } else {
      trackDefaultStyle.width = TRACK_SIZE;
    }

    return (
      <View {...other} style={[contentContainerStyle, mainStyles.container, style]} onLayout={this._measureContainer}>
        <View
          style={[{backgroundColor: maximumTrackTintColor,}, mainStyles.track, trackDefaultStyle, trackStyle]}
          onLayout={this._measureTrack} />
        <Animated.View style={[mainStyles.track, trackDefaultStyle, trackStyle, minimumTrackStyle]} />
        <Animated.View
          onLayout={this._measureThumb}
          style={[
            thumbPositionStyle,
            mainStyles.thumb,
            thumbStyle,
          ]}
        />
        <View
          style={[defaultStyles.touchArea, touchOverflowStyle]}
          {...this._panResponder.panHandlers}>
          {debugTouchArea === true && this._renderDebugThumbTouchRect(thumbStart)}
        </View>
      </View>
    );
  },

  _getPropsForComponentUpdate(props) {
    var {
      value,
      onValueChange,
      onSlidingStart,
      onSlidingComplete,
      style,
      trackStyle,
      thumbStyle,
      ...otherProps,
    } = props;

    return otherProps;
  },

  _handleStartShouldSetPanResponder: function(e: Object, /*gestureState: Object*/): boolean {
    // Should we become active when the user presses down on the thumb?
    return this._thumbHitTest(e);
  },

  _handleMoveShouldSetPanResponder: function(/*e: Object, gestureState: Object*/): boolean {
    // Should we become active when the user moves a touch over the thumb?
    return false;
  },

  _handlePanResponderGrant: function(/*e: Object, gestureState: Object*/) {
    this._previousStart = this._getThumbStart(this._getCurrentValue());
    this._fireChangeEvent('onSlidingStart');
  },
  _handlePanResponderMove: function(e: Object, gestureState: Object) {
    if (this.props.disabled) {
      return;
    }

    this._setCurrentValue(this._getValue(gestureState));
    this._fireChangeEvent('onValueChange');
  },
  _handlePanResponderRequestEnd: function(e: Object, gestureState: Object) {
    // Should we allow another component to take over this pan?
    return false;
  },
  _handlePanResponderEnd: function(e: Object, gestureState: Object) {
    if (this.props.disabled) {
      return;
    }

    this._setCurrentValue(this._getValue(gestureState));
    this._fireChangeEvent('onSlidingComplete');
  },

  _measureContainer(x: Object) {
    this._handleMeasure('containerSize', x);
  },

  _measureTrack(x: Object) {
    this._handleMeasure('trackSize', x);
  },

  _measureThumb(x: Object) {
    this._handleMeasure('thumbSize', x);
  },

  _handleMeasure(name: string, x: Object) {
    var {width, height} = x.nativeEvent.layout;
    var size = {width: width, height: height};

    var storeName = `_${name}`;
    var currentSize = this[storeName];
    if (currentSize && width === currentSize.width && height === currentSize.height) {
      return;
    }
    this[storeName] = size;

    if (this._containerSize && this._trackSize && this._thumbSize) {
      this.setState({
        containerSize: this._containerSize,
        trackSize: this._trackSize,
        thumbSize: this._thumbSize,
        allMeasured: true,
      })
    }
  },

  _getRatio(value: number) {
    return (value - this.props.minimumValue) / (this.props.maximumValue - this.props.minimumValue);
  },

  _getThumbStart(value: number) {
    var ratio = this._getRatio(value);

    var length = 0;

    if (this.props.orientation === 'horizontal') {
      length = this.state.containerSize.width - this.state.thumbSize.width;
    } else {
      length = this.state.containerSize.height - this.state.thumbSize.height;
    }

    return ratio * length;
  },

  _getValue(gestureState: Object) {
    var length = 0;

    if (this.props.orientation === 'horizontal') {
      length = this.state.containerSize.width - this.state.thumbSize.width;
    } else {
      length = this.state.containerSize.height - this.state.thumbSize.height;
    }

    var thumbStart = this._previousStart;

    if (this.props.orientation === 'horizontal') {
      thumbStart += gestureState.dx;
    } else {
      thumbStart += gestureState.dy;
    }

    var ratio = thumbStart / length;

    if (this.props.step) {
      return Math.max(this.props.minimumValue,
        Math.min(this.props.maximumValue,
          this.props.minimumValue + Math.round(ratio * (this.props.maximumValue - this.props.minimumValue) / this.props.step) * this.props.step
        )
      );
    } else {
      return Math.max(this.props.minimumValue,
        Math.min(this.props.maximumValue,
          ratio * (this.props.maximumValue - this.props.minimumValue) + this.props.minimumValue
        )
      );
    }
  },

  _getCurrentValue() {
    return this.state.value.__getValue();
  },

  _setCurrentValue(value: number) {
    this.state.value.setValue(value);
  },

  _setCurrentValueAnimated(value: number) {
    var animationType   = this.props.animationType;
    var animationConfig = Object.assign(
          {},
          DEFAULT_ANIMATION_CONFIGS[animationType],
          this.props.animationConfig,
          {toValue : value}
        );

    Animated[animationType](this.state.value, animationConfig).start();
  },

  _fireChangeEvent(event) {
    if (this.props[event]) {
      this.props[event](this._getCurrentValue());
    }
  },

  _getTouchOverflowSize() {
    var state = this.state;
    var props = this.props;

    var size = {};
    if (state.allMeasured === true) {
      size.width = Math.max(0, props.thumbTouchSize.width - state.thumbSize.width);
      size.height = Math.max(0, props.thumbTouchSize.height - state.containerSize.height);
    }

    return size;
  },

  _getTouchOverflowStyle() {
    var {width, height} = this._getTouchOverflowSize();

    var touchOverflowStyle = {};
    if (width !== undefined && height !== undefined) {
      var verticalMargin = -height / 2;
      touchOverflowStyle.marginTop = verticalMargin;
      touchOverflowStyle.marginBottom = verticalMargin;

      var horizontalMargin = -width / 2;
      touchOverflowStyle.marginLeft = horizontalMargin;
      touchOverflowStyle.marginRight = horizontalMargin;
    }

    if (this.props.debugTouchArea === true) {
      touchOverflowStyle.backgroundColor = 'orange';
      touchOverflowStyle.opacity = 0.5;
    }

    return touchOverflowStyle;
  },

  _thumbHitTest(e: Object) {
    var nativeEvent = e.nativeEvent;
    var thumbTouchRect = this._getThumbTouchRect();
    return thumbTouchRect.containsPoint(nativeEvent.locationX, nativeEvent.locationY);
  },

  _getThumbTouchRect() {
    var state = this.state;
    var props = this.props;
    var touchOverflowSize = this._getTouchOverflowSize();

    var rect = new Rect(
      0,
      0,
      props.thumbTouchSize.width,
      props.thumbTouchSize.height
    );

    if (this.props.orientation === 'horizontal') {
      rect.x = touchOverflowSize.width / 2 + this._getThumbStart(this._getCurrentValue()) + (state.thumbSize.width - props.thumbTouchSize.width) / 2;
      rect.y = touchOverflowSize.height / 2 + (state.containerSize.height - props.thumbTouchSize.height) / 2;
    } else {
      rect.x = touchOverflowSize.width / 2 + (state.containerSize.width - props.thumbTouchSize.width) / 2;
      rect.y = touchOverflowSize.height / 2 + this._getThumbStart(this._getCurrentValue()) + (state.thumbSize.height - props.thumbTouchSize.height) / 2;
    }

    return rect;
  },

  _renderDebugThumbTouchRect(thumbLeft) {
    var thumbTouchRect = this._getThumbTouchRect();
    var positionStyle = {
      left: thumbLeft,
      top: thumbTouchRect.y,
      width: thumbTouchRect.width,
      height: thumbTouchRect.height,
    };

    return (
      <Animated.View
        style={[defaultStyles.debugThumbTouchArea, positionStyle]}
        pointerEvents='none'
      />
    );
  }
});


var defaultStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  track: {
    borderRadius: TRACK_SIZE / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  touchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugThumbTouchArea: {
    position: 'absolute',
    backgroundColor: 'green',
    opacity: 0.5,
  }
});

module.exports = Slider;
