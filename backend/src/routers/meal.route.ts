import { Router } from "express";
import { getDetailsFromImage } from "../service/gemini";
import { DietPlan } from "../types";
import { prisma } from "../db";
import { getAuth } from "@clerk/express";

const router = Router();

router.post("/new", async (req, res) => {
  const dietImages = req.files as Express.Multer.File[];
  const { clientId } = req.body;

  console.log(dietImages, clientId)

  if (!dietImages || dietImages.length === 0) {
    res.status(400).json({
      data: null,
      message: "No files uploaded.",
      error: "Please upload the images to extract the data from.",
    });
    return;
  }

  if (!clientId) {
    res.status(400).json({
      data: null,
      message: "Please select client",
      error: "Client need to be selected",
    });
    return;
  }

  const config = dietImages.map((image: any) => ({
    imagePath: image.path,
    mimeType: image.mimetype,
  }));

  try {
    const response: DietPlan | null = await getDetailsFromImage(config);

    if (!response) {
      res
        .json({
          data: null,
          error: "Gemini response not working",
          message: "Gemini not working.",
        })
        .status(500);
      return;
    }
    const { userId } = getAuth(req);
    console.log(typeof response, response)
    const mealPlan = await prisma.mealPlans.create({
      data: {
        createdBy: userId as any,
        clientId,
        meals: JSON.stringify(response),
      },
    });

    console.log(mealPlan)

    if (mealPlan.id) {
      res
        .json({
          data: mealPlan.meals,
          error: null,
          message: "Meal router working",
        })
        .status(200);
      return;
    }
  } catch (error: any) {
    console.log(error)
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

router.post("/history/:clientId", async (req, res) => {

  const { clientId } = req.params;

  const mealHistory = await prisma.mealPlans.findMany({
    where: {
      clientId,
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  res.json({
    data: mealHistory,
    message: "History retrevied",
    error: null
  })
  return;

})

export default router;
