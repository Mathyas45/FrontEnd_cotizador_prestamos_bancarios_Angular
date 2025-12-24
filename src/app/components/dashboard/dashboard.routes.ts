import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";

export const dashboard: Routes = [
    {
        path: '',
        component: DashboardComponent,
        data: {
            pageTitle: "Dashboard",
            title: "Dashboard Principal",
            breadcrumb: "Dashboard"
        },
    }
]