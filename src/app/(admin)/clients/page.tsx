// app/(dashboard)/page.tsx
import { ClientsTable } from "@/components/admin/clients";
// import Docs from "./Docs"; // Uncomment if using in-app documentation

export default function ClientsPage() {
    return (
        <div className="space-y-8">
            <ClientsTable />
            {/* <Docs /> */}
        </div>
    );
}
