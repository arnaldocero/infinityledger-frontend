import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule, NbIconModule, NbButtonModule, NbInputModule } from '@nebular/theme';

import { UsuariosRoutingModule } from './usuarios-routing.module';
import { UsuariosComponent } from './usuarios.component';

@NgModule({
  declarations: [
    UsuariosComponent,
  ],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
  ],
})
export class UsuariosModule { }