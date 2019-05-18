import React, {PureComponent} from "react";

import {
    Animated,
    Image,
    StyleSheet,
    PanResponder,
    View,
    Easing,
    I18nManager,
} from "react-native";

import PropTypes from "prop-types";

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
};

export class Slider extends PureComponent {
    static defaultProps = {
        animationType: "timing",
        debugTouchArea: false,
        maximumTrackTintColor: "#b3b3b3",
        maximumValue: 1,
        minimumTrackTintColor: "#3f3f3f",
        minimumValue: 0,
        step: 0,
        thumbTintColor: "#343434",
        thumbTouchSize: {width: 40, height: 40},
        trackClickable: true,
        value: 0,
    };

    state = {
        allMeasured: false,
        containerSize: {width: 0, height: 0},
        thumbSize: {width: 0, height: 0},
        trackSize: {width: 0, height: 0},
        value: new Animated.Value(this.props.value),
    };

    constructor(props) {
        super(props);
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this
                ._handleStartShouldSetPanResponder,
            onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
            onPanResponderGrant: this._handlePanResponderGrant,
            onPanResponderMove: this._handlePanResponderMove,
            onPanResponderRelease: this._handlePanResponderEnd,
            onPanResponderTerminationRequest: this
                ._handlePanResponderRequestEnd,
            onPanResponderTerminate: this._handlePanResponderEnd,
        });
    }

    componentDidUpdate(prevProps) {
        const oldValue = prevProps.value;
        const newValue = this.props.value;

        if (newValue !== oldValue) {
            if (this.props.animateTransitions) {
                this._setCurrentValueAnimated(newValue);
            } else {
                this._setCurrentValue(newValue);
            }
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
            value,
            containerSize,
            trackSize,
            thumbSize,
            allMeasured,
        } = this.state;
        const mainStyles = styles || defaultStyles;
        const thumbLeft = value.interpolate({
            inputRange: [minimumValue, maximumValue],
            outputRange: I18nManager.isRTL
                ? [0, -(containerSize.width - thumbSize.width)]
                : [0, containerSize.width - thumbSize.width],
            // extrapolate: 'clamp',
        });
        const minimumTrackWidth = value.interpolate({
            inputRange: [minimumValue, maximumValue],
            outputRange: [0, containerSize.width - thumbSize.width],
            // extrapolate: 'clamp',
        });
        const valueVisibleStyle = {};
        if (!allMeasured) {
            valueVisibleStyle.opacity = 0;
        }

        const minimumTrackStyle = {
            position: "absolute",
            width: Animated.add(minimumTrackWidth, thumbSize.width / 2),
            backgroundColor: minimumTrackTintColor,
            ...valueVisibleStyle,
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
                        {backgroundColor: maximumTrackTintColor},
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
                <Animated.View
                    onLayout={this._measureThumb}
                    renderToHardwareTextureAndroid
                    style={[
                        {backgroundColor: thumbTintColor},
                        mainStyles.thumb,
                        thumbStyle,
                        {
                            transform: [
                                {translateX: thumbLeft},
                                {translateY: 0},
                            ],
                            ...valueVisibleStyle,
                        },
                    ]}
                >
                    {this._renderThumbImage()}
                </Animated.View>
                <View
                    renderToHardwareTextureAndroid
                    style={[defaultStyles.touchArea, touchOverflowStyle]}
                    {...this._panResponder.panHandlers}
                >
                    {debugTouchArea === true &&
                        this._renderDebugThumbTouchRect(minimumTrackWidth)}
                </View>
            </View>
        );
    }

    _handleStartShouldSetPanResponder = (
        e: Object /* gestureState: Object */
    ): boolean =>
        // Should we become active when the user presses down on the thumb?
        this.props.trackClickable ? true : this._thumbHitTest(e);

    _handleMoveShouldSetPanResponder(/* e: Object, gestureState: Object */): boolean {
        // Should we become active when the user moves a touch over the thumb?
        return false;
    }

    _handlePanResponderGrant = (e: Object, gestureState: Object) => {
        this._previousLeft = this.props.trackClickable
            ? gestureState.x0 -
              (this.state.thumbSize.width + this.state.thumbSize.width / 2)
            : this._getThumbLeft(this._getCurrentValue());
        this._fireChangeEvent("onSlidingStart");
    };

    _handlePanResponderMove = (e: Object, gestureState: Object) => {
        if (this.props.disabled) {
            return;
        }

        this._setCurrentValue(this._getValue(gestureState));
        this._fireChangeEvent("onValueChange");
    };

    _handlePanResponderRequestEnd(e: Object, gestureState: Object) {
        // Should we allow another component to take over this pan?
        return false;
    }

    _handlePanResponderEnd = (e: Object, gestureState: Object) => {
        if (this.props.disabled) {
            return;
        }

        this._setCurrentValue(this._getValue(gestureState));
        this._fireChangeEvent("onSlidingComplete");
    };

    _measureContainer = (x: Object) => {
        this._handleMeasure("containerSize", x);
    };

    _measureTrack = (x: Object) => {
        this._handleMeasure("trackSize", x);
    };

    _measureThumb = (x: Object) => {
        this._handleMeasure("thumbSize", x);
    };

    _handleMeasure = (name: string, x: Object) => {
        const {width, height} = x.nativeEvent.layout;
        const size = {width, height};

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
            ratio *
            (this.state.containerSize.width - this.state.thumbSize.width)
        );
    };

    _getValue = (gestureState: Object) => {
        const length =
            this.state.containerSize.width - this.state.thumbSize.width;
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
                            (ratio *
                                (this.props.maximumValue -
                                    this.props.minimumValue)) /
                                this.props.step
                        ) *
                            this.props.step
                )
            );
        }
        return Math.max(
            this.props.minimumValue,
            Math.min(
                this.props.maximumValue,
                ratio * (this.props.maximumValue - this.props.minimumValue) +
                    this.props.minimumValue
            )
        );
    };

    _getCurrentValue = () => this.state.value.__getValue();

    _setCurrentValue = (value: number) => {
        this.state.value.setValue(value);
    };

    _setCurrentValueAnimated = (value: number) => {
        const animationType = this.props.animationType;
        const animationConfig = Object.assign(
            {},
            DEFAULT_ANIMATION_CONFIGS[animationType],
            this.props.animationConfig,
            {
                toValue: value,
            }
        );

        Animated[animationType](this.state.value, animationConfig).start();
    };

    _fireChangeEvent = event => {
        if (this.props[event]) {
            this.props[event](this._getCurrentValue());
        }
    };

    _getTouchOverflowSize = () => {
        const state = this.state;
        const props = this.props;

        const size = {};
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

    _getTouchOverflowStyle = () => {
        const {width, height} = this._getTouchOverflowSize();

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
            touchOverflowStyle.backgroundColor = "orange";
            touchOverflowStyle.opacity = 0.5;
        }

        return touchOverflowStyle;
    };

    _thumbHitTest = (e: Object) => {
        const nativeEvent = e.nativeEvent;
        const thumbTouchRect = this._getThumbTouchRect();
        return thumbTouchRect.containsPoint(
            nativeEvent.locationX,
            nativeEvent.locationY
        );
    };

    _getThumbTouchRect = () => {
        const state = this.state;
        const props = this.props;
        const touchOverflowSize = this._getTouchOverflowSize();

        return new Rect(
            touchOverflowSize.width / 2 +
                this._getThumbLeft(this._getCurrentValue()) +
                (state.thumbSize.width - props.thumbTouchSize.width) / 2,
            touchOverflowSize.height / 2 +
                (state.containerSize.height - props.thumbTouchSize.height) / 2,
            props.thumbTouchSize.width,
            props.thumbTouchSize.height
        );
    };

    _renderDebugThumbTouchRect = thumbLeft => {
        const thumbTouchRect = this._getThumbTouchRect();
        const positionStyle = {
            left: thumbLeft,
            top: thumbTouchRect.y,
            width: thumbTouchRect.width,
            height: thumbTouchRect.height,
        };

        return (
            <Animated.View
                style={[defaultStyles.debugThumbTouchArea, positionStyle]}
                pointerEvents="none"
            />
        );
    };

    _renderThumbImage = () => {
        const {thumbImage} = this.props;

        if (!thumbImage) return;

        return <Image source={thumbImage} />;
    };
}

const defaultStyles = StyleSheet.create({
    container: {
        height: 40,
        justifyContent: "center",
    },
    track: {
        height: TRACK_SIZE,
        borderRadius: TRACK_SIZE / 2,
    },
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
