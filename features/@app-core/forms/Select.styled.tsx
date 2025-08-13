import * as SP from '@green-stack/forms/Select.primitives';
import { type PropsOf, schema, z } from '@green-stack/schemas';
import type { Dispatch, ElementRef, ReactNode, SetStateAction } from 'react';
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn, getThemeColor, Pressable, Text, View } from '../components/styled';
import { CheckFilled } from '../icons/CheckFilled';
import { ChevronDownFilled } from '../icons/ChevronDownFilled';
import { ChevronUpFilled } from '../icons/ChevronUpFilled';

/* --- Constants ------------------------------------------------------------------------------- */

const isWeb = Platform.OS === 'web';
const isMobile = ['ios', 'android'].includes(Platform.OS);

/* --- Context --------------------------------------------------------------------------------- */

export type SelectContext = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  options: Record<string, string>;
  setOptions: Dispatch<SetStateAction<Record<string, string>>>;
};

export const SelectContext = createContext<SelectContext | undefined>(
  undefined
);

export const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelectContext() must be used within a SelectProvider');
  }
  return context;
};

/* --- <SelectTrigger/> ------------------------------------------------------------------------ */

export const SelectTriggerProps = schema('SelectTriggerProps', {
  className: z.string().optional(),
  hasError: z.boolean().default(false),
});

export type SelectTriggerProps = PropsOf<
  typeof SP.SelectTrigger,
  typeof SelectTriggerProps
>;

export const SelectTrigger = forwardRef<
  ElementRef<typeof SP.SelectTrigger>,
  SelectTriggerProps
