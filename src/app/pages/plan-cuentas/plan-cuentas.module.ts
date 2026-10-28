import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <--- Importante para [(ngModel)]
import { NbCardModule, 
  NbIconModule, 
  NbButtonModule, 
  NbInputModule,
  NbDialogModule,
  NbSelectModule,
  NbCheckboxModule,
  NbSpinnerModule } from '@nebular/theme';

import { PlanCuentasRoutingModule } from './plan-cuentas-routing.module';
import { PlanCuentasComponent } from './plan-cuentas.component';

@NgModule({
  declarations: [
    PlanCuentasComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // <--- Importante para formGroup
    PlanCuentasRoutingModule,
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
    NbDialogModule.forChild(), // <--- Habilita modales en este módulo
    NbSelectModule,
    NbCheckboxModule,
    NbSpinnerModule,
  ],
})
export class PlanCuentasModule { }