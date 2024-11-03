import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';

import { GlobalFilterStore } from '../../../filter.store';
import { FilterRecord, FilterType, LoadingState } from '../../../models/filter.model';
import { SelectStore } from './select.store';
import { SelectRecord } from './select.model';
import { LoadingStateComponent } from '../../common/loading-state/loading-state.component';

@Component({
  selector: 'gf-select',
  standalone: true,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SelectStore],
  imports: [
    JsonPipe,
    LoadingStateComponent,
    MatDividerModule,
    MatRadioModule,
  ],
})
export class SelectComponent {
  readonly globalStore = inject(GlobalFilterStore);
  readonly store = inject(SelectStore);
  readonly FilterType = FilterType;
  readonly LoadingState = LoadingState;

  @Input() set record(record: FilterRecord) {
    this.store.setRecord(record);
  };

  select = (record: SelectRecord): void => this.store.updateItems(
    [record].map(r => ({ ...r, checked: r.value === record.value ? true : false }))
  );
}
