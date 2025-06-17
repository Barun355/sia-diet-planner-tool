import FileImport from "@/components/ui/FileImport";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BACKEND_BASE_ROUTE, ROUTE_MEAL_PLAN } from "@/lib/constant";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/store/user.store";
import { useAuth } from "@clerk/clerk-react";

const newMealPlanSchema = z.object({
  clienId: z.string(),
});

const TeamMeal = () => {
  const [dietImages, setDietImages] = useState<File[] | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const clientList = useUserStore(state => state.clientList)
  const { getToken } = useAuth()

  const form = useForm<z.infer<typeof newMealPlanSchema>>({
    resolver: zodResolver(newMealPlanSchema),
    defaultValues: {
      clienId: "",
    },
  });

  const handleSubmitForm = async (
    values: z.infer<typeof newMealPlanSchema>
  ) => {
    setIsLoadingForm(true);
    if (dietImages?.length === 0) {
      toast.info("Select images first.");
    }

    try {
      const formData = new FormData();
      const clienId = values.clienId;

      if (!clienId) {
        toast.info("Select client first")
        return;
      }
      formData.append("clientId", clienId);
      dietImages?.map((image) => {
        formData.append("diet-images", image);
      });

      console.log(`${BACKEND_BASE_ROUTE}/${ROUTE_MEAL_PLAN}`);

      const token = await getToken();

      const res: any = await axios.post(
        `${BACKEND_BASE_ROUTE}/${ROUTE_MEAL_PLAN}/new`,
        formData,
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      console.log(res.data);
      if (res.data.error) {
        toast.error(res.data.message);
      }

      toast.success(res.data.message);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message ? error.message : "Server side error");
    } finally {
      setIsLoadingForm(false);
      setDietImages(null)
      form.resetField("clienId");
    }
  };

  return (
    <div className="w-full h-full bg-orange-50 border rounded-lg p-4 flex flex-col gap-4 justify-center items-center">
      <div className="flex flex-col gap-2">
        <Label>Excel Screen Shot.</Label>
        <FileImport
          acceptedExtensions={[".jpg", ".jpeg", ".png"]}
          acceptedTypes={["image/jpeg", "image/png"]}
          onFileRemove={() => setDietImages(null)}
          onFileSelect={(files) => setDietImages(files)}
        />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmitForm)}
          className="space-y-8 w-[18rem] md:w-[26rem]"
        >
          <FormField
            control={form.control}
            name="clienId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {
                      clientList && clientList.length > 0 && clientList.map(client => (
                        <SelectItem value={client.id} key={client.id}>{client.userName}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormDescription>Please select the Client.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" loading={isLoadingForm}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TeamMeal;
