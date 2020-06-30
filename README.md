# @miblanchard/react-native-slider

[![npm version](https://img.shields.io/npm/v/@miblanchard/react-native-slider.svg?style=flat-square)](https://npmjs.org/package/@miblanchard/react-native-slider "View this project on npm")
[![npm downloads](http://img.shields.io/npm/dm/@miblanchard/react-native-slider.svg?style=flat-square)](https://npmjs.org/package/@miblanchard/react-native-slider "View this project on npm")
[![npm licence](http://img.shields.io/npm/l/@miblanchard/react-native-slider.svg?style=flat-square)](https://npmjs.org/package/@miblanchard/react-native-slider "View this project on npm")
[![Platform](https://img.shields.io/badge/platform-ios--android--web-red)](https://npmjs.org/package/@miblanchard/react-native-slider "View this project on npm")

A pure JavaScript `<Slider>` component for react-native. This is still very much a work
in progress, ideas and contributions are very welcome.

<img src="https://raw.githubusercontent.com/miblanchard/react-native-slider/master/Screenshots/basic@2x.png" width="375">
<img src="https://raw.githubusercontent.com/miblanchard/react-native-slider/master/Screenshots/basic_android_xxhdpi.png" width="360">

It is a drop-in replacement for [Slider](http://facebook.github.io/react-native/docs/slider.html).

## Install

```shell
npm i --save @miblanchard/react-native-slider
```

or

```shell
yarn add @miblanchard/react-native-slider
```

**Note:** I try to maintain backward compatibility of this component with previous versions of React Native, but due to the nature of the platform, and the existence of breaking changes between releases, it is possible that you need to use a specific version of this component to support the exact version of React Native you are using. See the following table:

| React Native version(s) | Supporting react-native-slider version(s) |
| ----------------------- | ----------------------------------------- |
| <0.25.0                 | <0.7.0                                    |
| v0.25.x                 | v0.7.x                                    |
| v0.26.0+                | v0.8.x                                    |
| v0.43.0+                | v0.10.x                                   |
| v0.44.0+                | v0.11.x                                   |
| v0.59.0+                | v1.0.x                                    |

## Usage

```jsx
import React from "react";
import { Slider } from "@miblanchard/react-native-slider";
import { AppRegistry, StyleSheet, View, Text } from "react-native";

class SliderExample extends React.Component {
  state = {
    value: 0.2
  };

  render() {
    return (
      <View style={styles.container}>
        <Slider
          value={this.state.value}
          onValueChange={value => this.setState({ value })}
        />
        <Text>
          Value: {this.state.value}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    alignItems: "stretch",
    justifyContent: "center"
  }
});

AppRegistry.registerComponent("SliderExample", () => SliderExample);
```

Try this example [live on Expo Snack](https://snack.expo.io/HkbAqpbwb).

## Props

| Prop                          | Type                                                                    | Optional | Default                   | Description                                                                                                                                                                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------- | -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| animateTransitions            | bool                                                                    | Yes      | false                     | Set to true if you want to use the default 'spring' animation                                                                                                                                                                                                                                                    |
| animationConfig               | object                                                                  | Yes      | undefined                 | Used to configure the animation parameters.  These are the same parameters in the [Animated library](https://facebook.github.io/react-native/docs/animations.html).                                                                                                                                              |
| animationType                 | string                                                                  | Yes      | 'spring \| 'timing'       | Set to 'spring' or 'timing' to use one of those two types of animations with the default [animation properties](https://facebook.github.io/react-native/docs/animations.html).                                                                                                                                   |
| containerStyle                | [style](http://facebook.github.io/react-native/docs/view.html#style)    | Yes      |                           | The style applied to the container view around everything                                                                                                                                                                                                                                                        |
| debugTouchArea                | bool                                                                    | Yes      | false                     | Set this to true to visually see the thumb touch rect in green.                                                                                                                                                                                                                                                  |
| disabled                      | bool                                                                    | Yes      | false                     | If true the user won't be able to move the slider                                                                                                                                                                                                                                                                |
| maximumTrackTintColor         | string                                                                  | Yes      | '#b3b3b3'                 | The color used for the track to the right of the button                                                                                                                                                                                                                                                          |
| maximumValue                  | number                                                                  | Yes      | 1                         | Initial maximum value of the slider                                                                                                                                                                                                                                                                              |
| minimumTrackTintColor         | string                                                                  | Yes      | '#3f3f3f'                 | The color used for the track to the left of the button                                                                                                                                                                                                                                                           |
| minimumValue                  | number                                                                  | Yes      | 0                         | Initial minimum value of the slider                                                                                                                                                                                                                                                                              |
| onSlidingComplete             | function                                                                | Yes      |                           | Callback called when the user finishes changing the value (e.g. when the slider is released)                                                                                                                                                                                                                     |
| onSlidingStart                | function                                                                | Yes      |                           | Callback called when the user starts changing the value (e.g. when the slider is pressed)                                                                                                                                                                                                                        |
| onValueChange                 | function                                                                | Yes      |                           | Callback continuously called while the user is dragging the slider                                                                                                                                                                                                                                               |
| renderAboveThumbComponent     | function                                                                | Yes      | null                      | Function which returns a custom Component of your liking to be rendered above the thumb and accepts an index of a thumb starting from 0.                                                                                                                                                                         |
| renderThumbComponent          | function                                                                | Yes      | null                      | Function which returns a custom Component of your liking to be rendered within the thumb.                                                                                                                                                                                                                        |
| renderTrackMark               | function                                                                | Yes      | null                      | Function which returns a custom Component of your liking to be rendered on top of the slider truck at the values provided by `trackMarks` property.                                                                                                                                                              |
| step                          | number                                                                  | Yes      | 0                         | Step value of the slider. The value should be between 0 and maximumValue - minimumValue)                                                                                                                                                                                                                         |
| thumbImage                    | [source](http://facebook.github.io/react-native/docs/image.html#source) | Yes      |                           | Sets an image for the thumb.                                                                                                                                                                                                                                                                                     |
| thumbStyle                    | [style](http://facebook.github.io/react-native/docs/view.html#style)    | Yes      |                           | The style applied to the thumb                                                                                                                                                                                                                                                                                   |
| thumbTintColor                | string                                                                  | Yes      | '#343434'                 | The color used for the thumb                                                                                                                                                                                                                                                                                     |
| thumbTouchSize                | object                                                                  | Yes      | `{width: 40, height: 40}` | The size of the touch area that allows moving the thumb. The touch area has the same center as the visible thumb. This allows to have a visually small thumb while still allowing the user to move it easily.                                                                                                    |
| trackClickable                | bool                                                                    | Yes      | false                     | If true the user will be able to click anywhere on the track to set the value to that position.                                                                                                                                                                                                                  |
| trackMarks                    | Array                                                                   | Yes      |                           | The value should be an array of numbers between minimumValue and maximumValue. In order to render a mark on top of the slider track at provided numbers `renderTrackMark` property should also be provided.                                                                                                      |
| trackStyle                    | [style](http://facebook.github.io/react-native/docs/view.html#style)    | Yes      |                           | The style applied to the track                                                                                                                                                                                                                                                                                   |
| value                         | number or Array                                                         | Yes      | 0                         | Initial value of the slider. The value should be a number or array of numbers between minimumValue and maximumValue, which default to 0 and 1 respectively. Default value is 0.  *This is not a controlled component*, e.g. if you don't update  the value, the component won't be reset to its inital value.    |

---

## **MIT Licensed**