>((rawProps, ref) => {
  // Props
  const props = SelectTriggerProps.applyDefaults(rawProps);
  const { children, disabled, hasError, ...restProps } = props;

  // Hooks
  const { open, onOpenChange } = SP.useSelectRootContext();

  // -- Render --

  return (
    <SP.SelectTrigger
      ref={ref}
      {...restProps}
      asChild
      className={cn(
        'flex h-10 flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-muted-foreground text-sm',
        'native:h-12',
        'web:ring-offset-background web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2 [&>span]:line-clamp-1',
        disabled && 'web:cursor-not-allowed border-muted',
        hasError && 'border-danger',
        props.className
      )}
      disabled={disabled}
      onPress={() => onOpenChange(!open)}
    >
      <Pressable>
        {/* @ts-ignore */}
        {children}
        <ChevronDownFilled
          aria-hidden={true}
          className="text-foreground opacity-50"
          color={getThemeColor('--foreground')}
          size={16}
        />
      </Pressable>
    </SP.SelectTrigger>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

/* --- <SelectScrollButton/> ------------------------------------------------------------------- */

export const SelectScrollButtonProps = schema('SelectScrollButtonProps', {
  direction: z.enum(['up', 'down']),
  className: z.string().optional(),
});

export type SelectScrollButtonProps = PropsOf<
  typeof SP.SelectScrollUpButton,
  typeof SelectScrollButtonProps
>;

export const SelectScrollButton = (rawProps: SelectScrollButtonProps) => {
  // Props
  const props = SelectScrollButtonProps.applyDefaults(rawProps);
  const isUp = props.direction === 'up';

  // Components
  const BaseScrollButton = isUp
    ? SP.SelectScrollUpButton
    : SP.SelectScrollDownButton;
  const ScrollDirIcon = isUp ? ChevronUpFilled : ChevronDownFilled;

  // -- Skip if Native --

  if (!isWeb) {
    return null;
  }

  // -- Render --

  return (
    <BaseScrollButton
      {...props}
      className={cn(
        'flex items-center justify-center py-1',
        'web:cursor-default',
        props.className
      )}
    >
      <ScrollDirIcon className="text-foreground" size={14} />
    </BaseScrollButton>
  );
};

/* --- <SelectContent/> ------------------------------------------------------------------------ */

export const SelectContentProps = schema('SelectContentProps', {
  className: z.string().optional(),
  position: z.enum(['popper', 'item-aligned']).optional(),
  portalHost: z.string().optional(),
});

export type SelectContentProps = PropsOf<
  typeof SP.SelectContent,
  typeof SelectContentProps
>;

export const SelectContent = forwardRef<
  ElementRef<typeof SP.SelectContent>,
  SelectContentProps
>((rawProps, _ref) => {
  // Props
  const props = SelectContentProps.applyDefaults(rawProps);
  const { children, position, portalHost } = props;

  // Refs
  const contentRef = useRef(null);

  // Flags
  const isPopper = position === 'popper';

  // Context
  const selectContext = useSelectContext();
  const { open: isOpen, onOpenChange } = SP.useSelectRootContext();

  // -- Effects --

  useEffect(() => {
    if (isOpen && isWeb && contentRef.current) {
      const $content = contentRef.current as HTMLElement;
      const $interactable = $content.querySelector(
        'button, a, input, select, textarea'
      ) as HTMLElement;
      if ($interactable) {
        $interactable.focus?.();
      }
    }
  }, [isOpen]);

  // -- Render --

  return (
    <SP.SelectPortal hostName={portalHost}>
      <SelectContext.Provider value={selectContext}>
        <SP.SelectOverlay
          asChild
          onPress={() => onOpenChange(!isOpen)}
          style={isWeb ? undefined : StyleSheet.absoluteFill}
        >
          <Pressable>
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <SP.SelectContent
                position={position}
                ref={contentRef}
                {...props}
                asChild
                className={cn(
                  'relative z-50 max-h-96 min-w-[8rem] rounded-md border border-border bg-popover px-1 py-2 shadow-foreground/10 shadow-md',
                  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                  isPopper &&
                    'data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1',
                  !!isOpen && 'web:zoom-in-95 web:fade-in-0 web:animate-in',
                  !isOpen && 'web:zoom-out-95 web:fade-out-0 web:animate-out',
                  props.className
                )}
                style={{
                  maxWidth: Math.min(400, Dimensions.get('window').width - 40),
                  backgroundColor: getThemeColor('--popover'),
                }}
              >
                <View>
                  <SelectScrollButton direction="up" />
                  <SP.SelectViewport
                    className={cn(
                      'p-1',
                      isPopper &&
                        'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
                    )}
                  >
                    {children}
                  </SP.SelectViewport>
                  <SelectScrollButton direction="down" />
                </View>
              </SP.SelectContent>
            </Animated.View>
          </Pressable>
        </SP.SelectOverlay>
      </SelectContext.Provider>
    </SP.SelectPortal>
  );
});

SelectContent.displayName = 'SelectContent';

/* --- <SelectLabel/> -------------------------------------------------------------------------- */

export const SelectLabelProps = schema('SelectLabelProps', {
  className: z.string().optional(),
});

export type SelectLabelProps = PropsOf<
  typeof SP.SelectLabel,
  typeof SelectLabelProps
>;

export const SelectLabel = forwardRef<
  ElementRef<typeof SP.SelectLabel>,
  SelectLabelProps
>((rawProps, ref) => {
  // Props
  const props = SelectLabelProps.applyDefaults(rawProps);
  const { children } = props;

  // -- Render --

  return (
    <SP.SelectLabel
      ref={ref}
      {...props}
      asChild
      className={cn(
        'py-1.5 pr-2 pl-8 font-semibold text-popover-foreground text-sm',
        'native:pb-2 native:pl-10 native:text-base',
        props.className
      )}
    >
      <Text>{children}</Text>
    </SP.SelectLabel>
  );
});

SelectLabel.displayName = 'SelectLabel';

/* --- <SelectItem/> --------------------------------------------------------------------------- */

export const SelectItemProps = schema('SelectItemProps', {
  value: z.string(),
  label: z.string(),
  className: z.string().optional(),
  disabled: z.boolean().default(false),
  hasError: z.boolean().default(false),
});

export type SelectItemProps = PropsOf<
  typeof SP.SelectItem,
  typeof SelectItemProps
>;

export const SelectItem = forwardRef<
  ElementRef<typeof SP.SelectItem>,
  SelectItemProps
>((rawProps, ref) => {
  // Props
  const props = SelectItemProps.applyDefaults(rawProps);
  const { value, label, disabled, hasError, ...restProps } = props;

  // Context
  const selectContext = useSelectContext();
  const { onOpenChange } = SP.useSelectRootContext();

  // -- Handlers --

  // -i- Fix for mobile view on web
  const handlePress = () => {
    selectContext.setValue(value);
    onOpenChange(false);
  };

  // -- Effects --

  useEffect(() => {
    const isRegisteredOption = !!selectContext.options?.[value];
    if (!isRegisteredOption && value) {
      selectContext.setOptions((prev) => ({ ...prev, [value]: label }));
    }
  }, [value, label, selectContext.options?.[value], selectContext.setOptions]);

  // -- Render --

  return (
    <SP.SelectItem
      ref={ref}
      {...restProps}
      asChild
      className={cn(
        'relative flex w-full flex-row items-center rounded-sm py-1.5 pr-2',
        'web:cursor-default web:select-none web:outline-none web:hover:bg-accent/50',
        'web:focus:bg-accent active:bg-accent',
        disabled && 'web:pointer-events-none opacity-50',
        hasError && 'border border-danger',
        props.className
      )}
      disabled={disabled}
      label={label}
      value={value}
    >
      <Pressable onPress={handlePress}>
        <View className="flex flex-row items-center">
          <View className="native:w-3 w-1.5" />
          <View
            className={cn(
              'relative flex h-3.5 w-3.5 items-center justify-center',
              'left-0'
            )}
          >
            <SP.SelectItemIndicator asChild>
              <View>
                <CheckFilled color={getThemeColor('--primary')} size={16} />
              </View>
            </SP.SelectItemIndicator>
          </View>
          <View className="native:w-3.5 w-3" />
          <View className="relative">
            <SP.SelectItemText
              className={cn(
                'relative text-popover-foreground text-sm',
                'native:text-base native:text-lg',
                'web:group-focus:text-accent-foreground'
              )}
              style={{ color: getThemeColor('--popover-foreground') }}
            />
          </View>
        </View>
      </Pressable>
    </SP.SelectItem>
  );
});

SelectItem.displayName = 'SelectItem';

/* --- <SelectSeparator/> ---------------------------------------------------------------------- */

export const SelectSeparatorProps = schema('SelectSeparatorProps', {
  className: z.string().optional(),
});

export type SelectSeparatorProps = PropsOf<
  typeof SP.SelectSeparator,
  typeof SelectSeparatorProps
>;

export const SelectSeparator = forwardRef<
  ElementRef<typeof SP.SelectSeparator>,
  SelectSeparatorProps
>((rawProps, ref) => {
  // Props
  const props = SelectSeparatorProps.applyDefaults(rawProps);

  // -- Render --

  return (
    <SP.SelectSeparator
      ref={ref}
      {...props}
      className={cn('-mx-1 my-1 h-px bg-muted', props.className)}
    />
  );
});

SelectSeparator.displayName = 'SelectSeparator';

/* --- <Select/> ------------------------------------------------------------------------------- */

export const SelectProps = schema('SelectProps', {
  options: z.record(z.string()).default({}),
  value: z.string().default(''),
  placeholder: z.string().default('Select an option'),
  disabled: z.boolean().default(false),
  hasError: z.boolean().default(false),
  className: z.string().optional(),
  triggerClassName: z.string().optional(),
  valueClassName: z.string().optional(),
  contentClassName: z.string().default('w-full bg-white'),
});

export type SelectProps<T extends string = string> = Omit<
  PropsOf<typeof SP.SelectRoot, typeof SelectProps>,
  'onValueChange' | 'value' | 'defaultValue'
> & {
  value: T;
  children?: ReactNode;
  onChange: (value: T) => void;
};

/** --- createSelect() ------------------------------------------------------------------------- */
/** -i- Create a Universal Select where you can pass a Generic type to narrow the string `value` & `onChange()` params */
export const createSelectComponent = <T extends string = string>() =>
  Object.assign(
    forwardRef<ElementRef<typeof SP.SelectRoot>, SelectProps<T>>(
      (rawProps, ref) => {
        // Props
        const props = SelectProps.applyDefaults(rawProps);
        const {
          placeholder,
          disabled,
          hasError,
          children,
          onChange,
          ...restProps
        } = props;

        // State
        const [value, setValue] = useState<string>(props.value);
        const [options, setOptions] = useState(props.options);

        // Hooks
        const insets = useSafeAreaInsets();
        const contentInsets = {
          top: insets.top,
          bottom: insets.bottom,
          left: 12,
          right: 12,
        };

        // Vars
        const optionsKey = Object.keys(options).join('-');
        const hasPropOptions = Object.keys(props.options || {}).length > 0;
        const selectValueKey = `${optionsKey}-${!!value}-${!!options?.[value]}`;

        // -- Effects --

        useEffect(() => {
          const isValidOption =
            value && Object.keys(options || {})?.includes?.(value);
          if (isValidOption) {
            onChange(value as T);
          } else if (!(value || restProps.required)) {
            onChange(undefined as unknown as T);
          }
        }, [value, onChange, options, restProps.required]);

        useEffect(() => {
          if (props.value !== value) {
            setValue(props.value);
          }
        }, [props.value, value]);

        // -- Render --

        return (
          <SelectContext.Provider
            value={{ value, setValue, options, setOptions }}
          >
            <SP.SelectRoot
              key={`select-${selectValueKey}`}
              ref={ref}
              {...restProps}
              asChild
              className={cn('relative w-full', props.className)}
              disabled={disabled}
              onValueChange={(option) => setValue(option?.value!)}
              value={{ value, label: options?.[value] }}
            >
              <View>
                <SelectTrigger
                  className={cn('w-full', props.triggerClassName)}
                  disabled={disabled}
                  hasError={hasError}
                  key={`select-trigger-${selectValueKey}`}
                >
                  <Text
                    className={cn(
                      'text-foreground text-sm',
                      'native:text-lg',
                      !value && !!placeholder && 'text-muted',
                      disabled && 'opacity-50',
                      props.valueClassName
                    )}
                    disabled={disabled}
                    key={`select-value-${optionsKey}-${!!value}-${!!options?.[value]}`}
                  >
                    <SP.SelectValue
                      asChild={isWeb}
                      className={cn(
                        'text-primary text-sm',
                        'native:text-lg',
                        !value && !!placeholder && 'text-muted',
                        props.valueClassName
                      )}
                      key={`select-value-${selectValueKey}`}
                      placeholder={placeholder}
                    >
                      {isWeb && (
                        <Text
                          className={cn(
                            !value && !!placeholder && 'text-muted'
                          )}
                        >
                          {options?.[value] || placeholder}
                        </Text>
                      )}
                    </SP.SelectValue>
                  </Text>
                </SelectTrigger>
                <SelectContent
                  className={cn(props.contentClassName)}
                  insets={contentInsets}
                >
                  {hasPropOptions && (
                    <SP.SelectGroup asChild>
                      <View>
                        {!!placeholder && (
                          <SelectLabel>{placeholder}</SelectLabel>
                        )}
                        {Object.entries(props.options).map(([value, label]) => (
                          <SelectItem key={value} label={label} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </View>
                    </SP.SelectGroup>
                  )}
                  {children}
                </SelectContent>

                {isMobile && (
                  <View className="invisible hidden h-0 w-0">{children}</View>
                )}
              </View>
            </SP.SelectRoot>
          </SelectContext.Provider>
        );
      }
    ),
    {
      displayName: 'Select',
      Option: SelectItem,
      Item: SelectItem,
      Separator: SelectSeparator,
      Group: SP.SelectGroup,
      Label: SelectLabel,
      Content: SelectContent,
      /** -i- Create a Universal Select where you can pass a Generic type to narrow the string `value` & `onChange()` params */
      create: createSelectComponent,
    }
  );

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = SelectProps.documentationProps('Select', {
  exampleProps: {
    options: {
      'write-once': 'Universal  -  write-once  -  🚀 💸 ⚡️',
      'react-native': 'React Native first  -  Web later  -  ⏳⏳',
      'web-first': 'Web first  -  Mobile later  -  💰💰(💰)',
      'ios-first': 'iOS first  -  Web + Android later  -  ⏳⏳⏳',
      'android-first': 'Android first  -  Web + iOS later  -  💰💰💰',
    },
    placeholder: 'Select a build and release strategy',
  },
});

/* --- Exports --------------------------------------------------------------------------------- */

export const Select = createSelectComponent();
