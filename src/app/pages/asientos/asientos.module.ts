import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbSelectModule,
  NbSpinnerModule,
} from '@nebular/theme';

import { AsientosListaComponent } from './lista/asientos-lista.component';
import { AsientoEditorComponent } from './editor/asiento-editor.component';

const routes: Routes = [
  { path: '', component: AsientosListaComponent },
  { path: 'nuevo', component: AsientoEditorComponent },
  { path: ':id', component: AsientoEditorComponent },
];

@NgModule({
  declarations: [AsientosListaComponent, AsientoEditorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbSpinnerModule,
  ],
})
export class AsientosModule { }
