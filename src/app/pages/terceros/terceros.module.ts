import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule } from '@nebular/theme'; // <-- Importamos el módulo de Nebular
import { TercerosComponent } from './terceros.component';

const routes: Routes = [
  { path: '', component: TercerosComponent }
];

@NgModule({
  declarations: [TercerosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NbCardModule // <-- Lo agregamos a los imports
  ]
})
export class TercerosModule { }