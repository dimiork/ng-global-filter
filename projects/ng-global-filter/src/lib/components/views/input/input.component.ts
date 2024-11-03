import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FilterEmptyValue, FilterRecord } from '../../../models/filter.model';
import { GlobalFilterStore } from '../../../filter.store';

@Component({
  selector: 'gf-input',
  standalone: true,
  templateUrl: './input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
})
export class InputComponent implements OnInit {
  readonly globalStore = inject(GlobalFilterStore);

  @Input() record!: FilterRecord;

  value?: string;

  handleInputChange(text: string): void {
    this.value = text;
    this.globalStore.setFilterValue(this.record.key, text);
  }

  clearInput(): void {
    this.value = '';
    this.globalStore.clearFilterValue(this.record.key);
  }

  ngOnInit(): void {
    const initialValue = this.globalStore.getFilterValue<string>(this.record.key);
    this.value = initialValue === FilterEmptyValue ? '' : initialValue;
  }
}
