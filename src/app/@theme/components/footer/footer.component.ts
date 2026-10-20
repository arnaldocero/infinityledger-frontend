import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">CodeLedger · Sistema contable · {{ anio }}</span>
  `,
})
export class FooterComponent {
  anio = new Date().getFullYear();
}
