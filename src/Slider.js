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
    return {
        containsPoint: (nativeX, nativeY) =>
            nativeX >= this.x &&
            nativeY >= this.y &&
            nativeX <= this.x + this.width &&
            nativeY <= this.y + this.height,
        trackDistanceToPoint: nativeX => {
            if (nativeX < this.x) return this.x - nativeX;
            if (nativeX > this.x + this.width)
                return nativeX - (this.x + this.width);
            return 0;
        },
    };
}

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
function normalizePropValue(props: SliderProps): Array<number> {
    const {maximumValue, minimumValue, value} = props;
    const getBetweenValue = (inputValue: number) =>
        Math.max(Math.min(inputValue, maximumValue), minimumValue);
    if (!Array.isArray(value)) {
        return [getBetweenValue(value)];
    }
    return value.map(getBetweenValue).sort((a, b) => a - b);
}

function updateValues(
    values: number | Array<number>,
    newValues: number | Array<number> = values
) {
    if (newValues.length !== values.length) {
        return updateValues(newValues);
    }

    return values.map((value, i) => {
        if (value instanceof Animated.Value) {
            return value.setValue(
                newValues[i] instanceof Animated.Value
                    ? newValues[i].__getValue()
                    : newValues[i]
            );
        }

        if (newValues[i] instanceof Animated.Value) {
            return newValues[i];
        }
        return new Animated.Value(newValues[i]);
    });
}

