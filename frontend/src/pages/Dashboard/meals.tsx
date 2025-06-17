import AdminMeal from "@/components/meals/AdminMeal";
import NotFoundMeal from "@/components/meals/NotFoundMeal";
import TeamMeal from "@/components/meals/TeamMeal";
import { useUserStore } from "@/store/user.store";

const Meals = () => {
  const { getCurrentUserRole } = useUserStore();

  console.log(getCurrentUserRole());

  switch (getCurrentUserRole()) {
    case "admin":
      return <AdminMeal />;
      break;
    case "team":
      return <TeamMeal />;
      break;

    default:
      return <NotFoundMeal />;
  }
};

export default Meals;
