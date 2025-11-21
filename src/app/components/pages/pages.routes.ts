import { Routes } from "@angular/router";

import { SamplePage1Component } from "./sample-page-1/sample-page-1.component";
import { SamplePage2Component } from "./sample-page-2/sample-page-2.component";


export const pages: Routes = [
    {
        path: 'sample-page-1',
        component: SamplePage1Component,
        data: {
            title:'Sample Page 1',
            breadcrumb: 'Sample Page 1'
        }
    },
    {
        path: 'sample-page-2',
        component: SamplePage2Component,
        data: {
            title:'Sample Page 2',
            breadcrumb: 'Sample Page 2'
        }
    }
]