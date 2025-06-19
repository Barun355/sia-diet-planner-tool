import { Router } from "express";
import { prisma } from "../db";
import { clerkClient, getAuth } from "@clerk/express";
import { RoleType } from "../types";
import { authorize } from "../middleware/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", authorize(["admin", "team"]), async (req, res) => {
  const { userId } = getAuth(req);
  const role = (await clerkClient.users.getUser(userId!)).publicMetadata
    ?.role as RoleType;

  console.log(role);

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
    }));

    res
      .json({
        data:
          role === "admin"
            ? mapClient
            : mapClient.filter((client) => client.coachId === userId),
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

router.post("/", authorize(["team"]), async (req, res) => {
  const { firstName, lastName, email, contactNumber, coachId } = req.body;

  if (!firstName && !lastName && !email && !contactNumber && !coachId) {
    res
      .json({
        data: null,
        message:
          "FirstName, LastName, Email, Assign Coach ID & ContactNumber are required",
        error:
          "FirstName, LastName, Email, Assign Coach ID & ContactNumber are required",
      })
      .status(401);
    return;
  }

  try {
    const existingClient = await prisma.users.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        client: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log(existingClient);
    if (existingClient?.id && existingClient.client?.id) {
      res
        .json({
          data: null,
          message: "Client already exists",
          error: "Client already exists",
        })
        .status(401);
      return;
    }

    console.log(
      typeof [contactNumber],
      typeof contactNumber,
      String(contactNumber)
    );

    const clerkUser = await clerkClient.users.createUser({
      firstName: firstName[0].toUpperCase() + firstName.slice(1, firstName.length).toLowerCase(),
      lastName: lastName[0].toUpperCase() + lastName.slice(1, lastName.length).toLowerCase(),
      username: firstName.toLowerCase().replaceAll(' ', '') + "_" + lastName.toLowerCase().replaceAll(' ', ''),
      password: firstName[0].toUpperCase() + firstName.slice(1, firstName.length).toLowerCase(),
      emailAddress: [email],
      skipPasswordChecks: true,
      publicMetadata: {
        role: Role.CLIENT.toLowerCase(),
      },
    });
    console.log("Client route POST: ", clerkUser);
    if (clerkUser.id) {
      const newUser = await prisma.users.create({
        data: {
          id: clerkUser.id,
          firstName: clerkUser?.firstName!,
          lastName: clerkUser?.lastName!,
          email: clerkUser?.emailAddresses[0].emailAddress,
          contactNumber: contactNumber,
          createdAt: new Date(clerkUser.createdAt),
          role: "CLIENT",
        },
      });
      console.log("Client route POST: ", newUser);
      if (newUser.id) {
        const newClient = await prisma.clients.create({
          data: {
            userId: clerkUser.id,
            coachId,
          },
        });
        console.log("Client route POST: ", newClient);
        if (newClient.id) {
          res
            .json({
              data: newClient,
              messag: "Client created",
              error: null,
            })
            .status(200);
        }
      }
    }
  } catch (error) {
    console.log(error);
    res
      .json({
        data: null,
        message: "Client not created. Server error",
        error: error instanceof Error ? error.message : "Server error",
      })
      .status(500);
    return;
  }
});

export default router;