function indexOfLowest(values: Array<number>): number {
    let lowestIndex = 0;
    values.forEach((value, index, array) => {
        if (value < array[lowestIndex]) lowestIndex = index;
    });
    return lowestIndex;
}

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
            containerSize: {width: 0, height: 0},
            thumbSize: {width: 0, height: 0},
            values: updateValues(normalizePropValue(this.props)),
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
        trackClickable: true,
        value: 0,
    };

    static getDerivedStateFromProps(props: SliderProps, state: SliderState) {
        const newValues = normalizePropValue(props);
        if (newValues.length !== state.values.length) {
            return {values: updateValues(state.values, newValues)};
        }
        return null;
    }

    componentDidUpdate(prevProps: SliderProps) {
        const oldValues = normalizePropValue(prevProps);
        const newValues = normalizePropValue(this.props);
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

    _getRawValues(values: Animated.Value) {
        return values.map(value => value.__getValue());
    }

    _handleStartShouldSetPanResponder = (
        e: PressEvent /* gestureState: GestureState */
    ): boolean =>
        // Should we become active when the user presses down on the thumb?
        this._thumbHitTest(e);

    _handleMoveShouldSetPanResponder(/* e: PressEvent, gestureState: GestureState */): boolean {
        // Should we become active when the user moves a touch over the thumb?
        return false;
    }

    _handlePanResponderGrant = (e: PressEvent, gestureState: GestureState) => {
        const {thumbSize} = this.state;
        const {nativeEvent} = e;
        this._previousLeft = this.props.trackClickable
            ? nativeEvent.locationX - thumbSize.width
            : this._getThumbLeft(this._getCurrentValue(this._activeThumbIndex));
        this._fireChangeEvent("onSlidingStart");
    };

    _handlePanResponderMove = (e: PressEvent, gestureState: GestureState) => {
        if (this.props.disabled) return;
        this._setCurrentValue(
            this._getValue(gestureState),
            this._activeThumbIndex,
            () => {
                this._fireChangeEvent("onValueChange");
            }
        );
    };

    _handlePanResponderRequestEnd = (/* e: PressEvent, gestureState: GestureState */) => {
        // Should we allow another component to take over this pan?
        return false;
    };

    _handlePanResponderEnd = (e: PressEvent, gestureState: GestureState) => {
        if (this.props.disabled) return;
        this._setCurrentValue(
            this._getValue(gestureState),
            this._activeThumbIndex,
            () => {
                if (this.props.trackClickable) {
                    this._fireChangeEvent("onValueChange");
                }
                this._fireChangeEvent("onSlidingComplete");
            }
        );
        this._activeThumbIndex = null;
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
        if (
            currentSize &&
            width === currentSize.width &&
            height === currentSize.height
        ) {
            return;
        }
        this[storeName] = size;

        if (this._containerSize && this._thumbSize) {
            this.setState({
                containerSize: this._containerSize,
                thumbSize: this._thumbSize,
                allMeasured: true,
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
        const {containerSize, thumbSize, values} = this.state;
        const {maximumValue, minimumValue, step} = this.props;
        const length = containerSize.width - thumbSize.width;
        const thumbLeft = this._previousLeft + gestureState.dx;

        const nonRtlRatio = thumbLeft / length;
        const ratio = I18nManager.isRTL ? 1 - nonRtlRatio : nonRtlRatio;
        let minValue = minimumValue;
        let maxValue = maximumValue;
        const rawValues = this._getRawValues(values);
        const buffer = !!step ? step : 0.1;
        if (values.length === 2) {
            if (this._activeThumbIndex === 1) {
                minValue = rawValues[0] + buffer;
            } else {
                maxValue = rawValues[1] - buffer;
            }
        }
        if (step) {
            return Math.max(
                minValue,
                Math.min(
                    maxValue,
                    minimumValue +
                        Math.floor(
                            (ratio * (maximumValue - minimumValue)) / step
                        ) *
                            step
                )
            );
        }
        return Math.max(
            minValue,
            Math.min(
                maxValue,
                ratio * (maximumValue - minimumValue) + minimumValue
            )
        );
    };

    _getCurrentValue = (thumbIndex: number = 0) =>
        this.state.values[thumbIndex].__getValue();

    _setCurrentValue = (
        value: number,
        thumbIndex: number = 0,
        callback?: () => void
    ) => {
        this.setState((prevState: SliderState) => {
            const newValues = [...prevState.values];
            newValues[thumbIndex].setValue(value);
            return {
                values: newValues,
            };
        }, callback);
    };

    _setCurrentValueAnimated = (value: number, thumbIndex: number = 0) => {
        const {animationType} = this.props;
        const animationConfig = Object.assign(
            {},
            DEFAULT_ANIMATION_CONFIGS[animationType],
            this.props.animationConfig,
            {
                toValue: value,
            }
        );

        Animated[animationType](
            this.state.values[thumbIndex],
            animationConfig
        ).start();
    };

    _fireChangeEvent = (changeEventType: ChangeEvent) => {
        if (this.props[changeEventType]) {
            this.props[changeEventType](this._getRawValues(this.state.values));
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
        const {trackClickable} = this.props;
        const {values} = this.state;
        const hitThumb = values.find((_, i) => {
            const thumbTouchRect = this._getThumbTouchRect(i);
            const containsPoint = thumbTouchRect.containsPoint(
                nativeEvent.locationX,
                nativeEvent.locationY
            );
            if (containsPoint) {
                this._activeThumbIndex = i;
            }

            return containsPoint;
        });
        if (!!hitThumb) {
            return true;
        }
        if (trackClickable) {
            // set the active thumb index
            if (values.length === 1) {
                this._activeThumbIndex = 0;
            } else {
                // we will find the closest thumb and that will be the active thumb
                const thumbDistances = values.map((value, index) => {
                    const thumbTouchRect = this._getThumbTouchRect(index);
                    return thumbTouchRect.trackDistanceToPoint(
                        nativeEvent.locationX
                    );
                });
                this._activeThumbIndex = indexOfLowest(thumbDistances);
            }
            return true;
        }
        return false;
    };

    _getThumbTouchRect = (thumbIndex: number = 0) => {
        const {containerSize, thumbSize} = this.state;
        const {thumbTouchSize} = this.props;
        const touchOverflowSize = this._getTouchOverflowSize();
        return new Rect(
            touchOverflowSize.width / 2 +
                this._getThumbLeft(this._getCurrentValue(thumbIndex)) +
                (thumbSize.width - thumbTouchSize.width) / 2,
            touchOverflowSize.height / 2 +
                (containerSize.height - thumbTouchSize.height) / 2,
            thumbTouchSize.width,
            thumbTouchSize.height
        );
    };

    _renderDebugThumbTouchRect = (thumbLeft: number, index: number) => {
        const thumbTouchRect = this._getThumbTouchRect();
        const positionStyle = {
            left: thumbLeft,
            top: thumbTouchRect.y,
            width: thumbTouchRect.width,
            height: thumbTouchRect.height,
        };

        return (
            <Animated.View
                key={`debug-thumb-${index}`}
                pointerEvents="none"
                style={[defaultStyles.debugThumbTouchArea, positionStyle]}
            />
        );
    };

    _renderThumbImage = (thumbIndex: number = 0) => {
        const {thumbImage} = this.props;

        if (!thumbImage) return null;

        return (
            <Image
                source={
                    Array.isArray(thumbImage)
                        ? thumbImage[thumbIndex]
                        : thumbImage
                }
            />
        );
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
            renderAboveThumbComponent,
            renderThumbComponent,
            thumbImage,
            thumbStyle,
            thumbTintColor,
            thumbTouchSize,
            trackStyle,
            ...other
        } = this.props;
        const {allMeasured, containerSize, thumbSize, values} = this.state;
        const interpolatedThumbValues = values.map(v =>
            v.interpolate({
                inputRange: [minimumValue, maximumValue],
                outputRange: I18nManager.isRTL
                    ? [0, -(containerSize.width - thumbSize.width)]
                    : [0, containerSize.width - thumbSize.width],
            })
        );

        const valueVisibleStyle = {};
        if (!allMeasured) {
            valueVisibleStyle.opacity = 0;
        }
        const interpolatedRawValues = this._getRawValues(
            interpolatedThumbValues
        );
        const minThumbValue = new Animated.Value(
            Math.min(...interpolatedRawValues)
        );
        const maxThumbValue = new Animated.Value(
            Math.max(...interpolatedRawValues)
        );
        const minimumTrackStyle = {
            position: "absolute",
            left:
                interpolatedThumbValues.length === 1
                    ? new Animated.Value(0)
                    : Animated.add(minThumbValue, thumbSize.width / 2),
            width:
                interpolatedThumbValues.length === 1
                    ? Animated.add(
                          interpolatedThumbValues[0],
                          thumbSize.width / 2
                      )
                    : Animated.add(
                          Animated.multiply(minThumbValue, -1),
                          maxThumbValue
                      ),
            backgroundColor: minimumTrackTintColor,
            ...valueVisibleStyle,
        };

        const touchOverflowStyle = this._getTouchOverflowStyle();

        return (
            <>
                {renderAboveThumbComponent && (
                    <View style={{flexDirection: "row"}}>
                        {interpolatedThumbValues.map((value, i) => (
                            <Animated.View
                                renderToHardwareTextureAndroid
                                key={`slider-above-thumb-${i}`}
                                style={[
                                    defaultStyles.renderThumbComponent,
                                    {
                                        bottom: 0,
                                        transform: [
                                            {translateX: value},
                                            {translateY: 0},
                                        ],
                                        ...valueVisibleStyle,
                                    },
                                ]}
                            >
                                {renderAboveThumbComponent(i)}
                            </Animated.View>
                        ))}
                    </View>
                )}
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
                    <Animated.View
                        renderToHardwareTextureAndroid
                        style={[
                            defaultStyles.track,
                            trackStyle,
                            minimumTrackStyle,
                        ]}
                    />
                    {interpolatedThumbValues.map((value, i) => (
                        <Animated.View
                            renderToHardwareTextureAndroid
                            key={`slider-thumb-${i}`}
                            style={[
                                !!renderThumbComponent
                                    ? defaultStyles.renderThumbComponent
                                    : defaultStyles.thumb,
                                !!renderThumbComponent
                                    ? {}
                                    : {
                                          backgroundColor: thumbTintColor,
                                          ...thumbStyle,
                                      },
                                {
                                    transform: [
                                        {translateX: value},
                                        {translateY: 0},
                                    ],
                                    ...valueVisibleStyle,
                                },
                            ]}
                            onLayout={this._measureThumb}
                        >
                            {!!renderThumbComponent
                                ? renderThumbComponent()
                                : this._renderThumbImage(i)}
                        </Animated.View>
                    ))}
                    <View
                        renderToHardwareTextureAndroid
                        style={[defaultStyles.touchArea, touchOverflowStyle]}
                        {...this._panResponder.panHandlers}
                    >
                        {!!debugTouchArea &&
                            interpolatedThumbValues.map((value, i) =>
                                this._renderDebugThumbTouchRect(value, i)
                            )}
                    </View>
                </View>
            </>
        );
    }
}
