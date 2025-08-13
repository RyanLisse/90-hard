import { TextInput as BaseTextInput } from '@green-stack/forms/TextInput.primitives';
import { type PropsOf, z } from '@green-stack/schemas';
import { type ElementRef, forwardRef } from 'react';
import { cn } from '../components/styled';
import { TextInputProps } from './TextInput.styled';

/* --- Props ----------------------------------------------------------------------------------- */

export const TextAreaProps = TextInputProps.extendSchema('TextAreaProps', {
  multiline: z
    .boolean()
    .default(true)
    .describe('See `numberOfLines`. Also disables some `textAlign` props.'),
  numberOfLines: z.number().optional(),
  textAlign: z
    .enum(['left', 'center', 'right'])
    .default('left')
    .describe('Might not work if multiline'),
  textAlignVertical: z
    .enum(['top', 'center', 'bottom'])
    .default('top')
    .describe('Might not work if multiline'),
});

export type TextAreaProps = PropsOf<typeof BaseTextInput, typeof TextAreaProps>;

/* --- <TextArea/> ----------------------------------------------------------------------------- */

export const TextArea = forwardRef<
  ElementRef<typeof BaseTextInput>,
  TextAreaProps
>((rawProps, ref) => {
  // Props
  const props = TextAreaProps.applyDefaults(rawProps);

  // -- Render --

  return (
    <BaseTextInput
      ref={ref}
      {...props}
      className={cn(
        'min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground',
        'web:flex web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        'native:text-lg native:leading-[1.25]',
        'lg:text-sm',
        'placeholder:text-muted',
        'test-end',
        props.textAlign === 'left' && 'text-left',
        props.textAlign === 'center' && 'text-center',
        props.textAlign === 'right' && 'text-right',
        props.textAlignVertical === 'top' && 'items-start',
        props.textAlignVertical === 'center' && 'items-center',
        props.textAlignVertical === 'bottom' && 'items-end',
        props.editable === false && 'web:cursor-not-allowed opacity-50',
        props.disabled && 'web:cursor-not-allowed opacity-50',
        props.hasError && 'border-danger',
        props.className
      )}
      placeholderClassName={cn('text-muted', props.placeholderClassName)}
    />
  );
});

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = TextAreaProps.documentationProps(
  'TextArea',
  {
    onChangeProp: 'onChangeText',
  }
);
