import { BackHeader } from "@/components/navigation/BackHeader";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

export default function DataManagementPage() {
    return (
        <div className="flex flex-col h-screen bg-background">
            <BackHeader title="Données & Sauvegarde" fallback="/settings" />
            
            <div className="px-4 py-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/settings">Paramètres</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Données & Sauvegarde</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="grow overflow-y-auto p-4">
                <p className="text-sm text-muted-foreground">Export/Import JSON à venir...</p>
            </div>
        </div>
    );
}
