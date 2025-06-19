import type { MealPlans } from "@/types";
import { create } from "zustand";


interface MealState {
    meals: MealPlans[],
    setDietPlan: (dietPlan: MealPlans[]) => void
}

export const useMealStore = create<MealState>()((set) => ({
    meals: [],
    setDietPlan(dietPlan) {
        set({ meals: dietPlan })
    },
}))