import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { GalleryVerticalEnd, HomeIcon, Map, User } from "lucide-react";
import { Link } from "react-router-dom";
// import { useUserStore } from "@/store/user.store";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    role: ["client", "team", "admin"],
    icon: <HomeIcon className="h-20 w-20 font-bold text-orange-600" />,
  },
  {
    title: "Meals Plan",
    url: "/dashboard/meals",
    role: ["client", "team", "admin"],
    icon: <Map className="h-20 w-20 font-bold text-orange-600" />,
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    role: ["team", "admin"],
    icon: <User className="h-20 w-20 font-bold text-orange-600" />,
  },
];

export function AppSidebar({ role, ...props }: {role: string} & React.ComponentProps<typeof Sidebar>) {
  const [activeLink, setActiveLink] = React.useState("/dashboard");

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">SIA Health</span>
                  <span className="capitalize">{role}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-16">
        <SidebarMenu>
          {navItems.map((item) => {
            if (!item.role.includes(role)) {
              return;
            }
            return (
              <SidebarMenuItem
                key={item.title}
                onClick={(_) => setActiveLink(item.url)}
              >
                <SidebarMenuButton asChild isActive={item.url === activeLink} className="py-4 ">
                  <div className="flex justify-start items-center h-full w-full">
                    {item.icon}
                    <Link to={item.url}>{item.title}</Link>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
