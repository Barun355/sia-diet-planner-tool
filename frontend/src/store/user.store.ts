import type { ClientTableInterface, TeamInterface, UserInterface,  } from "@/types";
import type { UserResource } from "@clerk/types";
import { create } from "zustand";

type UserRole = "admin" | "team" | "client";

interface UserState {
  user: UserResource | undefined;
  clientList: ClientTableInterface[];
  teamList: TeamInterface[];
  userList: UserInterface[],
  setUser: (user: UserResource) => void;
  getCurrentUserRole: () => UserRole | null;
  setUserList: (userList: UserInterface[]) => void;
  setClientList: (clientList: ClientTableInterface[]) => void;
  setTeamList: (teamList: TeamInterface[]) => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: undefined,
  userList: [],
  clientList: [],
  teamList: [],
  setUser(user) {
    set((_) => ({ user }));
  },
  getCurrentUserRole() {
    const { user } = get();
    if (!user) return null;

    const role = user.publicMetadata?.role as UserRole;

    return role || null;
  },
  setUserList(userList) {
    const { user } = get();

    const role = user?.publicMetadata?.role as UserRole;

    if (role === "admin") {
      console.log(userList);
      set((_) => ({ userList }));
    }
  },
  setClientList(clientList) {
    const { user } = get();

    const role = user?.publicMetadata?.role as UserRole;

    if (role === "team" || role === "admin") {
      console.log(clientList);
      set((_) => ({ clientList }));
    }
  },
  setTeamList(teamList) {
    const { user } = get();

    const role = user?.publicMetadata?.role as UserRole;

    if (role === "team" || role === "admin") {
      console.log(teamList);
      set((_) => ({ teamList }));
    }
  },
}));
