import type { FieldApi } from '@tanstack/react-form';
import { Input } from '#components/input';
import { Field, FieldLabel, FieldError } from '#components/field';

type FormInputProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<
    any,
    any,
    string,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  label: string;
  type?: 'text' | 'email' | 'password';
  onChange?: () => void;
};

export const FormInput = ({
  field,
  label,
  type = 'text',
  onChange,
}: FormInputProps) => {
  const errorMessage = Array.isArray(field.state.meta.errors)
    ? typeof field.state.meta.errors[0] === 'string'
      ? field.state.meta.errors[0]
      : field.state.meta.errors[0]?.message
    : undefined;

  return (
    <Field className="flex flex-col space-y-1.5">
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value);
          onChange?.();
        }}
      />
      {errorMessage && <FieldError errors={[{ message: errorMessage }]} />}
    </Field>
  );
};
