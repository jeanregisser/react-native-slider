var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var _objectWithoutProperties2 = _interopRequireDefault(
  require("@babel/runtime/helpers/objectWithoutProperties")
);
var _classCallCheck2 = _interopRequireDefault(
  require("@babel/runtime/helpers/classCallCheck")
);
var _createClass2 = _interopRequireDefault(
  require("@babel/runtime/helpers/createClass")
);
var _assertThisInitialized2 = _interopRequireDefault(
  require("@babel/runtime/helpers/assertThisInitialized")
);
var _inherits2 = _interopRequireDefault(
  require("@babel/runtime/helpers/inherits")
);
var _possibleConstructorReturn2 = _interopRequireDefault(
  require("@babel/runtime/helpers/possibleConstructorReturn")
);
var _getPrototypeOf2 = _interopRequireDefault(
  require("@babel/runtime/helpers/getPrototypeOf")
);
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _deprecatedReactNativePropTypes = require("deprecated-react-native-prop-types");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = [
    "minimumValue",
    "maximumValue",
    "minimumTrackTintColor",
    "maximumTrackTintColor",
    "thumbTintColor",
    "thumbImage",
    "styles",
    "style",
    "trackStyle",
    "thumbStyle",
    "debugTouchArea",
    "onValueChange",
    "thumbTouchSize",
    "animationType",
    "animateTransitions",
  ],
  _excluded2 = [
    "value",
    "onValueChange",
    "onSlidingStart",
    "onSlidingComplete",
    "style",
    "trackStyle",
    "thumbStyle",
  ];
