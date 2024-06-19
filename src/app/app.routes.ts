import { Routes } from '@angular/router';
import { TravelsComponent } from './Pages/travels/travels.component';

export const routes: Routes = [
  { path: '', component: TravelsComponent },
  { path: 'home', component: TravelsComponent },
];
