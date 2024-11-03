import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';


import { FilterRecord, FilterType, LoadingState } from '../../../models/filter.model';
import { SelectRecord } from './multiple-select.model';
import { MultipleSelectStore } from './multiple-select.store';
import { LoadingStateComponent } from '../../common/loading-state/loading-state.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'gf-multiple-select',
  templateUrl: './multiple-select.component.html',
  styleUrl: './multiple-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MultipleSelectStore],
  imports: [
    JsonPipe,
    LoadingStateComponent,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
  ],
})
export class MultipleSelectComponent {
  readonly store = inject(MultipleSelectStore);
  readonly FilterType = FilterType;
  readonly LoadingState = LoadingState;

  @Input() set record(record: FilterRecord) {
    this.store.setRecord(record);
  };

  protected allItemsSelected = signal(false);

  toggleSelection(record: SelectRecord, event: MatCheckboxChange): void {
    this.store.updateItems([record].map(r => ({ ...r, checked: event.checked })));
  }

  toggleAllSelection(selected: boolean): void {
    this.store.updateItems(this.store.items().map(r => ({ ...r, checked: !selected })));
    this.allItemsSelected.set(!selected);
  }
}
