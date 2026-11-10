import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  NbButtonModule,
  NbCardModule,
  NbDialogModule,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule,
} from '@nebular/theme';

import { TiposComprobanteComponent } from './tipos-comprobante.component';

const routes: Routes = [
  { path: '', component: TiposComprobanteComponent },
];

@NgModule({
  declarations: [TiposComprobanteComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbButtonModule,
    NbCardModule,
    NbDialogModule.forChild(),
    NbIconModule,
    NbInputModule,
    NbSpinnerModule,
  ],
})
export class TiposComprobanteModule { }
