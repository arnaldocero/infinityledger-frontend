import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbSpinnerModule } from '@nebular/theme';

import { BalanceComprobacionComponent } from './balance-comprobacion/balance-comprobacion.component';
import { BalanceGeneralComponent } from './balance-general/balance-general.component';
import { EstadoResultadosComponent } from './estado-resultados/estado-resultados.component';
import { LibroDiarioComponent } from './libro-diario/libro-diario.component';
import { LibroMayorComponent } from './libro-mayor/libro-mayor.component';
import { SaldosMensualesComponent } from './saldos-mensuales/saldos-mensuales.component';

const routes: Routes = [
  { path: 'libro-diario', component: LibroDiarioComponent },
  { path: 'libro-mayor', component: LibroMayorComponent },
  { path: 'balance-comprobacion', component: BalanceComprobacionComponent },
  { path: 'estado-resultados', component: EstadoResultadosComponent },
  { path: 'balance-general', component: BalanceGeneralComponent },
  { path: 'saldos-mensuales', component: SaldosMensualesComponent },
  { path: '', redirectTo: 'balance-comprobacion', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    BalanceComprobacionComponent,
    BalanceGeneralComponent,
    EstadoResultadosComponent,
    LibroDiarioComponent,
    LibroMayorComponent,
    SaldosMensualesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbSpinnerModule,
  ],
})
export class ReportesModule { }
