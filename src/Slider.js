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

Rect.prototype.touchDistance = function(x, y) {
  return Math.sqrt(Math.pow((x-(this.x+this.width/2)),2) + Math.pow((y-(this.y+this.height/2)),2));
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
     * Initial value of the slider. The value should be between minimumValue
     * and maximumValue, which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * *This is not a controlled component*, e.g. if you don't update
     * the value, the component won't be reset to its inital value.
     */
    value: PropTypes.number,

    /**
     * Initial value of the second slider. The value should be between the first value
     * and maximumValue.
     * Default value is maximumValue.
     *
     * *This is not a controlled component*, e.g. if you don't update
     * the value, the component won't be reset to its inital value.
     */
    rightValue: PropTypes.number,

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
    minimumTrackTintColor: function(props, propName, componentName) {
      if (props[propName] && typeof props[propName] !== 'string') {
        return new Error(
              `Invalid prop ${propName} supplied to ${componentName}. This prop must be a string.`
          );
      }
      if (props[propName]) {
        return new Error(
              `Prop ${propName} supplied to ${componentName} has been deprecated, please use trackHighlightColor instead.`
          );
      }
    },
    /**
     * The color used for the track to the right of the button. Overrides the
     * default blue gradient image.
     */
    maximumTrackTintColor: function(props, propName, componentName) {
      if (props[propName] && typeof props[propName] !== 'string') {
        return new Error(
          `Invalid prop ${propName} supplied to ${componentName}. This prop must be a string.`
        );
      }
      if (props[propName]) {
        return new Error(
          `Prop ${propName} supplied to ${componentName} has been deprecated, please use trackColor instead.`
        );
      }
    },

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
     * Set this to true to have two touchpoints on slider for a range.
     */
    multiTouch: PropTypes.bool,

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
    rightValue: 1,
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

  state = {
    containerSize: {width: 0, height: 0},
    trackSize: {width: 0, height: 0},
    thumbSize: {width: 0, height: 0},
    allMeasured: false,
    value: new Animated.Value(this.props.value),
    rightValue: new Animated.Value(this.props.rightValue),
  };

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
    const oldValue = this.props.value;
    const oldValue2 = this.props.rightValue;
    const newValue = nextProps.value;
    const newValue2 = nextProps.rightValue;
    if (this.props.animateTransitions) {
      this._setCurrentValueAnimated(oldValue !== newValue ? nextProps.value: null , oldValue2 !== newValue2 ? nextProps.rightValue : null );
    }
    else {
      this._setCurrentValue(oldValue !== newValue ? nextProps.value: null , oldValue2 !== newValue2 ? nextProps.rightValue : null );
    }
  };

  _getPropsForComponentUpdate(props) {
    var {
      value,
      rightValue,
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

  _handleStartShouldSetPanResponder = (e: Object, /*gestureState: Object*/): boolean => {
    // Should we become active when the user presses down on the thumb?
    return this._thumbHitTest(e);
  };

  _handleMoveShouldSetPanResponder = (/*e: Object, gestureState: Object*/): boolean  => {
    // Should we become active when the user moves a touch over the thumb?
    return false;
  };

  _handlePanResponderGrant = (e: Object, /*gestureState: Object*/) => {
    this._previousLeft = this._getThumb(this._getLeftThumbValue());
    this._previousRight = this._getThumb(this._getRightThumbValue());
    var leftThumbTouchRect = this._getThumbTouchRect(this._previousLeft);
    var rightThumbTouchRect = this._getThumbTouchRect(this._previousRight);
    if (!this.props.multiTouch) {
      this.isLeftThumb = true;
    } else {
      console.log('numbers', leftThumbTouchRect, rightThumbTouchRect, e.nativeEvent);
      console.log('thumb touch distances', leftThumbTouchRect.touchDistance(e.nativeEvent.locationX, e.nativeEvent.locationY), rightThumbTouchRect.touchDistance(e.nativeEvent.locationX, e.nativeEvent.locationY));
      this.isLeftThumb = leftThumbTouchRect.touchDistance(e.nativeEvent.locationX, e.nativeEvent.locationY) < rightThumbTouchRect.touchDistance(e.nativeEvent.locationX, e.nativeEvent.locationY);
    }

    this._fireChangeEvent('onSlidingStart');
  };

  _handlePanResponderMove = (e: Object, gestureState: Object) => {
    if (this.props.disabled) {
      return;
    }

    if (this.isLeftThumb) {
      const newLeft = this._getValue(this._previousLeft, gestureState);
      if (!this.props.multiTouch || newLeft < this._getRightThumbValue()) {
        this._setCurrentValue(newLeft,null);
      }
    } else {
      const newRight = this._getValue(this._previousRight, gestureState);
      if (this.props.multiTouch  && newRight > this._getLeftThumbValue()) {
        this._setCurrentValue(null, newRight);
      }
    }
    this._fireChangeEvent('onValueChange');
  };

  _handlePanResponderRequestEnd = (/*e: Object, gestureState: Object*/) => {
    // Should we allow another component to take over this pan?
    return false;
  };

  _handlePanResponderEnd = (e: Object, gestureState: Object) => {
    if (this.props.disabled) {
      return;
    }
    this._fireChangeEvent('onSlidingComplete');
  };

  _measureContainer = (x: Object) => {
    this._handleMeasure('containerSize', x);
  };

  _measureTrack = (x: Object) => {
    this._handleMeasure('trackSize', x);
  };

  _measureThumb = (x: Object) => {
    this._handleMeasure('thumbSize', x);
  };

  _handleMeasure = (name: string, x: Object) => {
    var {width, height} = x.nativeEvent.layout;
    var size = {width: width, height: height};

    var storeName = `_${name}`;
    var currentSize = this[storeName];
    if (currentSize && width === currentSize.width && height === currentSize.height) {
      return;
    }
    this[storeName] = size;

    if (this._containerSize && this._trackSize && this._thumbSize) {
      this._fireChangeEvent('onValueChange');
      this.setState({
        containerSize: this._containerSize,
        trackSize: this._trackSize,
        thumbSize: this._thumbSize,
        allMeasured: true,
      });
    }
  };

  _getRatio = (value: number) => {
    return (value - this.props.minimumValue) / (this.props.maximumValue - this.props.minimumValue);
  };

  _getThumb = (value: number) => {
    var ratio = this._getRatio(value);
    return ratio * (this.state.containerSize.width - this.state.thumbSize.width);
  };

  _getValue = (value: number, gestureState: Object) => {
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

  _getLeftThumbValue = () => {
    return this.state.value.__getValue();
  };
  _getRightThumbValue = () => {
    return this.state.rightValue.__getValue();
  };

  _setCurrentValue = (leftValue: number, rightValue: number) => {
    if (leftValue) {

      this.state.value.setValue(leftValue);
    }
    if (rightValue) {
      this.state.rightValue.setValue(rightValue);
    }

  };

  _setCurrentValueAnimated = (leftValue: number, rightValue: number) => {

    var animationType   = this.props.animationType;
    var leftAnimationConfig = Object.assign(
        {},
        DEFAULT_ANIMATION_CONFIGS[animationType],
        this.props.animationConfig,
        {toValue : leftValue}
      ),
      rightAnimationConfig = Object.assign(
        {},
        DEFAULT_ANIMATION_CONFIGS[animationType],
        this.props.animationConfig,
        {toValue : rightValue}
      );

    Animated[animationType](this.state.value, leftAnimationConfig).start();
    Animated[animationType](this.state.rightValue, rightAnimationConfig).start();
  };

  _fireChangeEvent = (event) => {
    if (this.props[event]) {
      this.props[event](this._getLeftThumbValue(), this._getRightThumbValue());
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

  _thumbHitTest = (e: Object) => {
    var nativeEvent = e.nativeEvent;
    var leftThumbTouchRect = this._getThumbTouchRect(this._getThumb(this._getLeftThumbValue()));
    var rightThumbTouchRect = this._getThumbTouchRect(this._getThumb(this._getRightThumbValue()));
    return leftThumbTouchRect.containsPoint(nativeEvent.locationX, nativeEvent.locationY) || rightThumbTouchRect.containsPoint(nativeEvent.locationX, nativeEvent.locationY);
  };

  _getThumbTouchRect = (thumbLocation: number) => {
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
  };

  _renderThumbImage = () => {
    var {thumbImage} = this.props;

    if (!thumbImage) return;
    return <Image source={thumbImage} />;
  };

  render() {
    var {
        minimumValue,
        maximumValue,
        trackColor,
        trackHighlightColor,
        thumbTintColor,
        styles,
        style,
        trackStyle,
        thumbStyle,
        debugTouchArea,
        multiTouch,
        ...other
    } = this.props;
    var {value, rightValue, containerSize, trackSize, thumbSize, allMeasured} = this.state;
    var mainStyles = styles || defaultStyles;
    var thumbLeft = value.interpolate({
      inputRange: [minimumValue, maximumValue],
      outputRange: [0, containerSize.width - thumbSize.width],
      //extrapolate: 'clamp',
    });
    var valueVisibleStyle = {};
    if (!allMeasured) {
      valueVisibleStyle.opacity = 0;
    }

    var trackHighlightStyle = {
      position: 'absolute',
      width:  Animated.add(thumbLeft, thumbSize.width / 2),
      left: 0,
      marginTop: -trackSize.height,
      backgroundColor: trackHighlightColor,
      ...valueVisibleStyle
    };
    var touchOverflowStyle = this._getTouchOverflowStyle();

    if (multiTouch) {
      var thumbRight = rightValue.interpolate({
        inputRange: [minimumValue, maximumValue],
        outputRange: [0, containerSize.width - thumbSize.width],
        //extrapolate: 'clamp',
      });
      trackHighlightStyle.width = thumbRight.__getValue() - thumbLeft.__getValue();
      trackHighlightStyle.left = thumbLeft.__getValue();

      return (
          <View {...other} style={[mainStyles.container, style]} onLayout={this._measureContainer}>
            <View
                style={[{backgroundColor: trackColor}, mainStyles.track, trackStyle]}
                renderToHardwareTextureAndroid={true}
                onLayout={this._measureTrack} />
            <Animated.View
              renderToHardwareTextureAndroid={true}
              style={[mainStyles.track, trackStyle, trackHighlightStyle]} />
            <Animated.View
                onLayout={this._measureThumb}
                renderToHardwareTextureAndroid={true}
                style={[
                  {backgroundColor: thumbTintColor},
                  mainStyles.thumb, thumbStyle, { transform: [
                      { translateX: thumbLeft},
                      { translateY: 0 }
                  ], ...valueVisibleStyle}
                ]}
            >
              {this._renderThumbImage()}
            </Animated.View>
            <Animated.View
              onLayout={this._measureThumb}
              renderToHardwareTextureAndroid={true}
              style={[
                {backgroundColor: thumbTintColor},
                mainStyles.thumb, thumbStyle, { transform: [
                    { translateX: thumbRight },
                    { translateY: 0 }
                ], ...valueVisibleStyle}
              ]}
            >
              {this._renderThumbImage()}
            </Animated.View>
            <View
                renderToHardwareTextureAndroid={true}
                style={[defaultStyles.touchArea, touchOverflowStyle]}
                {...this._panResponder.panHandlers}>
              {debugTouchArea === true && this._renderDebugThumbTouchRect(thumbLeft)}
            </View>
            <View
                style={[defaultStyles.touchArea, touchOverflowStyle]}
                {...this._panResponder.panHandlers}>
              {debugTouchArea === true && this._renderDebugThumbTouchRect(thumbRight)}
            </View>
          </View>
      );
    }
    return (
      <View {...other} style={[mainStyles.container, style]} onLayout={this._measureContainer}>
        <View
          style={[{backgroundColor: trackColor ,}, mainStyles.track, trackStyle]}
          renderToHardwareTextureAndroid={true}
          onLayout={this._measureTrack} />
        <Animated.View
          renderToHardwareTextureAndroid={true}
          style={[mainStyles.track, trackStyle, trackHighlightStyle]} />
        <Animated.View
          onLayout={this._measureThumb}
          renderToHardwareTextureAndroid={true}
          style={[
            {backgroundColor: thumbTintColor},
            mainStyles.thumb, thumbStyle,
            {
              transform: [
                { translateX: thumbLeft },
                { translateY: 0 }
              ],
              ...valueVisibleStyle
            }
          ]}
        >
          {this._renderThumbImage()}
        </Animated.View>
        <View
          renderToHardwareTextureAndroid={true}
          style={[defaultStyles.touchArea, touchOverflowStyle]}
          {...this._panResponder.panHandlers}>
          {debugTouchArea === true && this._renderDebugThumbTouchRect(thumbLeft)}
        </View>
      </View>
    );
  }
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
