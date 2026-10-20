import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule } from '@nebular/theme'; // <-- Importamos el módulo de Nebular
import { AsientosComponent } from './asientos.component';

const routes: Routes = [
  { path: '', component: AsientosComponent }
];

@NgModule({
  declarations: [AsientosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NbCardModule // <-- Lo agregamos a los imports
  ]
})
export class AsientosModule { }