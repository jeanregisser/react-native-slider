import React, { PureComponent } from 'react';

import {
  Animated,
  Image,
  StyleSheet,
  PanResponder,
  View,
  Easing,
  ViewPropTypes,
  I18nManager,
} from 'react-native';

import PropTypes from 'prop-types';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Rect.prototype.containsPoint = function(x, y) {
  return (
    x >= this.x &&
    y >= this.y &&
    x <= this.x + this.width &&
    y <= this.y + this.height
  );
};

const DEFAULT_ANIMATION_CONFIGS = {
  spring: {
    friction: 7,
    tension: 100,
  },
  timing: {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
    delay: 0,
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
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number)
    ]),

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
    thumbTouchSize: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),

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
    thumbStyle: PropTypes.oneOfType([
      ViewPropTypes.style,
      PropTypes.arrayOf(ViewPropTypes.style)
    ]),

    /**
     * Sets an image for the thumb.
     */
    thumbImage: PropTypes.oneOfType([
      Image.propTypes.source,
      PropTypes.arrayOf(Image.propTypes.source)
    ]),

    /**
     * Set this to true to visually see the thumb touch rect in green.
     */
    debugTouchArea: PropTypes.bool,

    /**
     * Set to true to animate values with default 'timing' animation type
     */
    animateTransitions: PropTypes.bool,

    /**
     * Custom Animation type. 'spring' or 'timing'.
     */
    animationType: PropTypes.oneOf(['spring', 'timing']),

    /**
     * Used to configure the animation parameters.  These are the same parameters in the Animated library.
     */
    animationConfig: PropTypes.object,
  };

  static defaultProps = {
    value: 0,
    minimumValue: 0,
    maximumValue: 1,
    step: 0,
    minimumTrackTintColor: '#3f3f3f',
    maximumTrackTintColor: '#b3b3b3',
    thumbTintColor: '#343434',
    thumbTouchSize: { width: 40, height: 40 },
    debugTouchArea: false,
    animationType: 'timing',
  };

  state = {
    containerSize: { width: 0, height: 0 },
    trackSize: { width: 0, height: 0 },
    thumbSize: { width: 0, height: 0 },
    allMeasured: false,
    values: this._updateValues(this._normalizePropValue(this.props.value))
  };

  _panResponder = null;
  _previousLeft = null;
  _activeThumbIndex = null;
  _containerSize = null;
  _trackSize = null;
  _thumbSize = null;

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
  }

  componentWillReceiveProps(nextProps) {
    const oldValues = this._normalizePropValue(this.props.value);
    const newValues = this._normalizePropValue(nextProps.value);

    if (newValues.length !== this.state.values.length) {
      this.setState({ values: this._updateValues(this.state.values, newValues) });
    } else {
      newValues.forEach((value, i) => {
        if (value !== oldValues[i]) {
          if (this.props.animateTransitions) {
            this._setCurrentValueAnimated(value, i);
          } else {
            this._setCurrentValue(value, i);
          }
        }
      });
    }
  }

  render() {
    const {
      minimumValue,
      maximumValue,
      minimumTrackTintColor,
      maximumTrackTintColor,
      thumbTintColor,
      thumbImage,
      styles,
      style,
      trackStyle,
      thumbStyle,
      debugTouchArea,
      onValueChange,
      thumbTouchSize,
      animationType,
      animateTransitions,
      ...other
    } = this.props;
    const {
      values,
      containerSize,
      thumbSize,
      allMeasured,
    } = this.state;


    const mainStyles = styles || defaultStyles;

    const interpolatedThumbValues = values.map((v) => v.interpolate({
      inputRange: [minimumValue, maximumValue],
      outputRange: I18nManager.isRTL
        ? [0, -(containerSize.width - thumbSize.width)]
        : [0, containerSize.width - thumbSize.width],
      // extrapolate: 'clamp',
    }));


    const valueVisibleStyle = {};
    if (!allMeasured) {
      valueVisibleStyle.opacity = 0;
    }

    const interpolatedRawValues = this._getRawValues(interpolatedThumbValues);
    const minThumbValue = new Animated.Value(Math.min(...interpolatedRawValues));
    const maxThumbValue = new Animated.Value(Math.max(...interpolatedRawValues));

    const minimumTrackStyle = {
      position: 'absolute',
      left: interpolatedThumbValues.length === 1
        ? new Animated.Value(0) :
        Animated.add(minThumbValue, thumbSize.width / 2),
      width: interpolatedThumbValues.length === 1
        ? Animated.add(interpolatedThumbValues[0], thumbSize.width / 2)
        : Animated.add(Animated.multiply(minThumbValue, -1), maxThumbValue),
      backgroundColor: minimumTrackTintColor,
      ...valueVisibleStyle
    };


    const touchOverflowStyle = this._getTouchOverflowStyle();

    return (
      <View
        {...other}
        style={[mainStyles.container, style]}
        onLayout={this._measureContainer}
      >
        <View
          style={[
            { backgroundColor: maximumTrackTintColor },
            mainStyles.track,
            trackStyle,
          ]}
          renderToHardwareTextureAndroid
          onLayout={this._measureTrack}
        />

        <Animated.View
          renderToHardwareTextureAndroid
          style={[mainStyles.track, trackStyle, minimumTrackStyle]}
        />

        {interpolatedThumbValues.map((value, i) => (
          <Animated.View
            key={`thumb_${i}`}
            onLayout={this._measureThumb}
            renderToHardwareTextureAndroid
            style={[
              { backgroundColor: thumbTintColor },
              mainStyles.thumb,
              thumbStyle,
              {
                transform: [{ translateX: value }, { translateY: 0 }],
                ...valueVisibleStyle,
              },
            ]}
          >
            {this._renderThumbImage(i)}
          </Animated.View>
        ))}

        <View
          renderToHardwareTextureAndroid
          style={[defaultStyles.touchArea, touchOverflowStyle]}
          {...this._panResponder.panHandlers}
        ></View>
      </View>
    );
  }

  _normalizePropValue(value) {
    const getBetweenValue = (value) => Math.max(
      Math.min(value, this.props.maximumValue),
      this.props.minimumValue
    );

    if (!Array.isArray(value)) {
      return [getBetweenValue(value)];
    }

    return value.map(getBetweenValue);
  }

  _updateValues(values, newValues = values) {
    if (newValues.length !== values.length) {
      return this._updateValues(newValues);
    }

    return values.map((value, i) => {
      if (value instanceof Animated.Value) {
        value.setValue(
          newValues[i] instanceof Animated.Value
            ? newValues[i].__getValue()
            : newValues[i]
        );
      }

      if (newValues[i] instanceof Animated.Value) {
        value = newValues[i];
      } else {
        value = new Animated.Value(newValues[i]);
      }

      return value;
    });
  }

  _getRawValues(values) {
    return values.map((value) => value.__getValue());
  }



  _getPropsForComponentUpdate(props) {
    const {
      value,
      onValueChange,
      onSlidingStart,
      onSlidingComplete,
      style,
      trackStyle,
      thumbStyle,
      ...otherProps
    } = props;

    return otherProps;
  }

  _handleStartShouldSetPanResponder = (e: Object): boolean => {
    // Should we become active when the user presses down on the thumb?
    return this._thumbHitTest(e);
  };

  _handleMoveShouldSetPanResponder = (): boolean => {
    // Should we become active when the user moves a touch over the thumb?
    return false;
  };

  _handlePanResponderGrant = () => {
    this._previousLeft = this._getThumbLeft(this._getCurrentValue(this._activeThumbIndex));
    this._fireChangeEvent('onSlidingStart');
  };

  _handlePanResponderMove = (_, gestureState: Object) => {
    if (this.props.disabled) {
      return;
    }

    this._setCurrentValue(
      this._getValue(gestureState),
      this._activeThumbIndex
    );
    this._fireChangeEvent('onValueChange');
  };

  _handlePanResponderRequestEnd = () => {
    // Should we allow another component to take over this pan?
    return false;
  };

  _handlePanResponderEnd = (_, gestureState: Object) => {
    if (this.props.disabled) {
      return;
    }

    this._setCurrentValue(
      this._getValue(gestureState),
      this._activeThumbIndex
    );
    this._fireChangeEvent('onSlidingComplete');
    this._activeThumbIndex = null;
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
    const { width, height } = x.nativeEvent.layout;
    const size = { width, height };

    const storeName = `_${name}`;
    const currentSize = this[storeName];
    if (
      currentSize &&
      width === currentSize.width &&
      height === currentSize.height
    ) {
      return;
    }
    this[storeName] = size;

    if (this._containerSize && this._trackSize && this._thumbSize) {
      this.setState({
        containerSize: this._containerSize,
        trackSize: this._trackSize,
        thumbSize: this._thumbSize,
        allMeasured: true,
      });
    }
  };

  _getRatio = (value: number) =>
    (value - this.props.minimumValue) /
    (this.props.maximumValue - this.props.minimumValue);

  _getThumbLeft = (value: number) => {
    const nonRtlRatio = this._getRatio(value);
    const ratio = I18nManager.isRTL ? 1 - nonRtlRatio : nonRtlRatio;
    return (
      ratio * (this.state.containerSize.width - this.state.thumbSize.width)
    );
  };

  _getValue = (gestureState: Object) => {
    const length = this.state.containerSize.width - this.state.thumbSize.width;
    const thumbLeft = this._previousLeft + gestureState.dx;

    const nonRtlRatio = thumbLeft / length;
    const ratio = I18nManager.isRTL ? 1 - nonRtlRatio : nonRtlRatio;

    if (this.props.step) {
      return Math.max(
        this.props.minimumValue,
        Math.min(
          this.props.maximumValue,
          this.props.minimumValue +
            Math.round(
              ratio *
                (this.props.maximumValue - this.props.minimumValue) /
                this.props.step,
            ) *
              this.props.step,
        ),
      );
    }
    return Math.max(
      this.props.minimumValue,
      Math.min(
        this.props.maximumValue,
        ratio * (this.props.maximumValue - this.props.minimumValue) +
          this.props.minimumValue,
      ),
    );
  };

  _getCurrentValue = (thumbIndex = 0) => this.state.values[thumbIndex].__getValue();

  _setCurrentValue = (value: number, thumbIndex = 0) => {
    this.state.values[thumbIndex].setValue(value);
  };

  _setCurrentValueAnimated = (value: number, thumbIndex = 0) => {
    const animationType = this.props.animationType;
    const animationConfig = Object.assign(
      {},
      DEFAULT_ANIMATION_CONFIGS[animationType],
      this.props.animationConfig,
      {
        toValue: value,
      },
    );

    Animated[animationType](
      this.state.values[thumbIndex],
      animationConfig
    ).start();
  };

  _fireChangeEvent = event => {
    if (this.props[event]) {
      this.props[event](this._getRawValues(this.state.values));
    }
  };

  _getTouchOverflowSize = () => {
    const state = this.state;
    const props = this.props;

    const size = {};
    if (state.allMeasured === true) {
      size.width = Math.max(
        0,
        props.thumbTouchSize.width - state.thumbSize.width,
      );
      size.height = Math.max(
        0,
        props.thumbTouchSize.height - state.containerSize.height,
      );
    }

    return size;
  };

  _getTouchOverflowStyle = () => {
    const { width, height } = this._getTouchOverflowSize();

    const touchOverflowStyle = {};
    if (width !== undefined && height !== undefined) {
      const verticalMargin = -height / 2;
      touchOverflowStyle.marginTop = verticalMargin;
      touchOverflowStyle.marginBottom = verticalMargin;

      const horizontalMargin = -width / 2;
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
    const nativeEvent = e.nativeEvent;
    return this.state.values.find((_, i) => {
      const thumbTouchRect = this._getThumbTouchRect(i);


      const containsPoint = thumbTouchRect.containsPoint(
        nativeEvent.locationX,
        nativeEvent.locationY,
      );

      if (containsPoint) {
        this._activeThumbIndex = i;
      }

      return containsPoint;
    }) != null;
  };

  _getThumbTouchRect = (thumbIndex = 0) => {
    const state = this.state;
    const props = this.props;
    const touchOverflowSize = this._getTouchOverflowSize();

    return new Rect(
      touchOverflowSize.width / 2 +
        this._getThumbLeft(this._getCurrentValue(thumbIndex)) +
        (state.thumbSize.width - props.thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 +
        (state.containerSize.height - props.thumbTouchSize.height) / 2,
      props.thumbTouchSize.width,
      props.thumbTouchSize.height,
    );
  };

  _renderThumbImage = (thumbIndex = 0) => {
    const { thumbImage } = this.props;

    if (thumbImage == null) return;

    return <Image source={Array.isArray(thumbImage) ? thumbImage[thumbIndex] : thumbImage} />;
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
  },
});
