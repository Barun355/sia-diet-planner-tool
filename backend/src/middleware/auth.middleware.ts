import { Request, Response, NextFunction } from "express";
import { RoleType } from "../types";
import { clerkClient, getAuth } from "@clerk/express";

export const authorize = (roles: RoleType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        console.log(userId)
        if (!userId) {
          res.json({
            data: null,
            message: "Please login first",
            error: "User need to sigin first to get access to this route",
          }).status(401);
          return;
        }
        const { publicMetadata } = await clerkClient.users.getUser(userId);
        const role = publicMetadata?.role as RoleType;

        if (roles.includes(role)) {
          next();
        } else {
          res.json({
            data: null,
            message: "Don't have access to this route",
            error: "User don't have access to this route.",
          }).status(401);
          return;
        }
    } catch (error) {
        res.json({
            data: null,
            message: "Server error",
            error: "Server error"
        }).status(500)
    }
  };
};
