import { digitoVerificacion, documentoCompleto } from './tercero.model';

describe('tercero.model', () => {
  it('calcula el dígito de verificación igual que la DIAN y la API', () => {
    expect(digitoVerificacion('800197268')).toBe(4); // DIAN
    expect(digitoVerificacion('860034313')).toBe(7); // Davivienda
    expect(digitoVerificacion('900123456')).toBe(8);
  });

  it('no calcula el dígito para textos no numéricos', () => {
    expect(digitoVerificacion('')).toBeNull();
    expect(digitoVerificacion('900.123.456')).toBeNull();
  });

  it('muestra el documento con su dígito solo si lo tiene', () => {
    expect(documentoCompleto({ numeroDocumento: '900123456', digitoVerificacion: 8 })).toBe('900123456-8');
    expect(documentoCompleto({ numeroDocumento: '1234567', digitoVerificacion: null })).toBe('1234567');
  });
});
