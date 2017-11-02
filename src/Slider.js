'use strict';

import React, {
  PureComponent,
} from "react";

import {
  Animated,
  Image,
  StyleSheet,
  PanResponder,
  View,
  Easing,
  ViewPropTypes
} from "react-native";

import PropTypes from 'prop-types';

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

export default class Slider extends PureComponent {
  static propTypes = {
    /**
     * Initial value of the slider, or array of initial values for all thumbs.
     * The value should be between minimumValue
     * and maximumValue, which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * *This is not a controlled component*, e.g. if you don't update
     * the value, the component won't be reset to its inital value.
     */
    value: function(props, propName, componentName) {
      if (props[propName] &&
        typeof props[propName] !== 'number' &&
        !Array.isArray(props[propName])) {
        return new Error(
            `Invalid prop ${propName} supplied to ${componentName}. This prop must be a number, or an array of numbers.`
        );
      }
    },
 
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
     * @deprecated Please use <code>trackHighlightColor</code>
     */
    minimumTrackTintColor: PropTypes.string,
    
    /**
     * The color used for the track to the right of the button. Overrides the
     * default blue gradient image.
     * @deprecated Please use <code>trackColor</code>
     */
    maximumTrackTintColor: PropTypes.string,

    /**
     * The color used for the track.
     */
    trackColor: PropTypes.string,

    /**
     * The color used for the selected portion of the track. Left of single button
     * or in between multi buttons.
     */
    trackHighlightColor: PropTypes.string,
    
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
    style: ViewPropTypes.style,

    /**
     * The style applied to the track.
     */
    trackStyle: ViewPropTypes.style,

    /**
     * The style applied to the thumb.
     */
    thumbStyle: ViewPropTypes.style,
    
    /**
     * Sets an image for the thumb, or array of images for multiple thumbs.
     */
    thumbImage: PropTypes.array,
    
    /**
     * Sets a view for the thumb, or array of views for multiple thumbs.
     */
    thumbView: PropTypes.array,

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
  };

  static defaultProps = {
    value: 0,
    trackHighlightColor: '#3f3f3f',
    trackColor: '#b3b3b3',
    minimumValue: 0,
    maximumValue: 1,
    step: 0,
    thumbTintColor: '#343434',
    thumbTouchSize: {width: 40, height: 40},
    debugTouchArea: false,
    animationType: 'timing'
  };

  constructor(props) {
    super(props);
    
    this._onAnimatedValueChange = this._onAnimatedValueChange.bind(this);

    this.state = {
      containerSize: {width: 0, height: 0},
      trackSize: {width: 0, height: 0},
      thumbSize: {width: 0, height: 0},
      allMeasured: false,
      value: this._prepareValuesFromProps(this.props.value),
      minThumbValue: new Animated.Value(0),
      maxThumbValue: new Animated.Value(0),
      interpolatedThumbValues: [],
    };
  }

