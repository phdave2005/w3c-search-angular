import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { AboutComponent } from '../components/about/about.component';
import { HelpComponent } from '../components/help/help.component';
import { SettingsComponent } from '../components/settings/settings.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/w3-search-angular',
        pathMatch: 'full'
    },
    {
        path: 'w3c-search-angular',
        component: HomeComponent
    },
    {
        path: 'w3c-search-angular/about',
        component: AboutComponent
    },
    {
        path: 'w3c-search-angular/help',
        component: HelpComponent
    },
    {
        path: 'w3c-search-angular/settings',
        component: SettingsComponent
    }
];
