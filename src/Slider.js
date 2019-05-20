/* @flow */
import React, {PureComponent} from "react";
import {
    Animated,
    Image,
    PanResponder,
    View,
    Easing,
    I18nManager,
} from "react-native";

// styles
import {defaultStyles} from "./styles";

// types
import type {GestureState, PressEvent, ViewLayoutEvent} from "react-native";
import type {ChangeEvent, SliderProps, SliderState} from "./types";

function Rect(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Rect.prototype.containsPoint = (x, y) =>
    x >= this.x &&
    y >= this.y &&
    x <= this.x + this.width &&
    y <= this.y + this.height;

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

export class Slider extends PureComponent<SliderProps, SliderState> {
    constructor(props: SliderProps) {
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
        this.state = {
            allMeasured: false,
            aboveThumbComponentSize: {width: 0, height: 0},
            containerSize: {width: 0, height: 0},
            panning: false,
            thumbSize: {width: 0, height: 0},
            value: new Animated.Value(this.props.value),
        };
    }

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
        trackClickable: false,
        value: 0,
    };

    componentDidUpdate(prevProps: SliderProps) {
        const oldValue = prevProps.value;
        const newValue = this.props.value;

        if (newValue !== oldValue) {
            if (this.props.animateTransitions) {
                this._startAnimatedValue(newValue);
            } else {
                this._setAnimatedValue(newValue);
            }
        }
    }

    _handleStartShouldSetPanResponder = (
        e: PressEvent /* gestureState: GestureState */
    ): boolean =>
        // Should we become active when the user presses down on the thumb?
        this.props.trackClickable || this._thumbHitTest(e);

    _handleMoveShouldSetPanResponder(/* e: PressEvent, gestureState: GestureState */): boolean {
        // Should we become active when the user moves a touch over the thumb?
        return false;
    }

    _handlePanResponderGrant = (e: PressEvent, gestureState: GestureState) => {
        const {thumbSize} = this.state;
        this._previousLeft = this.props.trackClickable
            ? gestureState.x0 - thumbSize.width
            : this._getThumbLeft(this._getAnimatedValue());
        this._fireChangeEvent("onSlidingStart");
    };

    _handlePanResponderMove = (e: PressEvent, gestureState: GestureState) => {
        if (this.props.disabled) return;
        this._setAnimatedValue(this._getValue(gestureState));
        this._fireChangeEvent("onValueChange");
        this.setState({panning: true});
    };

    _handlePanResponderRequestEnd = (/* e: PressEvent, gestureState: GestureState */) => {
        // Should we allow another component to take over this pan?
        return false;
    };

    _handlePanResponderEnd = (e: PressEvent, gestureState: GestureState) => {
        if (this.props.disabled) return;
        this._setAnimatedValue(this._getValue(gestureState));
        this._fireChangeEvent("onSlidingComplete");
        this.setState({panning: false});
    };

    _measureAboveThumbComponent = (e: ViewLayoutEvent) => {
        this._handleMeasure("aboveThumbComponentSize", e);
    };

    _measureContainer = (e: ViewLayoutEvent) => {
        this._handleMeasure("containerSize", e);
    };

    _measureTrack = (e: ViewLayoutEvent) => {
        this._handleMeasure("trackSize", e);
    };

    _measureThumb = (e: ViewLayoutEvent) => {
        this._handleMeasure("thumbSize", e);
    };

    _handleMeasure = (name: string, e: ViewLayoutEvent) => {
        const {width, height} = e.nativeEvent.layout;
        const size = {width, height};

        const storeName = `_${name}`;
        const currentSize = this[storeName];
        console.log(name, size, currentSize);
        if (
            currentSize &&
            width === currentSize.width &&
            height === currentSize.height
        ) {
            return;
        }
        this[storeName] = size;
        const state = {
            aboveThumbComponentSize: this._aboveThumbComponentSize,
            containerSize: this._containerSize,
            thumbSize: this._thumbSize,
            allMeasured: true,
        };
        if (
            !this._aboveThumbComponentSize &&
            this._containerSize &&
            this._thumbSize
        ) {
            this.setState(state);
        }
        if (
            this._aboveThumbComponentSize &&
            this._containerSize &&
            this._thumbSize
        ) {
            this.setState({
                ...state,
                aboveThumbComponentSize: this._aboveThumbComponentSize,
            });
        }
    };

    _getRatio = (value: number) => {
        const {maximumValue, minimumValue} = this.props;
        return (value - minimumValue) / (maximumValue - minimumValue);
    };

    _getThumbLeft = (value: number) => {
        const {containerSize, thumbSize} = this.state;
        const standardRatio = this._getRatio(value);
        const ratio = I18nManager.isRTL ? 1 - standardRatio : standardRatio;
        return ratio * (containerSize.width - thumbSize.width);
    };

    _getValue = (gestureState: GestureState) => {
        const {containerSize, thumbSize} = this.state;
        const {maximumValue, minimumValue, step} = this.props;
        const length = containerSize.width - thumbSize.width;
        const thumbLeft = this._previousLeft + gestureState.dx;

        const nonRtlRatio = thumbLeft / length;
        const ratio = I18nManager.isRTL ? 1 - nonRtlRatio : nonRtlRatio;

        if (step) {
            return Math.max(
                minimumValue,
                Math.min(
                    maximumValue,
                    minimumValue +
                        Math.floor(
                            (ratio * (maximumValue - minimumValue)) / step
                        ) *
                            step
                )
            );
        }
        return Math.max(
            minimumValue,
            Math.min(
                maximumValue,
                ratio * (maximumValue - minimumValue) + minimumValue
            )
        );
    };

    _getAnimatedValue = () => this.state.value.__getValue();

    _setAnimatedValue = (value: number) => this.state.value.setValue(value);

    _startAnimatedValue = (value: number) => {
        const {animationType} = this.props;
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

    _fireChangeEvent = (changeEventType: ChangeEvent) => {
        if (this.props[changeEventType]) {
            this.props[changeEventType](this._getAnimatedValue());
        }
    };

    _getTouchOverflowSize = () => {
        const {allMeasured, containerSize, thumbSize} = this.state;
        const {thumbTouchSize} = this.props;

        const size = {};
        if (allMeasured) {
            size.width = Math.max(0, thumbTouchSize.width - thumbSize.width);
            size.height = Math.max(
                0,
                thumbTouchSize.height - containerSize.height
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

    _thumbHitTest = (e: PressEvent) => {
        const {nativeEvent} = e;
        const thumbTouchRect = this._getThumbTouchRect();
        return thumbTouchRect.containsPoint(
            nativeEvent.locationX,
            nativeEvent.locationY
        );
    };

    _getThumbTouchRect = () => {
        const {containerSize, thumbSize} = this.state;
        const {thumbTouchSize} = this.props;
        const touchOverflowSize = this._getTouchOverflowSize();

        return new Rect(
            touchOverflowSize.width / 2 +
                this._getThumbLeft(this._getAnimatedValue()) +
                (thumbSize.width - thumbTouchSize.width) / 2,
            touchOverflowSize.height / 2 +
                (containerSize.height - thumbTouchSize.height) / 2,
            thumbTouchSize.width,
            thumbTouchSize.height
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
                pointerEvents="none"
                style={[defaultStyles.debugThumbTouchArea, positionStyle]}
            />
        );
    };

    _renderThumbImage = () => {
        const {thumbImage} = this.props;

        if (!thumbImage) return null;

        return <Image source={thumbImage} />;
    };

    render() {
        const {
            animateTransitions,
            animationType,
            containerStyle,
            debugTouchArea,
            maximumTrackTintColor,
            maximumValue,
            minimumTrackTintColor,
            minimumValue,
            onValueChange,
            renderAboveThumbComponent,
            renderThumbComponent,
            thumbImage,
            thumbStyle,
            thumbTintColor,
            thumbTouchSize,
            trackStyle,
            ...other
        } = this.props;
        const {
            allMeasured,
            aboveThumbComponentSize,
            containerSize,
            panning,
            thumbSize,
            value,
        } = this.state;
        const thumbLeft = value.interpolate({
            inputRange: [minimumValue, maximumValue],
            outputRange: I18nManager.isRTL
                ? [0, -(containerSize.width - thumbSize.width)]
                : [0, containerSize.width - thumbSize.width],
        });
        const minimumTrackWidth = value.interpolate({
            inputRange: [minimumValue, maximumValue],
            outputRange: [0, containerSize.width - thumbSize.width],
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
                style={[defaultStyles.container, containerStyle]}
                onLayout={this._measureContainer}
            >
                <View
                    renderToHardwareTextureAndroid
                    style={[
                        defaultStyles.track,
                        {backgroundColor: maximumTrackTintColor},
                        trackStyle,
                    ]}
                    onLayout={this._measureTrack}
                />
                {panning && (
                    <Animated.View
                        renderToHardwareTextureAndroid
                        style={[
                            defaultStyles.renderThumbComponent,
                            {
                                transform: [
                                    {
                                        translateX: aboveThumbComponentSize
                                            ? thumbSize.width / 2 +
                                              thumbLeft.__getValue() -
                                              aboveThumbComponentSize.width / 2
                                            : 0,
                                    },
                                    {
                                        translateY: -thumbSize.height * 2,
                                    },
                                ],
                                ...valueVisibleStyle,
                            },
                        ]}
                        onLayout={this._measureAboveThumbComponent}
                    >
                        {!!renderAboveThumbComponent &&
                            renderAboveThumbComponent()}
                    </Animated.View>
                )}
                <Animated.View
                    renderToHardwareTextureAndroid
                    style={[defaultStyles.track, trackStyle, minimumTrackStyle]}
                />
                {!renderThumbComponent && (
                    <Animated.View
                        renderToHardwareTextureAndroid
                        style={[
                            defaultStyles.thumb,
                            {backgroundColor: thumbTintColor},
                            thumbStyle,
                            {
                                transform: [
                                    {translateX: thumbLeft},
                                    {translateY: 0},
                                ],
                                ...valueVisibleStyle,
                            },
                        ]}
                        onLayout={this._measureThumb}
                    >
                        {this._renderThumbImage()}
                    </Animated.View>
                )}
                {!!renderThumbComponent && (
                    <Animated.View
                        renderToHardwareTextureAndroid
                        style={[
                            defaultStyles.renderThumbComponent,
                            {
                                transform: [
                                    {translateX: thumbLeft},
                                    {translateY: 0},
                                ],
                                ...valueVisibleStyle,
                            },
                        ]}
                        onLayout={this._measureThumb}
                    >
                        {renderThumbComponent()}
                    </Animated.View>
                )}
                <View
                    renderToHardwareTextureAndroid
                    style={[defaultStyles.touchArea, touchOverflowStyle]}
                    {...this._panResponder.panHandlers}
                >
                    {!!debugTouchArea &&
                        this._renderDebugThumbTouchRect(minimumTrackWidth)}
                </View>
            </View>
        );
    }
}
