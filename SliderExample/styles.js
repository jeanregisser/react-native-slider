/* eslint-disable react-native/no-color-literals */
/* @flow */
import {StyleSheet} from "react-native";

const COLORS = {
    BLACK: "black",
    WHITE: "white",
};

export const styles = StyleSheet.create({
    container: {
        alignItems: "stretch",
        justifyContent: "flex-start",
        margin: 16,
        paddingBottom: 32,
    },
    sliderContainer: {
        paddingVertical: 16,
    },
    titleContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
});

export const iosStyles = StyleSheet.create({
    thumb: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 30 / 2,
        height: 30,
        shadowColor: COLORS.BLACK,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.35,
        shadowRadius: 2,
        width: 30,
    },
    track: {
        borderRadius: 1,
        height: 2,
    },
});

export const componentThumbStyles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "red",
        height: 50,
        justifyContent: "center",
        width: 100,
    },
});

export const customStyles = StyleSheet.create({
    track: {
        borderRadius: 2,
        height: 40,
    },
});

export const customStyles2 = StyleSheet.create({
    thumb: {
        backgroundColor: COLORS.WHITE,
        borderColor: "#30a935",
        borderRadius: 30 / 2,
        borderWidth: 2,
        height: 30,
        width: 30,
    },
    track: {
        borderRadius: 2,
        height: 4,
    },
});

export const customStyles3 = StyleSheet.create({
    thumb: {
        backgroundColor: "#eb6e1b",
        borderRadius: 5,
        height: 30,
        width: 10,
    },
    track: {
        backgroundColor: "#d0d0d0",
        borderRadius: 5,
        height: 10,
    },
});

export const customStyles4 = StyleSheet.create({
    thumb: {
        backgroundColor: "#f8a1d6",
        borderColor: "#a4126e",
        borderRadius: 10,
        borderWidth: 5,
        height: 20,
        shadowColor: COLORS.BLACK,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.35,
        shadowRadius: 2,
        width: 20,
    },
    track: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 4,
        height: 10,
        shadowColor: COLORS.BLACK,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.15,
        shadowRadius: 1,
    },
});

export const customStyles5 = StyleSheet.create({
    thumb: {
        backgroundColor: "#838486",
        borderRadius: 1,
        height: 30,
        width: 20,
    },
    track: {
        backgroundColor: "#d5d8e8",
        borderRadius: 1,
        height: 18,
    },
});

export const customStyles6 = StyleSheet.create({
    thumb: {
        backgroundColor: "#eaeaea",
        borderColor: "#9a9a9a",
        borderRadius: 2,
        borderWidth: 1,
        height: 20,
        width: 20,
    },
    track: {
        backgroundColor: COLORS.WHITE,
        borderColor: "#9a9a9a",
        borderRadius: 2,
        borderWidth: 1,
        height: 14,
    },
});

export const customStyles7 = StyleSheet.create({
    thumb: {
        backgroundColor: "rgba(150, 150, 150, 0.3)",
        borderColor: "rgba(150, 150, 150, 0.6)",
        borderRadius: 15,
        borderWidth: 14,
        height: 30,
        width: 30,
    },
    track: {
        backgroundColor: "#303030",
        height: 1,
    },
});

export const customStyles8 = StyleSheet.create({
    container: {
        height: 30,
    },
    thumb: {
        backgroundColor: "#31a4db",
        borderRadius: 10 / 2,
        height: 10,
        shadowColor: "#31a4db",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 2,
        width: 10,
    },
    track: {
        backgroundColor: "#303030",
        height: 2,
    },
});

export const customStyles9 = StyleSheet.create({
    thumb: {
        height: 30,
        shadowColor: COLORS.BLACK,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.5,
        shadowRadius: 1,
        width: 30,
    },
});

export const aboveThumbStyles = StyleSheet.create({
    image: {
        alignItems: "center",
        height: 54,
        justifyContent: "center",
        resizeMode: "contain",
        width: 72,
    },
});
