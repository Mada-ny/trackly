import { Outlet } from "react-router-dom";
import { BackHeader } from "@/components/navigation/BackHeader";

export default function TransactionsFormLayout() {
    return(
        <>
            <BackHeader />
            <Outlet />
        </>
    )
}