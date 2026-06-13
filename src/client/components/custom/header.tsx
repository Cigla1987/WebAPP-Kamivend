import { useMatches, Link, useRouter } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { machinesQueryOptions } from '#/routes/_auth/machines/-machines.queries';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/client/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#/client/components/ui/dropdown-menu';
import { ModeToggle } from '#/client/components/ui/mode-toggle';
import { Button } from '#/client/components/ui/button';
import authClient from '#/client/lib/auth-client';
import { CaretDownIcon } from '@phosphor-icons/react';
import { cn } from '#/client/lib/utils';
import { MachineType } from '#/shared/enums';

const Header = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const matches = useMatches();

  // Get breadcrumb matches (routes with staticData)
  const breadcrumbMatches = matches.filter((m) => {
    const data = m.staticData as { title?: string } | undefined;
    return data?.title;
  });

  // Check if we're on a machine route
  const isMachineRoute = breadcrumbMatches.some(
    (m) => m.routeId === '/_auth/machines/$machineId/compartments'
  );

  // Get machines list if on a machine route
  const { data: machines } = useQuery({
    ...machinesQueryOptions(),
    enabled: isMachineRoute,
  });

  // Get current machineId from the machine route match
  const machineMatch = matches.find(
    (m) => m.routeId === '/_auth/machines/$machineId/compartments'
  );
  const machineId = machineMatch?.params.machineId;

  // Filter out smartfridges (they don't have compartments)
  const compartmentMachines = machines?.filter(
    (m) => m.machineTypeName !== MachineType.Smartfridge
  );

  const currentMachine = compartmentMachines?.find((m) => m.id === machineId);
  const hasMultipleMachines = (compartmentMachines?.length ?? 0) > 1;

  const handleLogout = async () => {
    await authClient.signOut();
    queryClient.clear();
    router.navigate({ to: '/login' });
  };

  const handleMachineSwitch = (newMachineId: string) => {
    router.navigate({
      to: '/machines/$machineId/compartments',
      params: { machineId: newMachineId },
    });
  };

  return (
    <header className="container mx-auto mt-2 sm:px-6">
      <nav className="flex items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbMatches.map((match, index) => {
              const isLast = index === breadcrumbMatches.length - 1;
              const isMachineMatch =
                match.routeId === '/_auth/machines/$machineId/compartments';

              // For the machine route, render the machine name dropdown + compartments
              if (isMachineMatch && compartmentMachines) {
                return (
                  <>
                    <BreadcrumbItem>
                      {hasMultipleMachines ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={cn(
                              'flex items-center gap-1 text-xs font-normal text-foreground hover:opacity-80 transition-opacity',
                              '[&_svg]:pointer-events-none [&_svg]:shrink-0'
                            )}
                          >
                            <span>
                              {currentMachine?.machineName || 'Unknown Machine'}
                            </span>
                            <CaretDownIcon className="size-3 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {compartmentMachines.map((machine) => (
                              <DropdownMenuItem
                                key={machine.id}
                                onClick={() =>
                                  handleMachineSwitch(machine.id)
                                }
                              >
                                {machine.machineName}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs font-normal text-foreground">
                          {currentMachine?.machineName || 'Unknown Machine'}
                        </span>
                      )}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {match.staticData.title}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                );
              }

              // For other routes, render link or page
              return (
                <>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        {match.staticData.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={
                          <Link to={match.pathname} />
                        }
                      >
                        {match.staticData.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
