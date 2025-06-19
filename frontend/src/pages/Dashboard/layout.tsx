import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BACKEND_BASE_ROUTE,
  ROUTE_CLIENT,
  ROUTE_TEAM,
  ROUTE_USER,
} from "@/lib/constant";
import { useUserStore } from "@/store/user.store";
import { SignedIn, useAuth, UserButton, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";

const DashboardLayout = () => {
  const { user } = useUser();
  const { setUser, setClientList, setTeamList, setUserList } = useUserStore();
  const { getToken } = useAuth();

  const navigate = useNavigate();

  if (!user) {
    toast.info("Please signin first!");
    navigate("/login");
  }

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const role = user?.publicMetadata.role;

        if (!token) {
          toast.error("Please login first");
          return;
        }

        if (role === "admin" || role === "team") {
          const res: any = await axios.get(
            `${BACKEND_BASE_ROUTE}/${ROUTE_CLIENT}`,
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.data.error) {
            console.log(res.data.error);
          }
          const data = res.data.data;

          if (data) {
            setClientList(data);
          }
        }

        if (role === "admin" || role === "team") {
          const team: any = await axios.get(
            `${BACKEND_BASE_ROUTE}/${ROUTE_TEAM}`,
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            }
          );

          if (team.data.error) {
            console.log(team.data.error);
          }
          const teamData = team.data.data;
          console.log(teamData);

          if (team) {
            setTeamList(teamData);
          }
        }

        if (role === "admin") {
          const usersList: any = await axios.get(
            `${BACKEND_BASE_ROUTE}/${ROUTE_USER}`,
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            }
          );
          if (usersList.data.error) {
            console.log(usersList.data.error);
          }

          if (usersList.data.data) {
            console.log('API Call: ', usersList.data.data)
            setUserList(usersList.data.data);
          }
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [user]);

  return (
    <SidebarProvider>
      <AppSidebar role={user?.publicMetadata.role as any} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center w-fit">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to={"/dashboard"}>Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Will update</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
