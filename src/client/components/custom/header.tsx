import { Fragment } from 'react';
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
import { Button, buttonVariants } from '#/client/components/ui/button';
import { ModeToggle } from '#/client/components/ui/mode-toggle';
import authClient from '#/client/lib/auth-client';
import { CaretDownIcon } from '@phosphor-icons/react';
import { SidebarTrigger } from '#/client/components/ui/sidebar';
import { cn } from '#/client/lib/utils';
import { MachineType } from '#/shared/enums';

const Header = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const matches = useMatches();

  // Get breadcrumb matches (routes with staticData)
  const breadcrumbMatches = matches.filter((m) => m.staticData?.title);

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

  // Hide breadcrumb for single-item routes
  const showBreadcrumb = breadcrumbMatches.length > 1;

  // For machine routes, skip the parent "Machines" breadcrumb
  const visibleMatches = isMachineRoute
    ? breadcrumbMatches.filter((m) => m.routeId !== '/_auth/machines')
    : breadcrumbMatches;

  return (
    <header className="container mx-auto mt-2 sm:px-6">
      <nav className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          {showBreadcrumb ? (
          <Breadcrumb>
            <BreadcrumbList>
              {visibleMatches.map((match, index) => {
                const isLast = index === visibleMatches.length - 1;
                const isMachineMatch =
                  match.routeId === '/_auth/machines/$machineId/compartments';

                // For the machine route, render the machine name dropdown + compartments
                if (isMachineMatch && compartmentMachines) {
                  return (
                    <Fragment key={match.id}>
                      <BreadcrumbItem>
                        {hasMultipleMachines ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={cn(
                                buttonVariants({
                                  variant: 'ghost',
                                  size: 'xs',
                                }),
                                'gap-1 font-normal'
                              )}
                            >
                              <span>
                                {currentMachine?.machineName ||
                                  'Unknown Machine'}
                              </span>
                              <CaretDownIcon className="text-muted-foreground size-3" />
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
                          <span className="text-foreground text-xs font-normal">
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
                    </Fragment>
                  );
                }

                // For other routes, render link or page
                return (
                  <Fragment key={match.id}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>
                          {match.staticData.title}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          render={<Link to={match.pathname} />}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'xs' }),
                            'font-normal'
                          )}
                        >
                          {match.staticData.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <div />
        )}
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
