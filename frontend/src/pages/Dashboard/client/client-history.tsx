import { BACKEND_BASE_ROUTE } from "@/lib/constant";
import GlobalErrorPage from "@/pages/global-error";
import type { MealPlans } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner";

const ClientHistory = () => {

    const [searchParams] = useSearchParams()
    const clientId = searchParams.get('clientId');
    const { getToken } = useAuth()


    const [clientHistory, setClientHistory] = useState<MealPlans>()


    useEffect(() => {
        (async () => {
            try {
                const token = await getToken()
                const res: any = await axios.get(`${BACKEND_BASE_ROUTE}`, {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })
                console.log(res.data)
                if (res.data.data){
                    setClientHistory(res.data.data)
                } else {
                    toast.error(res.data.message)
                }
            } catch (error) {
                console.log(error)
                toast.error("Server error")
            }
        })()
    }, [])

    if (!clientId || !clientHistory ) return <GlobalErrorPage />
  return (
    <div>
        Client History {clientId}
    </div>
  )
}

export default ClientHistory
