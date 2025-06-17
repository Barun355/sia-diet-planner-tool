import { GoogleGenAI, createUserContent } from "@google/genai";
import fs from "fs";
import { DietPlan } from "../types";

type ConfigType = {
  imagePath: string;
  mimeType: string;
};

type ImageDataType = {
  inlineData: {
    data: string;
    mimeType: any;
  };
};

const dailyMealSchema = {
  type: "object",
  properties: {
    "early-morning": {
      type: "object",
      properties: {
        diet: {
          type: "string",
          description: "The recommended diet for early morning.",
        },
        note: {
          type: "string",
          description: "Any additional notes for early morning diet.",
        },
      },
      required: ["diet", "note"],
    },
    breakfast: {
      type: "object",
      properties: {
        diet: {
          type: "string",
          description: "The recommended diet for breakfast.",
        },
        note: {
          type: "string",
          description: "Any additional notes for breakfast diet.",
        },
      },
      required: ["diet", "note"],
    },
    "mid-meal": {
      type: "object",
      properties: {
        diet: {
          type: "string",
          description: "The recommended diet for mid-meal.",
        },
        note: {
          type: "string",
          description: "Any additional notes for mid-meal diet.",
        },
      },
      required: ["diet", "note"],
    },
    lunch: {
      type: "object",
      properties: {
        diet: {
          type: "string",
          description: "The recommended diet for lunch.",
        },
        note: {
          type: "string",
          description: "Any additional notes for lunch diet.",
        },
      },
      required: ["diet", "note"],
    },
    "evening-snacks": {
      type: "object",
      properties: {
        diet: {
          type: "string",
          description: "The recommended diet for evening snacks.",
        },
        note: {
          type: "string",
          description: "Any additional notes for evening snacks diet.",
        },
      },
      required: ["diet", "note"],
    },
    dinner: {
      type: "object",
      properties: {
        diet: {
          type: "string",
          description: "The recommended diet for dinner.",
        },
        note: {
          type: "string",
          description: "Any additional notes for dinner diet.",
        },
      },
      required: ["diet", "note"],
    },
    "post-dinner": {
      type: "object",
      properties: {
        diet: {
          type: "string",
          description: "The recommended diet for post-dinner.",
        },
        note: {
          type: "string",
          description: "Any additional notes for post-dinner diet.",
        },
      },
      required: ["diet", "note"],
    },
  },
  required: [
    "early-morning",
    "breakfast",
    "mid-meal",
    "lunch",
    "evening-snacks",
    "dinner",
    "post-dinner",
  ],
  propertyOrdering: [
    "early-morning",
    "breakfast",
    "mid-meal",
    "lunch",
    "evening-snacks",
    "dinner",
    "post-dinner",
  ],
  additionalProperties: false,
  description: "Structure for a single day's meal plan.",
};

const dietPlanSchema = {
  type: "object",
  properties: {
    1: { ...dailyMealSchema, description: "Daily diet plan for day 1." },
    2: { ...dailyMealSchema, description: "Daily diet plan for day 2." },
    3: { ...dailyMealSchema, description: "Daily diet plan for day 3." },
    4: { ...dailyMealSchema, description: "Daily diet plan for day 4." },
    5: { ...dailyMealSchema, description: "Daily diet plan for day 5." },
    6: { ...dailyMealSchema, description: "Daily diet plan for day 6." },
    7: { ...dailyMealSchema, description: "Daily diet plan for day 7." },
  },
  required: ["1", "2", "3", "4", "5", "6", "7"],
  propertyOrdering: ["1", "2", "3", "4", "5", "6", "7"],
  additionalProperties: false,
  description: "A collection of daily diet plans, keyed by day number.",
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const getDetailsFromImage = async (config: ConfigType[]) => {

  const imagesData: ImageDataType[] = [];

  config.map((data) => {
    imagesData.push(fileToGenerativePart(data.imagePath, data.mimeType));
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: dietPlanSchema,
      },
      contents: createUserContent([
        "Extract the Diet plan from the provided images. There is a possibility that you get multiple images, where some data is in the 1st, some data is in 2nd and soo on. You need to figure out the diet plan for a week from the multiple images. If the image doesn't contain any weekly diet related infomation then throw an error with a message 'diet not found'.",
        ...imagesData,
      ]),
    });

    const dietPlan = response.text;

    if (!dietPlan) {
      return null;
    }

    return JSON.parse(dietPlan);
  } catch (error) {

    console.log("GEMINI Error: ", error);

  } finally {
    config.map((data) => {
      fs.unlink(data.imagePath, (err) => {
        if (err) {
          console.log(`File ${data.imagePath} deleted successfully.`);
        }
      });
    });
  }
};

function fileToGenerativePart(filePath: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
}
