import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDialogModule,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule,
} from '@nebular/theme';

import { CentrosCostoComponent } from './centros-costo.component';

const routes: Routes = [
  { path: '', component: CentrosCostoComponent },
];

@NgModule({
  declarations: [CentrosCostoComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbDialogModule.forChild(),
    NbIconModule,
    NbInputModule,
    NbSpinnerModule,
  ],
})
export class CentrosCostoModule { }
