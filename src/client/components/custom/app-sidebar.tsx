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
} from '#/client/components/ui/sidebar';
import { Link, useLocation } from '@tanstack/react-router';
import { FileImage, Home, Package2, Shapes, Users } from 'lucide-react';
import { Icon } from '@iconify/react';
// import { RoleProtected } from './role-protected';

const AppSidebar = () => {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const { toggleSidebar } = useSidebar();

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
                    <Icon
                      icon="roentgen:vending-machine"
                      width={24}
                      height={24}
                    />
                    Machines
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              {/**/}
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

              <SidebarMenuItem>
                <Link to="/symbols">
                  <SidebarMenuButton
                    className={`hover:cursor-pointer ${
                      pathname === '/symbols' ? 'bg-sidebar-accent' : ''
                    }`}
                  >
                    <Shapes />
                    Symbols
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarRail onClick={toggleSidebar} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
