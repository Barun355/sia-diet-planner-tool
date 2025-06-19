import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BACKEND_BASE_ROUTE, ROUTE_MEAL_PLAN } from "@/lib/constant";
import { useUserStore } from "@/store/user.store";
import type { DietPlan, MealPlans } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Download, ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";
import { Link } from "react-router-dom";

const ClientHistory = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  const { getToken } = useAuth();

  const clientList = useUserStore((state) => state.clientList);
  const teamList = useUserStore((state) => state.teamList);
  const currentUser = useUserStore((state) => state.user);
  const role = currentUser?.publicMetadata.role;

  const [clientDetail, setClientDetail] = useState({ name: "" });
  const [clientHistory, setClientHistory] = useState<MealPlans[] | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<DietPlan | null>(null);

  useEffect(() => {
    clientList.find((client) => {
      if (client.id === clientId) {
        setClientDetail((prev) => ({ ...prev, name: client.userName }));
        return true;
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res: any = await axios.post(
          `${BACKEND_BASE_ROUTE}/${ROUTE_MEAL_PLAN}/history/${clientId}`,
          null,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.data) {
          var data: MealPlans[] = [];
          res.data.data?.map((item: any) =>
            data.push({
              ...item,
              meals: JSON.parse(item.meals),
            })
          );
          console.log(data);
          setClientHistory(data);
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Server error");
      }
    })();
  }, []);

  if (currentMealPlan)
    return (
      <MealPlanTemplate
        clientName={clientDetail.name}
        item={currentMealPlan}
        onClose={() => setCurrentMealPlan(null)}
      />
    );
  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="flex gap-4 justify-between items-center w-full">
        <Input placeholder={`Filter by username`} className="max-w-sm" />
        {role === "team" && (
          <Link to={"/dashboard/meals"}>
            <Button variant="outline">Create Meal Plan</Button>
          </Link>
        )}
      </div>
      <div className="w-full h-full flex flex-col gap-4 mt-2">
        <Label>{clientDetail?.name} Meal History</Label>

        <div className="rounded-md w-full h-fit flex flex-col justify-center items-center gap-6">
          {!clientHistory &&
            [1, 2, 3, 4].map((el) => (
              <Skeleton
                className="h-10 w-full rounded-md border py-12"
                key={el}
              />
            ))}
          {clientHistory?.length === 0 && (
            <Label className="text-lg md:text-xl font-semibold text-orange-400">
              {clientDetail.name} client has no meal plan history
            </Label>
          )}
          {clientHistory &&
            clientHistory.length > 0 &&
            clientHistory?.map((history) => (
              <div className="w-full h-fit border rounded-md py-6 px-3 bg-sidebar text-sidebar-foreground flex justify-between">
                <div className="flex flex-col gap-0 justify-center items-start">
                  <div className="flex gap-2">
                    <Label>Created By:</Label>
                    <span>
                      {teamList
                        ? teamList.find((team) => team.id === history.createdBy)
                            ?.firstName
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Label>Created At:</Label>
                    <span>
                      {new Date(history.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-4 items-end">
                  <ExternalLink
                    onClick={(_) => setCurrentMealPlan(history.meals)}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

function MealPlanTemplate({
  clientName,
  item,
  onClose,
}: {
  clientName: string;
  item: DietPlan;
  onClose: () => void;
}) {
  const dietContainerRef = useRef<HTMLDivElement>(null);
  const dietContainer = useCallback(
    (node: HTMLDivElement) => {
      if (node === null) {
        return;
      }

      if (item === null) return;

      var dietWeeklyPlan = ``;
      Object.keys(item)?.forEach((day) => {
        dietWeeklyPlan = dietWeeklyPlan + dailyMealTemplate(day);
      });

      const fag = document
        .createRange()
        .createContextualFragment(dietWeeklyPlan);
      console.log(typeof fag, fag);
      node.appendChild(fag);
      dietContainerRef.current = node;
    },
    [item]
  );

  const weekMap: any = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
  };

  async function downloadMealPlan(
    el: HTMLDivElement,
    fileName: string,
    filetype: "png" | "jpeg" | "jpg"
  ) {
    if (!el) {
      toast.info("Wait for Meal plan to render");
      return;
    }
    if (!fileName && !filetype) {
      toast.info("Filename & Filetype is required.");
      return;
    }

    console.log(el);
    var image;

    switch (filetype) {
      case "png":
        image = await htmlToImage.toPng(el, {
          width: el.scrollWidth,
          height: el.scrollHeight,
          quality: 1,
        });
        break;
      case "jpeg":
        image = await htmlToImage.toJpeg(el, {
          width: el.scrollWidth,
          height: el.scrollHeight,
          quality: 1,
        });
        break;
      case "jpg":
        image = await htmlToImage.toJpeg(el, {
          width: el.scrollWidth,
          height: el.scrollHeight,
          quality: 1,
        });
        break;
      default:
        toast.info("Imag type not supported");
        return;
    }

    const downloadLink = window.document.createElement("a");
    downloadLink.href = image;
    downloadLink.download = fileName;
    downloadLink.style = "display: none;";

    console.log(downloadLink);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    downloadLink.remove();
  }

  function dailyMealTemplate(day: string) {
    const dayHeading = `
              <div class="bg-orange-600 py-4 px-6">
                <span class="text-orange-50 font-bold">${weekMap[day]}</span>
              </div>
          `;
    var dietMeal = ``;

    const meals = (item as any)[day];

    Object.keys(meals).forEach((meal) => {
      dietMeal =
        dietMeal +
        `
                  <div class="bg-white p-2 h-full w-full">
                    <span class="w-[19rem] h-full break-all text-center text-balance hyphens-manual flex justify-center items-center">${meals[meal].diet}</span>
                  </div>
              `;
    });

    return `
          <div
              class="*:rounded-md *:flex *:justify-center *:items-center gap-4 *:font-semibold justify-center items-center w-fit"
              style="display: grid; grid-template-rows: 3rem 1fr 1fr 1fr 1fr 1fr 1fr 1fr; grid-template-columns: 1fr;"
          >
              ${dayHeading}
              ${dietMeal}
          </div>
        `;
  }

  return (
    <div className="fixed top-0 left-0 h-svh w-full z-50 overflow-auto">
      <div className="h-fit w-fit py-2 px-4 rounded-md border-2 bg-background text-foreground fixed top-4 right-4 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex justify-end items-center"
              variant={"outline"}
            >
              Download
              <Download />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="start">
            {["jpg", "png"].map((type) => (
              <DropdownMenuItem
                onClick={() =>
                  downloadMealPlan(
                    dietContainerRef?.current!,
                    `${new Date().toTimeString()}-${clientName}-meal-plan.${type}`,
                    type as any
                  )
                }
              >
                {type}
                <DropdownMenuShortcut>
                  {" "}
                  <Download />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div
          className="p-1 border rounded-full h-fit w-fit cursor-pointer"
          onClick={onClose}
        >
          <X />
        </div>
      </div>
      <div
        className="bg-[#FAE1CE] gap-6 p-4 overflow-auto w-full h-full"
        id="diet-container"
        ref={dietContainer}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        }}
      >
        <div
          className="*:rounded-md *:flex *:justify-center *:items-center gap-4 *:font-semibold justify-center items-center"
          style={{
            display: "grid",
            gridTemplateRows: "3rem 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
            gridTemplateColumns: "1fr",
          }}
          id="diet-heading"
        >
          <div className="py-4 px-2 h-8 overflow-none w-48 flex justify-center items-center">
            <img
              src="/sia-health-logo.avif"
              alt="SIA Health Logo"
              className="rounded-md bg-cover w-full"
            />
          </div>
          <div className="bg-orange-300 p-8 text-xl text-center h-full w-full">
            <span className="text-orange-900 font-bold text-2xl">
              Early Morning
            </span>
          </div>
          <div className="bg-orange-300 p-8 text-xl text-center h-full w-full">
            <span className="text-orange-900 font-bold text-2xl">
              Breakfast
            </span>
          </div>
          <div className="bg-orange-300 p-8 text-xl text-center h-full w-full">
            <span className="text-orange-900 font-bold text-2xl">Mid Meal</span>
          </div>
          <div className="bg-orange-300 p-8 text-xl text-center h-full w-full">
            <span className="text-orange-900 font-bold text-2xl">Lunch</span>
          </div>
          <div className="bg-orange-300 p-8 text-xl text-center h-full w-full">
            <span className="text-orange-900 font-bold text-2xl">
              Evening Snacks
            </span>
          </div>
          <div className="bg-orange-300 p-8 text-xl text-center h-full w-full">
            <span className="text-orange-900 font-bold text-2xl">Dinner</span>
          </div>
          <div className="bg-orange-300 p-8 text-xl text-center h-full w-full">
            <span className="text-orange-900 font-bold text-2xl">
              Post Dinner
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientHistory;
