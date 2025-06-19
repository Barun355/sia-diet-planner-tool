import NotFoundMeal from "@/components/meals/NotFoundMeal";
import TeamMeal from "@/components/meals/TeamMeal";
import { useUserStore } from "@/store/user.store";

const Meals = () => {
  const { getCurrentUserRole } = useUserStore();

  switch (getCurrentUserRole()) {
    case "team":
      return <TeamMeal />;
    default:
      return <NotFoundMeal />;
  }
};

export default Meals;
