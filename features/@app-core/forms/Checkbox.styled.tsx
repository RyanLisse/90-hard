import { Icon } from '@green-stack/components/Icon';
import {
  CheckboxIndicator,
  CheckboxRoot,
} from '@green-stack/forms/Checkbox.primitives';
import { useFocusedPress } from '@green-stack/hooks/useFocusedPress';
import { type PropsOf, schema, z } from '@green-stack/schemas';
import { type ElementRef, forwardRef } from 'react';
import { cn, getThemeColor, Pressable, Text, View } from '../components/styled';

/* --- Props ----------------------------------------------------------------------------------- */

export const CheckboxProps = schema('CheckboxProps', {
  checked: z.boolean().default(false),
  label: z.string().optional().eg('Label'),
  disabled: z.boolean().default(false),
  hasError: z.boolean().default(false),
  className: z.string().optional(),
  checkboxClassName: z.string().optional(),
  indicatorClassName: z.string().optional(),
  labelClassName: z.string().optional(),
  hitSlop: z.number().default(6),
});

export type CheckboxProps = PropsOf<typeof CheckboxRoot, typeof CheckboxProps>;

/* --- <Checkbox/> ----------------------------------------------------------------------------- */

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxRoot>,
  CheckboxProps
>((rawProps, ref) => {
  // Props
  const props = CheckboxProps.applyDefaults(rawProps);
  const { checked, disabled, label, hasError, onCheckedChange } = props;

  // Vars
  const nativeID = props.id || props.nativeID;
  const labelledByFallback = nativeID ? `${nativeID}-label` : undefined;
  const labelledByID = props['aria-labelledby'] || labelledByFallback;

  // -- Handlers --

  const onPress = disabled ? () => {} : () => onCheckedChange(!checked);

  const focusedKeyHandlerProps = useFocusedPress(['Enter', ' '], () =>
    onPress()
  );

  // -- Render --

  return (
    <Pressable
      className={cn(
        'flex flex-row items-center',
        disabled && 'cursor-not-allowed opacity-50',
        props.className
      )}
      {...focusedKeyHandlerProps}
      aria-labelledby={labelledByID}
      disabled={disabled}
      focusable={false}
      hitSlop={props.hitSlop}
      onPress={onPress}
      role="checkbox"
    >
      <CheckboxRoot
        id={nativeID}
        ref={ref}
        {...props}
        aria-labelledby={labelledByID}
        asChild
        className={cn(
          'h-4 w-4 shrink-0 rounded-sm border border-primary',
          'native:h-[20] native:w-[20] native:rounded',
          'web:peer web:ring-offset-background',
          'web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          disabled && 'cursor-not-allowed border border-muted opacity-50',
          checked && 'bg-primary',
          checked && hasError && 'bg-danger',
          hasError && 'border border-danger',
          props.checkboxClassName
        )}
        hitSlop={props.hitSlop}
      >
        <Pressable>
          <CheckboxIndicator
            asChild
            className={cn(
              'h-full w-full items-center justify-center',
              props.indicatorClassName
            )}
          >
            <View>
              {checked && (
                <Icon
                  className={cn(
                    'text-primary-foreground',
                    hasError && 'text-red-500'
                  )}
                  color={getThemeColor('--primary-foreground')}
                  name="CheckFilled"
                  size={12}
                />
              )}
            </View>
          </CheckboxIndicator>
        </Pressable>
      </CheckboxRoot>
      {!!label && (
        <Text
          className={cn(
            'ml-2 flex web:select-none items-center',
            'text-primary',
            props.labelClassName
          )}
          disabled={disabled}
          id={labelledByID}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
});

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps =
  CheckboxProps.documentationProps<CheckboxProps>('Checkbox', {
    valueProp: 'checked',
    onChangeProp: 'onCheckedChange',
  });
