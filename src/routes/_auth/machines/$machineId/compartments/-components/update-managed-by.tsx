import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { Button } from '#/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/client/components/ui/dialog';
import {
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/client/components/ui/field';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, getRouteApi } from '@tanstack/react-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/client/components/ui/select';
import { updateManagedBy } from '../-compartments.functions';
import { getUsersByOwner } from '#/routes/_auth/machines/-users.functions';
import type { CompartmentDto } from '../-compartments.server';
import type { UserDto } from '#/routes/_auth/machines/-users.server';

const authenticatedRoute = getRouteApi('/_auth');

const updateManagedBySchema = z.object({
  managedBy: z.string().nullable(),
});

type UpdateManagedByProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  compartment: CompartmentDto;
};

const UpdateManagedBy: React.FC<UpdateManagedByProps> = ({
  isOpen,
  onOpenChange,
  compartment,
}) => {
  const { user } = authenticatedRoute.useRouteContext();
  const userId = user.id;
  const [loading, setLoading] = useState(false);

  const { machineId } = useParams({
    from: '/_auth/machines/$machineId/compartments/',
  });

  const { data: ownerMembers } = useSuspenseQuery({
    queryKey: ['users', 'byOwner', userId],
    queryFn: () => getUsersByOwner({ data: { ownerId: userId!.toString() } }),
  });

  const memberItems = [
    { label: 'No user', value: 'null' },
    ...(ownerMembers?.map((member: UserDto) => ({
      label: member.username,
      value: member.id,
    })) ?? []),
  ];

  const queryClient = useQueryClient();

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      managedBy: null as string | null,
    },
    validators: {
      onSubmit: updateManagedBySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        await updateManagedBy({
          data: {
            id: compartment.id,
            managedBy: value.managedBy,
          },
        });

        // Invalidate and refetch
        await queryClient.invalidateQueries({
          queryKey: ['compartments', 'byMachine', machineId],
        });

        onOpenChange(false);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to update managed by';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader
          className={`transition-all duration-300 ${loading ? 'blur-sm' : ''}`}
        >
          <DialogTitle>Update managed by</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
        >
          <div className="relative">
            {loading && (
              <div className="absolute inset-x-0 top-1/4">Loading..</div>
            )}
            <div
              className={`grid w-full items-center gap-4 transition-all duration-300 ${
                loading ? 'blur-sm' : ''
              }`}
            >
              <FieldGroup className="grid w-full items-center gap-4">
                <Field
                  name="managedBy"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel>Select member</FieldLabel>
                      <Select
                        items={memberItems}
                        value={field.state.value || 'null'}
                        onValueChange={(value) =>
                          field.handleChange(value === 'null' ? null : value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">No user</SelectItem>
                          {ownerMembers?.map((member: UserDto) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.state.meta.errors.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                />
              </FieldGroup>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={!state.canSubmit || loading}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default UpdateManagedBy;
