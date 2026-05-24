import { Suspense, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import { Button } from '#/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/client/components/ui/dialog';
import {
  Field as FieldWrapper,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/client/components/ui/field';
import { Input } from '#/client/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/client/components/ui/select';
import { Skeleton } from '#/client/components/ui/skeleton';
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import { createProductFn } from '../-products.functions';
import { unitsQueryOptions } from '../../_units/-units.queries';
import { currenciesQueryOptions } from '../../_currencies/-currencies.queries';
import { symbolsQueryOptions } from '../../symbols/-symbols.queries';

const createProductSchema = z.object({
  productName: z.string().min(6, 'Name must contain at least 6 characters.'),
  defaultPrice: z
    .number('Default price is required.')
    .positive('Default price cannot be less than 0.'),
  currencyId: z.int('Currency is required.'),
  defaultQuantity: z
    .number('Quantity is required.')
    .positive('Quantity cannot be less than 0.'),
  unitId: z.number('Unit is required.'),
  productSymbolId: z.int().optional(),
});

const FormSkeletons = () => (
  <>
    <DialogHeader>
      <Skeleton className="h-6 w-32" />
    </DialogHeader>
    <FieldGroup className="grid w-full items-center gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </FieldGroup>
    <DialogFooter>
      <Skeleton className="h-9 w-16" />
    </DialogFooter>
  </>
);

const FormContent = ({
  setIsDialogOpen,
}: {
  setIsDialogOpen: (v: boolean) => void;
}) => {
  const queryClient = useQueryClient();

  const { data: units } = useSuspenseQuery(unitsQueryOptions());
  const { data: currencies } = useSuspenseQuery(currenciesQueryOptions());
  const { data: symbols } = useSuspenseQuery(symbolsQueryOptions());

  const currencyItems = currencies.map((currency) => ({
    label: `${currency.currencySymbol} - ${currency.currencyName}`,
    value: currency.id.toString(),
  }));

  const unitItems = units.map((unit) => ({
    label: `${unit.unitSymbol} - ${unit.unitName}`,
    value: unit.id.toString(),
  }));

  const symbolItems = symbols.map((symbol) => ({
    label: symbol.symbolName || 'Unnamed Symbol',
    value: symbol.id.toString(),
  }));

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      productName: 'Potato',
      defaultPrice: 1,
      currencyId: 1,
      defaultQuantity: 1,
      unitId: 1,
      productSymbolId: undefined as number | undefined,
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsed = createProductSchema.safeParse(value);
        if (!parsed.success) {
          const fieldErrors: Record<string, { message: string }[]> = {};
          for (const issue of parsed.error.issues) {
            const path = issue.path.join('.');
            if (!fieldErrors[path]) fieldErrors[path] = [];
            fieldErrors[path].push({ message: issue.message });
          }
          return { fields: fieldErrors };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        data: {
          productName: value.productName,
          defaultPrice: value.defaultPrice,
          currencyId: value.currencyId,
          defaultQuantity: value.defaultQuantity,
          unitId: value.unitId,
          productSymbolId: value.productSymbolId,
        },
      });
    },
  });

  const mutation = useMutation({
    mutationFn: createProductFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
      setIsDialogOpen(false);
      toast.success('Product created successfully');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to create product';
      toast.error(message);
    },
  });

  return (
    <>
      <DialogHeader
        className={`transition-all duration-300 ${mutation.isPending ? 'blur-sm' : ''}`}
      >
        <DialogTitle>Add product</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <div className="relative">
          <div
            className={`grid w-full items-center gap-4 transition-all duration-300 ${mutation.isPending ? 'blur-sm' : ''}`}
          >
            <FieldGroup className="grid w-full items-center gap-4">
              <Field
                name="productName"
                children={(field) => (
                  <div className="flex flex-col space-y-1.5">
                    <FieldLabel htmlFor={field.name}>Product name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                )}
              />

              <Field
                name="defaultPrice"
                children={(field) => (
                  <div className="flex flex-col space-y-1.5">
                    <FieldLabel htmlFor={field.name}>Default price</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.valueAsNumber)
                      }
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                )}
              />

              <Field
                name="currencyId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>
                      Default currency
                    </FieldLabel>
                    <Select
                      items={currencyItems}
                      value={field.state.value.toString()}
                      onValueChange={(value) =>
                        field.handleChange(Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {currencies.map((currency) => (
                            <SelectItem
                              key={currency.id}
                              value={currency.id.toString()}
                            >
                              {currency.currencySymbol} -{' '}
                              {currency.currencyName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                )}
              />

              <Field
                name="defaultQuantity"
                children={(field) => (
                  <div className="flex flex-col space-y-1.5">
                    <FieldLabel htmlFor={field.name}>
                      Default quantity
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.valueAsNumber)
                      }
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                )}
              />

              <Field
                name="unitId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Default unit</FieldLabel>
                    <Select
                      items={unitItems}
                      value={field.state.value.toString()}
                      onValueChange={(value) =>
                        field.handleChange(Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {units.map((unit) => (
                            <SelectItem
                              key={unit.id}
                              value={unit.id.toString()}
                            >
                              {unit.unitSymbol} - {unit.unitName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                )}
              />

              <Field
                name="productSymbolId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Symbol</FieldLabel>
                    <Select
                      items={symbolItems}
                      value={field.state.value?.toString() ?? ''}
                      onValueChange={(value) =>
                        field.handleChange(Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select symbol">
                          {field.state.value &&
                            symbols.find((s) => s.id === field.state.value) && (
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    symbols.find(
                                      (s) => s.id === field.state.value
                                    )?.symbolPicture
                                  }
                                  alt={
                                    symbols.find(
                                      (s) => s.id === field.state.value
                                    )?.symbolName
                                  }
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                                <span>
                                  {
                                    symbols.find(
                                      (s) => s.id === field.state.value
                                    )?.symbolName
                                  }
                                </span>
                              </div>
                            )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {symbols.map((symbol) => (
                            <SelectItem
                              key={symbol.id}
                              value={symbol.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                {symbol.symbolPicture && (
                                  <img
                                    src={symbol.symbolPicture}
                                    alt={symbol.symbolName || 'Symbol'}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                )}
                                <span>
                                  {symbol.symbolName || 'Unnamed Symbol'}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                )}
              />
            </FieldGroup>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={!state.canSubmit || mutation.isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

const CreateProduct = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="gap-1 transition-transform duration-75 active:scale-[0.97]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add product
            </span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <Suspense fallback={<FormSkeletons />}>
          <FormContent setIsDialogOpen={setIsDialogOpen} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProduct;
