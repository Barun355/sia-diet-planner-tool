import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("", async (req, res) => {
  try {
    const team = await prisma.users.findMany({
      where: {
        role: "TEAM",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true
      }
    });

    if (team.length > 0) {
      res
        .json({
          data: team,
          message: "Team list found",
          error: null,
        })
        .status(200);
      return;
    }
  } catch (error) {
    res.json({
      data: null,
      message: "Server error",
      error: error instanceof Error ? error.message : "Server error",
    });
  }
});

export default router;
