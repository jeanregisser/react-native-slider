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
    contianerStyle: ViewStyleProp,
    debugTouchArea: boolean,
    disabled: boolean,
    maximumTrackTintColor: string,
    maximumValue: number,
    minimumTrackTintColor: string,
    minimumValue: number,
    onSlidingComplete: (value: number) => void,
    onSlidingStart: (value: number) => void,
    onValueChange: (value: number) => void,
    renderThumbComponent: () => React.Node,
    step: number,
    thumbImage: string | number,
    thumbStyle: ViewStyleProp,
    thumbTintColor: string,
    thumbTouchSize: Dimensions,
    trackClickable: boolean,
    trackStyle: ViewStyleProp,
    value: number,
};

export type SliderState = {
    allMeasured: boolean,
    containerSize: Dimensions,
    thumbSize: Dimensions,
    value: Animated.Value,
};
