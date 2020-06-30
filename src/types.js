/* @flow */
import * as React from "react";
import {
    Animated,
    SpringAnimationConfig,
    TimingAnimationConfig,
} from "react-native";
import type {ViewStyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";

export type ChangeEvent =
    | "onSlidingComplete"
    | "onSlidingStart"
    | "onValueChange";

type Dimensions = {height: number, width: number};

export type SliderProps = {
    animateTransitions: boolean,
    animationConfig: {
        spring?: SpringAnimationConfig,
        timing?: TimingAnimationConfig,
    },
    animationType: "spring" | "timing",
    containerStyle: ViewStyleProp,
    debugTouchArea: boolean,
    disabled: boolean,
    maximumTrackTintColor: string,
    maximumValue: number,
    minimumTrackTintColor: string,
    minimumValue: number,
    onSlidingComplete: (value: number | Array<number>) => void,
    onSlidingStart: (value: number | Array<number>) => void,
    onValueChange: (value: number | Array<number>) => void,
    renderAboveThumbComponent?: (index: number) => React.Node,
    renderThumbComponent: () => React.Node,
    renderTrackMark?: () => React.Node,
    step: number,
    thumbImage: string | number | Array<string | number>,
    thumbStyle: ViewStyleProp,
    thumbTintColor: string,
    thumbTouchSize: Dimensions,
    trackClickable: boolean,
    trackMarks?: Array<number>,
    trackStyle: ViewStyleProp,
    value: number | Array<number>,
};

export type SliderState = {
    allMeasured: boolean,
    containerSize: Dimensions,
    thumbSize: Dimensions,
    trackMarksValues: Array<Animated.Value>,
    values: Array<Animated.Value>,
};
