import { TextInput as BaseTextInput } from '@green-stack/forms/TextInput.primitives';
import { type PropsOf, schema, z } from '@green-stack/schemas';
import { type ElementRef, forwardRef } from 'react';
import { cn, theme } from '../components/styled';

/* --- Props ----------------------------------------------------------------------------------- */

export const TextInputProps = schema('TextInputProps', {
  value: z.string().optional(),
  placeholder: z.string().optional().example('Start typing...'),
  className: z.string().optional(),
  placeholderClassName: z.string().optional(), // @ts-ignore
  placeholderTextColor: z.string().default(theme?.colors?.muted),
  hasError: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  disabled: z.boolean().default(false),
});

export type TextInputProps = PropsOf<
  typeof BaseTextInput,
  typeof TextInputProps
>;

/* --- <TextInput/> ---------------------------------------------------------------------------- */

export const TextInput = forwardRef<
  ElementRef<typeof BaseTextInput>,
  TextInputProps
>((rawProps, ref) => {
  // Props
  const props = TextInputProps.applyDefaults(rawProps);

  // -- Render --

  return (
    <BaseTextInput
      ref={ref}
      {...props}
      className={cn(
        'h-10 rounded-md bg-background px-3 text-base text-foreground',
        'border border-input',
        'lg:text-sm',
        'native:h-12 native:text-lg native:leading-[1.25]',
        'web:flex web:w-full web:py-2 web:ring-offset-background',
        'web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        'file:border-0 file:bg-transparent file:font-medium',
        props.editable === false && 'web:cursor-not-allowed',
        props.readOnly && 'web:cursor-not-allowed',
        props.disabled && 'web:cursor-not-allowed opacity-50',
        props.hasError && 'border border-danger',
        props.className
      )}
      placeholderClassName={cn('text-muted', props.placeholderClassName)}
    />
  );
});

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = TextInputProps.documentationProps(
  'TextInput',
  {
    onChangeProp: 'onChangeText',
  }
);