  _prepareValuesFromProps(value) {

    let normalized = [];

    if (!Array.isArray(value)) {
      value = [value];
    }
    let valueCount = value.length;

    for (let i = 0; i < valueCount; i++) {
      let newValue = value[i];
      if (typeof newValue !== 'number') {
        newValue = i > 0 ? normalized[i - 1] : 0;
      } 
      newValue = Math.max(Math.min(newValue, this.props.maximumValue), this.props.minimumValue)
      normalized.push(newValue);
    }

    for (let i = 0; i < normalized.length; i++) {
      normalized[i] = new Animated.Value(normalized[i]);
      normalized[i].addListener(this._onAnimatedValueChange);
    }

    return normalized;
  }

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
  };

  componentWillReceiveProps(nextProps) {
    var oldValues = this.props.value;
    var newValues = nextProps.value;
    
    if (!Array.isArray(newValues))
      newValues = [newValues];

    if (newValues.length !== this.state.value.length) {
      // Different number of thumbs
      this.setState({
        value: this._prepareValuesFromProps(nextProps.value)
      });
    } else {
      // Just update/animate current thumb values
      for (let i = 0; i < newValues.length; i++) {
        let val = newValues[i];
        if (typeof val === 'number' && val !== newValues[i]) {
          if (this.props.animateTransitions) {
            this._setCurrentValueAnimated(val, i);
          }
          else {
            this._setCurrentValue(val, i);
          }
        }
      }
    }
  };

  render() {
    var {
      minimumValue,
      maximumValue,
      minimumTrackTintColor,
      maximumTrackTintColor,
      trackColor,
      trackHighlightColor,
      thumbTintColor,
      styles,
      style,
      trackStyle,
      thumbStyle,
      debugTouchArea,
      ...other
    } = this.props;

    var {value, containerSize, trackSize, thumbSize, allMeasured} = this.state;

    var mainStyles = styles || defaultStyles;

    let thumbValues = this.state.interpolatedThumbValues = value.map(v => v.interpolate({
      inputRange: [minimumValue, maximumValue],
      outputRange: [0, containerSize.width - thumbSize.width],
      //extrapolate: 'clamp',
    }));

    var valueVisibleStyle = {};
    if (!allMeasured) {
      valueVisibleStyle.opacity = 0;
    }

    var touchOverflowStyle = this._getTouchOverflowStyle();

    let children = [];

    let trackHighlightStyle;

    if (thumbValues.length > 1) {

      let flatValues = thumbValues.map(x => x.__getValue());
      this.state.minThumbValue = new Animated.Value(Math.min.apply(Math, flatValues));
      this.state.maxThumbValue = new Animated.Value(Math.max.apply(Math, flatValues));

      trackHighlightStyle = {
        position: 'absolute',
        left: Animated.add(this.state.minThumbValue, thumbSize.width / 2),
        width: Animated.add(
          Animated.multiply(this.state.minThumbValue, -1), 
          this.state.maxThumbValue
        ),
        marginTop: -trackSize.height,
        backgroundColor: minimumTrackTintColor || trackHighlightColor,
        ...valueVisibleStyle
      };

    } else {
      trackHighlightStyle = {
        position: 'absolute',
        left: 0,
        width: Animated.add(thumbLeft, thumbSize.width / 2),
        marginTop: -trackSize.height,
        backgroundColor: minimumTrackTintColor || trackHighlightColor,
        ...valueVisibleStyle
      };
    }

    children.push(
      <Animated.View 
        key={'track_highlight'}
        renderToHardwareTextureAndroid={true}
        style={[mainStyles.track, trackStyle, trackHighlightStyle]} />
    );

    for (let i = 0; i < thumbValues.length; i++) {
      let thumb = thumbValues[i];

      children.push(
        <Animated.View
          key={'thumb_' + i}
          onLayout={this._measureThumb}
          renderToHardwareTextureAndroid={true}
          style={[
            {backgroundColor: thumbTintColor},
            mainStyles.thumb, thumbStyle,
            {
              transform: [
                { translateX: thumb },
                { translateY: 0 }
              ],
              ...valueVisibleStyle
            }
          ]}
        >
        {this._renderThumbImage(i)}
        </Animated.View>
      );
    }

    for (let i = 0; i < thumbValues.length; i++) {
      let thumb = thumbValues[i];

      children.push(
        <View
          key={'panhandlers_' + i}
          renderToHardwareTextureAndroid={true}
          style={[defaultStyles.touchArea, touchOverflowStyle]}
          {...this._panResponder.panHandlers}>
          {debugTouchArea === true && this._renderDebugThumbTouchRect(thumb)}
        </View>
      );
    }

    return (
      <View {...other} style={[mainStyles.container, style]} onLayout={this._measureContainer}>

        <View
          style={[{backgroundColor: maximumTrackTintColor || trackColor}, mainStyles.track, trackStyle]}
          renderToHardwareTextureAndroid={true}
          onLayout={this._measureTrack} />

        {children}

      </View>
    );
  };

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
  };

  _handleStartShouldSetPanResponder = (e/*, gestureState*/) => {
    // Should we become active when the user presses down on the thumb?
    return this._thumbHitTest(e) !== -1;
  };

  _handleMoveShouldSetPanResponder(/*e, gestureState*/) {
    // Should we become active when the user moves a touch over the thumb?
    return false;
  };

  _handlePanResponderGrant = (e/*, gestureState*/) => {

    let hitIndex = this._thumbHitTest(e);

    if (hitIndex === -1)
      return false;

    if (!this._trackingTouches) {
      this._trackingTouches = {};
    }

    this._trackingTouches[e.nativeEvent.identifier] = {
      index: hitIndex,
      prevValue: this._getThumb(this._getThumbValue(hitIndex))
    };

    this._fireChangeEvent('onSlidingStart', hitIndex);
  };

  _handlePanResponderMove = (e, gestureState) => {
    if (this.props.disabled) {
      return;
    }

    let tracking = this._trackingTouches[e.nativeEvent.identifier];

    let newValue = this._getValue(tracking.prevValue, gestureState);
    if (tracking.index > 0)
      newValue = Math.max(newValue, this._getThumbValue(tracking.index - 1));
    if (tracking.index < this.state.value.length - 1)
      newValue = Math.min(newValue, this._getThumbValue(tracking.index + 1));

    this._setCurrentValue(newValue, tracking.index);

    this._fireChangeEvent('onValueChange', tracking.index);
  };

  _handlePanResponderRequestEnd(e, gestureState) {
    // Should we allow another component to take over this pan?
    return false;
  };

  _handlePanResponderEnd = (e, gestureState) => {

    let tracking = this._trackingTouches[e.nativeEvent.identifier];
    delete this._trackingTouches[e.nativeEvent.identifier];

    if (this.props.disabled || !tracking) {
      return;
    }

    this._fireChangeEvent('onSlidingComplete', tracking.index);
  };

  _measureContainer = (x) => {
    this._handleMeasure('containerSize', x);
  };

  _measureTrack = (x) => {
    this._handleMeasure('trackSize', x);
  };

  _measureThumb = (x) => {
    this._handleMeasure('thumbSize', x);
  };

  _handleMeasure = (name, x) => {
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
  };

  _getRatio = (value) => {
    return (value - this.props.minimumValue) / (this.props.maximumValue - this.props.minimumValue);
  };

  _getThumb = (value) => {
    var ratio = this._getRatio(value);
    return ratio * (this.state.containerSize.width - this.state.thumbSize.width);
  };

  _getValue = (value, gestureState) => {
    var length = this.state.containerSize.width - this.state.thumbSize.width;
    var thumb = value + gestureState.dx;

    var ratio = thumb / length;

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
  };

  _getThumbValue = (i) => {
    return this.state.value[i].__getValue();
  };

  _onAnimatedValueChange = (x) => {
    if (this.state.value.length > 1) {
      // We only need this in multi-thumb mode.
      // If there was an Animated feature that allows min/max 
      //   on multiple Animated values - we could remove this listener.

      let flatValues = this.state.interpolatedThumbValues.map(x => x.__getValue());
      this.state.minThumbValue.setValue(Math.min.apply(Math, flatValues));
      this.state.maxThumbValue.setValue(Math.max.apply(Math, flatValues));
    }
  };

  _setCurrentValue = (value, i) => {
    if (typeof value !== 'number')
      return;

    this.state.value[i].setValue(value);
  };

  _setCurrentValueAnimated = (value, i) => {
    var animationType   = this.props.animationType;
    var animationConfig = Object.assign(
      {},
      DEFAULT_ANIMATION_CONFIGS[animationType],
      this.props.animationConfig,
      {toValue : value}
    );

    Animated[animationType](this.state.value[i], animationConfig).start();
  };

  _fireChangeEvent = (event) => {
    if (this.props[event]) {
      this.props[event].apply(this, this.state.value.map(x => x.__getValue()));
    }
  };

  _getTouchOverflowSize = () => {
    var state = this.state;
    var props = this.props;

    var size = {};
    if (state.allMeasured === true) {
      size.width = Math.max(0, props.thumbTouchSize.width - state.thumbSize.width);
      size.height = Math.max(0, props.thumbTouchSize.height - state.containerSize.height);
    }

    return size;
  };

  _getTouchOverflowStyle = () => {
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
  };

  _thumbHitTest = (e) => {

    var nativeEvent = e.nativeEvent;

    let hitIndex = -1;

    for (let i = 0; i < this.state.value.length; i++) {
      let thumbRect = this._getThumbTouchRect(this._getThumb(this._getThumbValue(i)));
      if (thumbRect.containsPoint(nativeEvent.locationX, nativeEvent.locationY)) {
        hitIndex = i;
        break;
      }
    }

    return hitIndex;
  };

  _getThumbTouchRect = (thumbLocation) => {
    var state = this.state;
    var props = this.props;
    var touchOverflowSize = this._getTouchOverflowSize();

    return new Rect(
      touchOverflowSize.width / 2 + thumbLocation + (state.thumbSize.width - props.thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 + (state.containerSize.height - props.thumbTouchSize.height) / 2,
      props.thumbTouchSize.width,
      props.thumbTouchSize.height
    );
  };

  _renderDebugThumbTouchRect = (thumbLeft) => {
    var thumbTouchRect = this._getThumbTouchRect(thumbLeft);
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
  };

  _renderThumbImage = (thumbIndex) => {
    var {
      thumbImage,
      thumbView
    } = this.props;

    if (Array.isArray(thumbView)) {
      thumbView = thumbView[thumbIndex];
    }

    if (thumbView)
      return thumbView;
      
    if (Array.isArray(thumbImage)) {
      thumbImage = thumbImage[thumbIndex];
    }

    if (!thumbImage) return;

    return <Image source={thumbImage} />;
  };
}

var defaultStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_SIZE,
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
