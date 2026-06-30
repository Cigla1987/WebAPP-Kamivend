import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@vending/ui';
import { Link, useLocation } from '@tanstack/react-router';
import { FileImage, Home, Package2, Users, Shield } from 'lucide-react';
import VendingMachineIcon from '#/icons/roentgen_vending_machine.svg?react';
import { getRouteApi } from '@tanstack/react-router';
import { UserRole } from '@vending/domain';
import { isOrgMember } from '#/utils/permissions';

const authenticatedRoute = getRouteApi('/_auth');

const AppSidebar = () => {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const { toggleSidebar } = useSidebar();
  const { user, memberRole } = authenticatedRoute.useRouteContext();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <Link to="/dashboard">
                  <SidebarMenuButton
                    className={`hover:cursor-pointer ${
                      pathname === '/dashboard' ? 'bg-sidebar-accent' : ''
                    }`}
                  >
                    <Home />
                    Home
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link to="/machines">
                  <SidebarMenuButton
                    className={`hover:cursor-pointer ${
                      pathname === '/machines' ? 'bg-sidebar-accent' : ''
                    }`}
                  >
                    <VendingMachineIcon />
                    Machines
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link to="/products">
                  <SidebarMenuButton
                    className={`hover:cursor-pointer ${
                      pathname === '/products' ? 'bg-sidebar-accent' : ''
                    }`}
                  >
                    <Package2 />
                    Products
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link to="/pictures">
                  <SidebarMenuButton
                    className={`hover:cursor-pointer ${
                      pathname === '/pictures' ? 'bg-sidebar-accent' : ''
                    }`}
                  >
                    <FileImage />
                    Pictures
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {isOrgMember(memberRole) && (
                <SidebarMenuItem>
                  <Link to="/members">
                    <SidebarMenuButton
                      className={`hover:cursor-pointer ${
                        pathname === '/members' ? 'bg-sidebar-accent' : ''
                      }`}
                    >
                      <Users />
                      Members
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )}
              {user.role === UserRole.Admin && (
                <SidebarMenuItem>
                  <Link to="/admin">
                    <SidebarMenuButton
                      className={`hover:cursor-pointer ${
                        pathname === '/admin' ? 'bg-sidebar-accent' : ''
                      }`}
                    >
                      <Shield />
                      Admin
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarRail onClick={toggleSidebar} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
