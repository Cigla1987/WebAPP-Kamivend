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
                    isActive={pathname === '/dashboard'}
                    className="hover:cursor-pointer"
                  >
                    <Home />
                    Home
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link to="/machines">
                  <SidebarMenuButton
                    isActive={pathname === '/machines'}
                    className="hover:cursor-pointer"
                  >
                    <VendingMachineIcon />
                    Machines
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link to="/products">
                  <SidebarMenuButton
                    isActive={pathname === '/products'}
                    className="hover:cursor-pointer"
                  >
                    <Package2 />
                    Products
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link to="/pictures">
                  <SidebarMenuButton
                    isActive={pathname === '/pictures'}
                    className="hover:cursor-pointer"
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
                      isActive={pathname === '/members'}
                      className="hover:cursor-pointer"
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
                      isActive={pathname === '/admin'}
                      className="hover:cursor-pointer"
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
