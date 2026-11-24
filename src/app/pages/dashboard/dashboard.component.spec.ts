import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../@core/services/auth.service';
import { Dashboard, ReportesService } from '../reportes/reportes.service';
import { DashboardComponent } from './dashboard.component';

const DATOS: Dashboard = {
  fecha: '2026-10-20', periodo: 'octubre 2026', estadoPeriodo: 'ABIERTO',
  asientosPublicadosMes: 2, borradores: 1,
  efectivo: 11_490_000, cuentasPorCobrar: 0, cuentasPorPagar: 200_000,
  ingresosAnio: 1_190_000, gastosAnio: 200_000, utilidadAnio: 990_000,
  meses: Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, ingresos: i === 9 ? 1_190_000 : 0, gastos: i === 9 ? 200_000 : -50 })),
  ultimosAsientos: [],
};

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let reportes: jasmine.SpyObj<ReportesService>;

  async function crear() {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: ReportesService, useValue: reportes },
        { provide: AuthService, useValue: { getUsuario: () => ({ nombre: 'Admin', rol: 'ADMIN' }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideTemplate(DashboardComponent, '').compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    reportes = jasmine.createSpyObj('ReportesService', ['dashboard']);
  });

  it('escala las barras contra el mes más alto y no dibuja negativos', async () => {
    reportes.dashboard.and.returnValue(of(DATOS));
    await crear();
    const componente = fixture.componentInstance;

    expect(componente.maximoMensual).toBe(1_190_000);
    expect(componente.alto(1_190_000)).toBe(100);
    expect(componente.alto(200_000)).toBeCloseTo(16.8, 1);
    expect(componente.alto(-50)).toBe(0);
    expect(componente.alto(1)).toBe(2); // mínimo visible
  });

  it('muestra el error si la API no responde', async () => {
    reportes.dashboard.and.returnValue(throwError(new HttpErrorResponse({ status: 0 })));
    await crear();

    expect(fixture.componentInstance.error).toBe('No se pudo conectar con el servidor.');
  });
});
