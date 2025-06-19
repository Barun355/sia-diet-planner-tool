export type RoleType = "admin" | "client" | "team";

export type MealDetail = {
  diet: string;
  note: string;
};

export type DailyMealPlan = {
  "early-morning": MealDetail;
  breakfast: MealDetail;
  "mid-meal": MealDetail;
  lunch: MealDetail;
  "evening-snacks": MealDetail;
  dinner: MealDetail;
  "post-dinner": MealDetail;
};

export type DietPlan = {
  "1": DailyMealPlan;
  "2": DailyMealPlan;
  "3": DailyMealPlan;
  "4": DailyMealPlan;
  "5": DailyMealPlan;
  "6": DailyMealPlan;
  "7": DailyMealPlan;
};

export interface MealPlans {
  id: string;
  meals: DietPlan;
  createdBy: string;
  clientId: string;

  createdAt: Date;
  updatedAt?: Date;
}

export interface UserInterface {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: RoleType;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientInterface {
  id: string;
  coachId: string;
  clientMean: MealPlans[];
  user: UserInterface;
}

export interface ClientTableInterface {
  id: string;
  coachId: string;
  userName: string;
}

export interface TeamInterface {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string
}