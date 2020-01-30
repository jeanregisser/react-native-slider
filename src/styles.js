/* @flow */
import {StyleSheet} from "react-native";

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;
const GREEN = "green";
const TRANSPARENT = "transparent";

export const defaultStyles = StyleSheet.create({
    container: {
        height: 40,
        justifyContent: "center",
    },
    debugThumbTouchArea: {
        backgroundColor: GREEN,
        opacity: 0.5,
        position: "absolute",
    },
    renderThumbComponent: {
        position: "absolute",
    },
    thumb: {
        borderRadius: THUMB_SIZE / 2,
        height: THUMB_SIZE,
        position: "absolute",
        width: THUMB_SIZE,
    },
    touchArea: {
        backgroundColor: TRANSPARENT,
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    track: {
        borderRadius: TRACK_SIZE / 2,
        height: TRACK_SIZE,
    },
});