var _jsxFileName =
  "/Users/nnanyielugo/Documents/Projects/react-native-slider/src/Slider.js";
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function _getRequireWildcardCache(
    nodeInterop
  ) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = (0, _getPrototypeOf2.default)(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = (0, _getPrototypeOf2.default)(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return (0, _possibleConstructorReturn2.default)(this, result);
  };
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
    return true;
  } catch (e) {
    return false;
  }
}
var TRACK_SIZE = 4;
var THUMB_SIZE = 20;
function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}
Rect.prototype.containsPoint = function (x, y) {
  return (
    x >= this.x &&
    y >= this.y &&
    x <= this.x + this.width &&
    y <= this.y + this.height
  );
};
var DEFAULT_ANIMATION_CONFIGS = {
  spring: { friction: 7, tension: 100 },
  timing: {
    duration: 150,
    easing: _reactNative.Easing.inOut(_reactNative.Easing.ease),
    delay: 0,
  },
};
var Slider = (function (_PureComponent) {
  (0, _inherits2.default)(Slider, _PureComponent);
  var _super = _createSuper(Slider);
  function Slider() {
    var _this;
    (0, _classCallCheck2.default)(this, Slider);
    for (
      var _len = arguments.length, args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _this.state = {
      containerSize: { width: 0, height: 0 },
      trackSize: { width: 0, height: 0 },
      thumbSize: { width: 0, height: 0 },
      allMeasured: false,
      value: new _reactNative.Animated.Value(_this.props.value),
    };
    _this._handleStartShouldSetPanResponder = function (e) {
      return _this._thumbHitTest(e);
    };
    _this._handlePanResponderGrant = function () {
      _this._previousLeft = _this._getThumbLeft(_this._getCurrentValue());
      _this._fireChangeEvent("onSlidingStart");
    };
    _this._handlePanResponderMove = function (e, gestureState) {
      if (_this.props.disabled) {
        return;
      }
      _this._setCurrentValue(_this._getValue(gestureState));
      _this._fireChangeEvent("onValueChange");
    };
    _this._handlePanResponderEnd = function (e, gestureState) {
      if (_this.props.disabled) {
        return;
      }
      _this._setCurrentValue(_this._getValue(gestureState));
      _this._fireChangeEvent("onSlidingComplete");
    };
    _this._measureContainer = function (x) {
      _this._handleMeasure("containerSize", x);
    };
    _this._measureTrack = function (x) {
      _this._handleMeasure("trackSize", x);
    };
    _this._measureThumb = function (x) {
      _this._handleMeasure("thumbSize", x);
    };
    _this._handleMeasure = function (name, x) {
      var _x$nativeEvent$layout = x.nativeEvent.layout,
        width = _x$nativeEvent$layout.width,
        height = _x$nativeEvent$layout.height;
      var size = { width: width, height: height };
      var storeName = "_" + name;
      var currentSize = _this[storeName];
      if (
        currentSize &&
        width === currentSize.width &&
        height === currentSize.height
      ) {
        return;
      }
      _this[storeName] = size;
      if (_this._containerSize && _this._trackSize && _this._thumbSize) {
        _this.setState({
          containerSize: _this._containerSize,
          trackSize: _this._trackSize,
          thumbSize: _this._thumbSize,
          allMeasured: true,
        });
      }
    };
    _this._getRatio = function (value) {
      return (
        (value - _this.props.minimumValue) /
        (_this.props.maximumValue - _this.props.minimumValue)
      );
    };
    _this._getThumbLeft = function (value) {
      var nonRtlRatio = _this._getRatio(value);
      var ratio = _reactNative.I18nManager.isRTL
        ? 1 - nonRtlRatio
        : nonRtlRatio;
      return (
        ratio * (_this.state.containerSize.width - _this.state.thumbSize.width)
      );
    };
    _this._getValue = function (gestureState) {
      var length =
        _this.state.containerSize.width - _this.state.thumbSize.width;
      var thumbLeft = _this._previousLeft + gestureState.dx;
      var nonRtlRatio = thumbLeft / length;
      var ratio = _reactNative.I18nManager.isRTL
        ? 1 - nonRtlRatio
        : nonRtlRatio;
      if (_this.props.step) {
        return Math.max(
          _this.props.minimumValue,
          Math.min(
            _this.props.maximumValue,
            _this.props.minimumValue +
              Math.round(
                (ratio *
                  (_this.props.maximumValue - _this.props.minimumValue)) /
                  _this.props.step
              ) *
                _this.props.step
          )
        );
      }
      return Math.max(
        _this.props.minimumValue,
        Math.min(
          _this.props.maximumValue,
          ratio * (_this.props.maximumValue - _this.props.minimumValue) +
            _this.props.minimumValue
        )
      );
    };
    _this._getCurrentValue = function () {
      return _this.state.value.__getValue();
    };
    _this._setCurrentValue = function (value) {
      _this.state.value.setValue(value);
    };
    _this._setCurrentValueAnimated = function (value) {
      var animationType = _this.props.animationType;
      var animationConfig = Object.assign(
        {},
        DEFAULT_ANIMATION_CONFIGS[animationType],
        _this.props.animationConfig,
        { toValue: value }
      );
      _reactNative.Animated[animationType](
        _this.state.value,
        animationConfig
      ).start();
    };
    _this._fireChangeEvent = function (event) {
      if (_this.props[event]) {
        _this.props[event](_this._getCurrentValue());
      }
    };
    _this._getTouchOverflowSize = function () {
      var state = _this.state;
      var props = _this.props;
      var size = {};
      if (state.allMeasured === true) {
        size.width = Math.max(
          0,
          props.thumbTouchSize.width - state.thumbSize.width
        );
        size.height = Math.max(
          0,
          props.thumbTouchSize.height - state.containerSize.height
        );
      }
      return size;
    };
    _this._getTouchOverflowStyle = function () {
      var _this$_getTouchOverfl = _this._getTouchOverflowSize(),
        width = _this$_getTouchOverfl.width,
        height = _this$_getTouchOverfl.height;
      var touchOverflowStyle = {};
      if (width !== undefined && height !== undefined) {
        var verticalMargin = -height / 2;
        touchOverflowStyle.marginTop = verticalMargin;
        touchOverflowStyle.marginBottom = verticalMargin;
        var horizontalMargin = -width / 2;
        touchOverflowStyle.marginLeft = horizontalMargin;
        touchOverflowStyle.marginRight = horizontalMargin;
      }
      if (_this.props.debugTouchArea === true) {
        touchOverflowStyle.backgroundColor = "orange";
        touchOverflowStyle.opacity = 0.5;
      }
      return touchOverflowStyle;
    };
    _this._thumbHitTest = function (e) {
      var nativeEvent = e.nativeEvent;
      var thumbTouchRect = _this._getThumbTouchRect();
      return thumbTouchRect.containsPoint(
        nativeEvent.locationX,
        nativeEvent.locationY
      );
    };
    _this._getThumbTouchRect = function () {
      var state = _this.state;
      var props = _this.props;
      var touchOverflowSize = _this._getTouchOverflowSize();
      return new Rect(
        touchOverflowSize.width / 2 +
          _this._getThumbLeft(_this._getCurrentValue()) +
          (state.thumbSize.width - props.thumbTouchSize.width) / 2,
        touchOverflowSize.height / 2 +
          (state.containerSize.height - props.thumbTouchSize.height) / 2,
        props.thumbTouchSize.width,
        props.thumbTouchSize.height
      );
    };
    _this._renderDebugThumbTouchRect = function (thumbLeft) {
      var thumbTouchRect = _this._getThumbTouchRect();
      var positionStyle = {
        left: thumbLeft,
        top: thumbTouchRect.y,
        width: thumbTouchRect.width,
        height: thumbTouchRect.height,
      };
      return (0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
        style: [defaultStyles.debugThumbTouchArea, positionStyle],
        pointerEvents: "none",
      });
    };
    _this._renderThumbImage = function () {
      var thumbImage = _this.props.thumbImage;
      if (!thumbImage) return;
      return (0, _jsxRuntime.jsx)(_reactNative.Image, { source: thumbImage });
    };
    return _this;
  }
  (0, _createClass2.default)(Slider, [
    {
      key: "componentWillMount",
      value: function componentWillMount() {
        this._panResponder = _reactNative.PanResponder.create({
          onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
          onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
          onPanResponderGrant: this._handlePanResponderGrant,
          onPanResponderMove: this._handlePanResponderMove,
          onPanResponderRelease: this._handlePanResponderEnd,
          onPanResponderTerminationRequest: this._handlePanResponderRequestEnd,
          onPanResponderTerminate: this._handlePanResponderEnd,
        });
      },
    },
    {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        var newValue = nextProps.value;
        if (this.props.value !== newValue) {
          if (this.props.animateTransitions) {
            this._setCurrentValueAnimated(newValue);
          } else {
            this._setCurrentValue(newValue);
          }
        }
      },
    },
    {
      key: "render",
      value: function render() {
        var _this$props = this.props,
          minimumValue = _this$props.minimumValue,
          maximumValue = _this$props.maximumValue,
          minimumTrackTintColor = _this$props.minimumTrackTintColor,
          maximumTrackTintColor = _this$props.maximumTrackTintColor,
          thumbTintColor = _this$props.thumbTintColor,
          thumbImage = _this$props.thumbImage,
          styles = _this$props.styles,
          style = _this$props.style,
          trackStyle = _this$props.trackStyle,
          thumbStyle = _this$props.thumbStyle,
          debugTouchArea = _this$props.debugTouchArea,
          onValueChange = _this$props.onValueChange,
          thumbTouchSize = _this$props.thumbTouchSize,
          animationType = _this$props.animationType,
          animateTransitions = _this$props.animateTransitions,
          other = (0, _objectWithoutProperties2.default)(
            _this$props,
            _excluded
          );
        var _this$state = this.state,
          value = _this$state.value,
          containerSize = _this$state.containerSize,
          trackSize = _this$state.trackSize,
          thumbSize = _this$state.thumbSize,
          allMeasured = _this$state.allMeasured;
        var mainStyles = styles || defaultStyles;
        var thumbLeft = value.interpolate({
          inputRange: [minimumValue, maximumValue],
          outputRange: _reactNative.I18nManager.isRTL
            ? [0, -(containerSize.width - thumbSize.width)]
            : [0, containerSize.width - thumbSize.width],
        });
        var minimumTrackWidth = value.interpolate({
          inputRange: [minimumValue, maximumValue],
          outputRange: [0, containerSize.width - thumbSize.width],
        });
        var valueVisibleStyle = {};
        if (!allMeasured) {
          valueVisibleStyle.opacity = 0;
        }
        var minimumTrackStyle = Object.assign(
          {
            position: "absolute",
            width: _reactNative.Animated.add(
              minimumTrackWidth,
              thumbSize.width / 2
            ),
            backgroundColor: minimumTrackTintColor,
          },
          valueVisibleStyle
        );
        var touchOverflowStyle = this._getTouchOverflowStyle();
        return (0, _jsxRuntime.jsxs)(
          _reactNative.View,
          Object.assign({}, other, {
            style: [mainStyles.container, style],
            onLayout: this._measureContainer,
            children: [
              (0, _jsxRuntime.jsx)(_reactNative.View, {
                style: [
                  { backgroundColor: maximumTrackTintColor },
                  mainStyles.track,
                  trackStyle,
                ],
                renderToHardwareTextureAndroid: true,
                onLayout: this._measureTrack,
              }),
              (0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
                renderToHardwareTextureAndroid: true,
                style: [mainStyles.track, trackStyle, minimumTrackStyle],
              }),
              (0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
                onLayout: this._measureThumb,
                renderToHardwareTextureAndroid: true,
                style: [
                  { backgroundColor: thumbTintColor },
                  mainStyles.thumb,
                  thumbStyle,
                  Object.assign(
                    {
                      transform: [{ translateX: thumbLeft }, { translateY: 0 }],
                    },
                    valueVisibleStyle
                  ),
                ],
                children: this._renderThumbImage(),
              }),
              (0, _jsxRuntime.jsx)(
                _reactNative.View,
                Object.assign(
                  {
                    renderToHardwareTextureAndroid: true,
                    style: [defaultStyles.touchArea, touchOverflowStyle],
                  },
                  this._panResponder.panHandlers,
                  {
                    children:
                      debugTouchArea === true &&
                      this._renderDebugThumbTouchRect(minimumTrackWidth),
                  }
                )
              ),
            ],
          })
        );
      },
    },
    {
      key: "_getPropsForComponentUpdate",
      value: function _getPropsForComponentUpdate(props) {
        var value = props.value,
          onValueChange = props.onValueChange,
          onSlidingStart = props.onSlidingStart,
          onSlidingComplete = props.onSlidingComplete,
          style = props.style,
          trackStyle = props.trackStyle,
          thumbStyle = props.thumbStyle,
          otherProps = (0, _objectWithoutProperties2.default)(
            props,
            _excluded2
          );
        return otherProps;
      },
    },
    {
      key: "_handleMoveShouldSetPanResponder",
      value: function _handleMoveShouldSetPanResponder() {
        return false;
      },
    },
    {
      key: "_handlePanResponderRequestEnd",
      value: function _handlePanResponderRequestEnd(e, gestureState) {
        return false;
      },
    },
  ]);
  return Slider;
})(_react.PureComponent);
exports.default = Slider;
Slider.propTypes = {
  value: _propTypes.default.number,
  disabled: _propTypes.default.bool,
  minimumValue: _propTypes.default.number,
  maximumValue: _propTypes.default.number,
  step: _propTypes.default.number,
  minimumTrackTintColor: _propTypes.default.string,
  maximumTrackTintColor: _propTypes.default.string,
  thumbTintColor: _propTypes.default.string,
  thumbTouchSize: _propTypes.default.shape({
    width: _propTypes.default.number,
    height: _propTypes.default.number,
  }),
  onValueChange: _propTypes.default.func,
  onSlidingStart: _propTypes.default.func,
  onSlidingComplete: _propTypes.default.func,
  style: _deprecatedReactNativePropTypes.ViewPropTypes.style,
  trackStyle: _deprecatedReactNativePropTypes.ViewPropTypes.style,
  thumbStyle: _deprecatedReactNativePropTypes.ViewPropTypes.style,
  thumbImage: _reactNative.Image.propTypes.source,
  debugTouchArea: _propTypes.default.bool,
  animateTransitions: _propTypes.default.bool,
  animationType: _propTypes.default.oneOf(["spring", "timing"]),
  animationConfig: _propTypes.default.object,
};
Slider.defaultProps = {
  value: 0,
  minimumValue: 0,
  maximumValue: 1,
  step: 0,
  minimumTrackTintColor: "#3f3f3f",
  maximumTrackTintColor: "#b3b3b3",
  thumbTintColor: "#343434",
  thumbTouchSize: { width: 40, height: 40 },
  debugTouchArea: false,
  animationType: "timing",
};
var defaultStyles = _reactNative.StyleSheet.create({
  container: { height: 40, justifyContent: "center" },
  track: { height: TRACK_SIZE, borderRadius: TRACK_SIZE / 2 },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  touchArea: {
    position: "absolute",
    backgroundColor: "transparent",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugThumbTouchArea: {
    position: "absolute",
    backgroundColor: "green",
    opacity: 0.5,
  },
});
