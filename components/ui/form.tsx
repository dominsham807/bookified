import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

const Form = FormProvider;

type FormFieldContextValue = {
  name: FieldPath<FieldValues>;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller<TFieldValues, TName> {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    id: itemContext.id,
    name: fieldContext.name,
    error: fieldState.error,
  };
}

const FormItemContext = React.createContext<{ id: string }>({ id: "" });

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={className} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  const { id } = useFormField();
  return <label htmlFor={id} className={className} {...props} />;
}

function FormControl({ children }: { children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean }> }) {
  const { id, error } = useFormField();
  return React.cloneElement(children, {
    id,
    "aria-invalid": Boolean(error),
  });
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error } = useFormField();
  if (!error) return null;
  return (
    <p className={className} {...props}>
      {String(error.message)}
    </p>
  );
}

export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage };
