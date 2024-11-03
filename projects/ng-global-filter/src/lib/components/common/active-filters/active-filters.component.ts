import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';

import { GlobalFilterStore } from '../../../filter.store';
import { FilterEmptyValue, FilterRecord, FilterType } from '../../../models/filter.model';

@Component({
  selector: 'gf-active-filters',
  standalone: true,
  templateUrl: './active-filters.component.html',
  styleUrl: './active-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    MatChipsModule,
    MatIcon,
    NgTemplateOutlet,
  ],
})
export class ActiveFiltersComponent {
  readonly globalStore = inject(GlobalFilterStore);
  readonly FilterType = FilterType;

  removeSelection(record: FilterRecord, value: any): void {
    switch (record.type) {

      case FilterType.input:
        this.globalStore.clearFilterValue(record.key);
        break;

      case FilterType.select: {
        if (record.props.multiple) {
          const filterValue = this.globalStore.getFilterValue<string[]>(record.key);
          if (filterValue !== FilterEmptyValue) {
            this.globalStore.setFilterValue(record.key, filterValue.filter(val => val !== value));
          }
        } else {
          this.globalStore.clearFilterValue(record.key);
        }
        break;
      }
    }
  }
}
