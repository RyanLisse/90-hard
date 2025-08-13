import { Icon } from '@green-stack/components/Icon';
import { useFocusedPress } from '@green-stack/hooks/useFocusedPress';
import { schema, z } from '@green-stack/schemas';
import { type ElementRef, forwardRef, useEffect, useState } from 'react';
import type {
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { cn, getThemeColor, Pressable, View } from '../components/styled';
import { TextInput } from './TextInput.styled';

/* --- Schema ---------------------------------------------------------------------------------- */

export const NumberStepperProps = schema('NumberStepperProps', {
  value: z.number().default(0),
  min: z.number().default(0),
  max: z.number().optional(),
  step: z.number().default(1),
  placeholder: z.string().optional().example('Enter number...'),
  disabled: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  hasError: z.boolean().default(false),
  className: z.string().optional(),
  pressableClassName: z.string().optional(),
  textInputClassName: z.string().optional(),
  placeholderClassName: z.string().optional(),
  placeholderTextColor: z.string().optional(),
});

export type NumberStepperProps = z.input<typeof NumberStepperProps> & {
  onChange: (value: number) => void;
};

/* --- useNumberStepper() ---------------------------------------------------------------------- */

export const useNumberStepper = (rawProps: NumberStepperProps) => {
  // Props
  const props = NumberStepperProps.applyDefaults(rawProps);
  const { min, max, step, disabled, hasError, onChange, ...restProps } = props;

  // State
  const [value, setValue] = useState(props.value);

  // Helpers
  const constrainValue = (inputValue: number) =>
    Math.min(Math.max(inputValue, min), max || Number.POSITIVE_INFINITY);

  // Vars
  const numberValue = constrainValue(value);

  // Flags
  const hasMinValue = typeof rawProps.min !== 'undefined';
  const hasMaxValue = typeof rawProps.max !== 'undefined';
  const hasReachedMin = hasMinValue && numberValue === min;
  const hasReachedMax = hasMaxValue && numberValue === max;
  const isDecrementDisabled = disabled || hasReachedMin;
  const isIncrementDisabled = disabled || hasReachedMax;

  // -- Handlers --

  const onIncrement = () => setValue(constrainValue(numberValue + step));

  const onDecrement = () => setValue(constrainValue(numberValue - step));

  const onKeyPress = ({
    nativeEvent,
  }: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (nativeEvent.key === 'ArrowUp') {
      return onIncrement();
    }
    if (nativeEvent.key === 'ArrowDown') {
      return onDecrement();
    }
  };

  const stepperButtonKeyhandlerProps = useFocusedPress(
    ['ArrowUp', 'ArrowDown'],
    (key) => {
      onKeyPress({
        nativeEvent: { key },
      } as NativeSyntheticEvent<TextInputKeyPressEventData>);
    }
  );

  const onChangeText = (newValue = '') => {
    if (disabled) {
      return;
    }
    // Strip non-numeric characters
    const strippedValue = newValue.replace(/[^0-9]/g, '');
    // If empty, show placeholder
    if (!strippedValue) {
      setValue(undefined as unknown as number);
    }
    // Convert to number
    const newNumberValue = +strippedValue;
    // @ts-expect-error
    setValue(newNumberValue);
  };

  // -- Effects --

  useEffect(() => {
    if (value) {
      onChange(value);
    }
  }, [value, onChange]);

  useEffect(() => {
    if (props.value !== value) {
      setValue(props.value);
    }
  }, [props.value, value]);

  // -- Resources --

  return {
    ...restProps,
    rawProps,
    restProps,
    numberValue,
    value,
    setValue,
    min,
    max,
    step,
    disabled,
    hasError,
    isDecrementDisabled,
    isIncrementDisabled,
    constrainValue,
    onIncrement,
    onDecrement,
    onKeyPress,
    stepperButtonKeyhandlerProps,
    onChangeText,
  };
};

/* --- <NumberStepper/> ------------------------------------------------------------------------ */

export const NumberStepper = forwardRef<
  ElementRef<typeof TextInput>,
  NumberStepperProps
>((rawProps, ref) => {
  // Hooks
  const stepper = useNumberStepper(rawProps);

  // -- Render --

  return (
    <View
      className={cn(
        'h-10 native:h-12',
        'web:flex web:w-full',
        'web:max-w-[200px]',
        stepper.className
      )}
    >
      <Pressable
        className={cn(
          'absolute top-0 left-0 z-10 select-none items-center justify-center',
          'h-10 native:h-12 native:w-12 w-10',
          'border-r border-r-input',
          stepper.isDecrementDisabled && 'web:cursor-not-allowed opacity-50',
          stepper.hasError && 'border-r-danger',
          stepper.pressableClassName
        )}
        {...stepper.stepperButtonKeyhandlerProps}
        disabled={stepper.isDecrementDisabled}
        hitSlop={10}
        onPress={stepper.onDecrement}
      >
        <Icon
          color={getThemeColor('--primary')}
          name="RemoveFilled"
          size={20}
        />
      </Pressable>
      <TextInput
        inputMode="numeric"
        ref={ref}
        {...stepper.restProps}
        className={cn(
          'text-center',
          'native:px-12 px-10',
          'web:max-w-[200px]',
          'native:min-w-[130]',
          stepper.disabled && 'cursor-not-allowed border-muted text-muted',
          stepper.textInputClassName
        )}
        disabled={stepper.disabled}
        hasError={stepper.hasError}
        onChangeText={stepper.onChangeText}
        onKeyPress={stepper.onKeyPress}
        value={stepper.value ? `${stepper.value}` : ''}
      />
      <Pressable
        className={cn(
          'absolute top-0 right-0 z-10 select-none items-center justify-center',
          'h-10 native:h-12 native:w-12 w-10',
          'border-l border-l-input',
          stepper.isIncrementDisabled && 'web:cursor-not-allowed opacity-50',
          stepper.hasError && 'border-l-danger',
          stepper.pressableClassName
        )}
        {...stepper.stepperButtonKeyhandlerProps}
        disabled={stepper.isIncrementDisabled}
        hitSlop={10}
        onPress={stepper.onIncrement}
      >
        <Icon color={getThemeColor('--primary')} name="AddFilled" size={20} />
      </Pressable>
    </View>
  );
});

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps =
  NumberStepperProps.documentationProps('NumberStepper');
