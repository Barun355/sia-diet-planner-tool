import type { ClientTableInterface } from "@/types";
import type { UserResource } from "@clerk/types";
import { create } from "zustand";

type UserRole = "admin" | "team" | "client";

interface UserState {
  user: UserResource | undefined;
  clientList: ClientTableInterface[];
  setUser: (user: UserResource) => void;
  getCurrentUserRole: () => UserRole | null;
  setClientList: (clientList: ClientTableInterface[]) => void
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: undefined,
  clientList: [],
  setUser(user) {
    set((_) => ({ user }));
  },
  getCurrentUserRole() {
    const { user } = get();
    if (!user) return null;

    const role = user.publicMetadata?.role as UserRole;

    return role || null;
  },
  setClientList(clientList) {
    const { user } = get();

    const role = user?.publicMetadata?.role as UserRole;

    if (role === "team" || role === "admin") {
      console.log(clientList)
      set(_ => ({ clientList }))
    }
  },
}));
