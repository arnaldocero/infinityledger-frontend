import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanCuentasComponent } from './plan-cuentas.component';

const routes: Routes = [
  {
    path: '',
    component: PlanCuentasComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanCuentasRoutingModule { }