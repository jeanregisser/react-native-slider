declare module 'react-native-slider' {
  import { ComponentClass, PureComponent } from 'react'

  import {
    ImageSourcePropType,
    SpringAnimationConfig,
    StyleProp,
    TimingAnimationConfig,
    ViewStyle,
  } from 'react-native'

  interface SliderProps {
    animateTransitions?: boolean
    animationConfig?: SpringAnimationConfig | TimingAnimationConfig,
    animationType?: 'spring' | 'timing'
    containerStyle?: StyleProp<ViewStyle>
    debugTouchArea?: boolean
    disabled: boolean
    maximumTrackTintColor?: string
    maximumValue?: number
    minimumTrackTintColor?: string
    minimumValue?: number
    onSlidingComplete?: (value: number) => void
    onSlidingStart?: (value: number) => void
    onValueChange: (value: number) => void
    renderAboveThumbComponent: () => React.Node,
    renderThumbComponent: () => React.Node
    step?: number
    thumbImage?: ImageSourcePropType
    thumbStyle?: StyleProp<ViewStyle>
    thumbTintColor?: string
    thumbTouchSize?: { width: number; height: number }
    trackClickable?: boolean,
    trackStyle?: StyleProp<ViewStyle>
    value?: number
  }

  const Slider: ComponentClass<SliderProps>

  export default Slider
}
