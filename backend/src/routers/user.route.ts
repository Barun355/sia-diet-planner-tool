import { Router } from "express";
import { prisma } from "../db";
import { clerkClient } from "@clerk/express";

const router = Router();

router.get("", async (_, res) => {
  try {
    const users = await prisma.users.findMany();

    if (users.length > 0) {
      console.log(users);
      res
        .json({
          data: users,
          message: "Users retrived",
          error: null,
        })
        .status(200);
      return;
    }

    res
      .json({
        data: null,
        message: "No users in the Platform",
        error: "No users in the platform",
      })
      .status(404);
    return;
  } catch (error) {
    res
      .json({
        data: null,
        message: "Server error",
        error: error instanceof Error ? error.message : "Server error",
      })
      .status(500);
    return;
  }
});

router.post("", async (req, res) => {
  const { firstName, lastName, email, role, contactNumber } = req.body;

  if (!firstName && !lastName && !email && !contactNumber && !role) {
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
    const existingUser = await prisma.users.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    console.log(existingUser);
    if (existingUser?.id) {
      res
        .json({
          data: null,
          message: "User already exists",
          error: "User already exists",
        })
        .status(401);
      return;
    }

    const clerkUser = await clerkClient.users.createUser({
      firstName: firstName[0].toUpperCase() + firstName.slice(1, firstName.length).toLowerCase(),
      lastName: lastName[0].toUpperCase() + lastName.slice(1, lastName.length).toLowerCase(),
      username: firstName.toLowerCase().replaceAll(' ', '') + "_" + lastName.toLowerCase().replaceAll(' ', ''),
      password: firstName[0].toUpperCase() + firstName.slice(1, firstName.length).toLowerCase(),
      emailAddress: [email],
      skipPasswordChecks: true,
      publicMetadata: {
        role,
      },
    });
    console.log("User route POST: ", clerkUser);
    if (clerkUser.id) {
      const newUser = await prisma.users.create({
        data: {
          id: clerkUser.id,
          firstName: clerkUser?.firstName!,
          lastName: clerkUser?.lastName!,
          email: clerkUser?.emailAddresses[0].emailAddress,
          contactNumber: contactNumber,
          createdAt: new Date(clerkUser.createdAt),
          role: role === "team" ? "TEAM" : "ADMIN",
        },
      });
      console.log("User route POST: ", newUser);
      res
        .json({
          data: newUser,
          messag: "Client created",
          error: null,
        })
        .status(200);
    }
  } catch (error) {
    console.log(error);
    res
      .json({
        data: null,
        message: "User not created. Server error",
        error: error instanceof Error ? error.message : "Server error",
      })
      .status(500);
    return;
  }
});

router.post("/assign", async (req, res) => {

  const { teamId, clientId } = req.body;

  if (!clientId && !teamId) {
    res.json({
      data: null,
      message: "Client Id and Team Id are required",
      error: "Client Id and Team Id are required"
    }).status(403)
    return
  }

  try {
    const existingTeam = await prisma.users.findFirst({
      where: {
        id: teamId
      },
      select: {
        id: true,
        role: true
      }
    })
  
    if (!existingTeam?.id) {
      res.json({
        data: null,
        message: "Team Member not found",
        error: "Team Member not found"
      }).status(403)
      return
    }
    
    if (existingTeam.role !== "TEAM") {
      res.json({
        data: null,
        message: "User is not the team member",
        error: "User is not the team member"
      }).status(403)
      return
    }
  
    const existingClient = await prisma.clients.findFirst({
      where: {
        id: teamId
      },
      select: {
        id: true
      }
    })
  
    if (!existingClient?.id) {
      res.json({
        data: null,
        message: "Client not found",
        error: "Client not found"
      }).status(403)
      return
    }
  
    const assignedClient = await prisma.clients.update({
      where: {
        id: clientId
      },
      data: {
        coachId: teamId
      }
    })
  
    if (!assignedClient.coachId) {
      res.json({
        data: null,
        message: "Client not assigned to team member",
        error: "Client not assigned to team member"
      }).status(403)
      return
    }
  
    res.json({
      data: assignedClient,
      message: "Client is assigned to Coach",
      error: null
    })
    return
  } catch (error) {
    res.json({
      data: null,
      message: "Server error",
      error: error instanceof Error ? error.message: "Server error"
    })
  }
  
})

export default router;
