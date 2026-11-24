import { contenidoCsv } from './exportar-csv';

describe('contenidoCsv', () => {
  it('usa punto y coma, coma decimal y comillas cuando hacen falta', () => {
    const csv = contenidoCsv(['Código', 'Cuenta', 'Valor'], [
      ['110505', 'Caja; general', 1190000.5],
      ['1105', 'Dice "hola"', null],
    ]);

    expect(csv).toBe('Código;Cuenta;Valor\r\n110505;"Caja; general";1190000,50\r\n1105;"Dice ""hola""";');
  });
});
