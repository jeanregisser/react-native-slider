/* @flow */
import {SpringAnimationConfig, TimingAnimationConfig} from "react-native";
import type {ViewStyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";

type Dimensions = {height: number, width: number};

export type SliderProps = {
    /**
     * Set to true to animate values with default 'timing' animation type
     */
    animateTransitions: boolean,
    /**
     * Used to configure the animation parameters.  These are the same parameters in the Animated library.
     */
    animationConfig: {
        spring?: SpringAnimationConfig,
        timing?: TimingAnimationConfig,
    },
    /**
     * Custom Animation type. 'spring' or 'timing'.
     */
    animationType: "spring" | "timing",
    /**
     * Set this to true to visually see the thumb touch rect in green.
     */
    debugTouchArea: boolean,
    /**
     * If true the user won't be able to move the slider.
     * Default value is false.
     */
    disabled: boolean,
    /**
     * The color used for the track to the right of the button. Overrides the
     * default blue gradient image.
     */
    maximumTrackTintColor: string,
    /**
     * Initial maximum value of the slider. Default value is 1.
     */
    maximumValue: number,
    /**
     * The color used for the track to the left of the button. Overrides the
     * default blue gradient image.
     */
    minimumTrackTintColor: string,
    /**
     * Initial minimum value of the slider. Default value is 0.
     */
    minimumValue: number,
    /**
     * Callback called when the user finishes changing the value (e.g. when
     * the slider is released).
     */
    onSlidingComplete: (value: number) => void,
    /**
     * Callback called when the user starts changing the value (e.g. when
     * the slider is pressed).
     */
    onSlidingStart: (value: number) => void,
    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange: (value: number) => void,
    /**
     * Step value of the slider. The value should be between 0 and
     * (maximumValue - minimumValue). Default value is 0.
     */
    step: number,
    /**
     * The style applied to the slider container.
     */
    style: ViewStyleProp,
    /**
     * Sets an image for the thumb.
     */
    thumbImage: string | number,
    /**
     * The style applied to the thumb.
     */
    thumbStyle: ViewStyleProp,
    /**
     * The color used for the thumb.
     */
    thumbTintColor: string,
    /**
     * The size of the touch area that allows moving the thumb.
     * The touch area has the same center has the visible thumb.
     * This allows to have a visually small thumb while still allowing the user
     * to move it easily.
     * The default is {width: 40, height: 40}.
     */
    thumbTouchSize: Dimensions,
    /**
     * The style applied to the track.
     */
    trackStyle: ViewStyleProp,
    /**
     * Initial value of the slider. The value should be between minimumValue
     * and maximumValue, which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * *This is not a controlled component*, e.g. if you don't update
     * the value, the component won't be reset to its inital value.
     */
    value: number,
};

export type SliderState = {
    allMeasured: boolean,
    containerSize: Dimensions,
    thumbSize: Dimensions,
    trackSize: Dimensions,
    value: number,
};
