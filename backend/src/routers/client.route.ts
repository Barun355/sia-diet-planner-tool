import { Router } from "express";
import { prisma } from "../db";
import { clerkClient, getAuth } from "@clerk/express"
import { RoleType } from "../types";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = getAuth(req)
  const role = (await clerkClient.users.getUser(userId!)).publicMetadata?.role as RoleType

  try {
    const clients = await prisma.clients.findMany({
      select: {
        id: true,
        coachId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!clients) {
      res
        .json({
          data: null,
          message: "No user found",
          error: "No user found",
        })
        .status(404);
    }

    const mapClient = clients.map((client) => ({
          id: client.id,
          userName: `${client.user.firstName.toLowerCase()}_${
            client.user.lastName
          }`,
          coachId: client.coachId,
        }))

    res
      .json({
        data: role === "admin" ? mapClient: mapClient.filter(client => client.coachId === userId),
        error: null,
        message: "client fetched success fully",
      })
      .status(200);
  } catch (error) {
    console.log(error);
    res
      .json({
        data: null,
        error: error instanceof Error ? error.message : "Server error",
        message: "client fetched success fully",
      })
      .status(500);
  }

  return;
});

export default router;
