import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

import { FilterRecord, FilterType } from '../../../models/filter.model';
import { SelectComponent } from '../../views/select/select.component';
import { MultipleSelectComponent } from '../../views/multiple-select/multiple-select.component';
import { InputComponent } from '../../views/input/input.component';

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  templateUrl: './filter-modal.component.html',
  styleUrl: './filter-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputComponent,
    JsonPipe,
    MatDividerModule,
    MatExpansionModule,
    MultipleSelectComponent,
    SelectComponent,
  ],
})
export class FilterModalComponent {
  readonly FilterType = FilterType;
  readonly filters? = inject<FilterRecord[]>(MAT_DIALOG_DATA);
}
