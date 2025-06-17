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

export type RoleType = 'admin' | 'client' | 'team'