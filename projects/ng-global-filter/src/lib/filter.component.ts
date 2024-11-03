import { ChangeDetectionStrategy, Component, effect, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { FilterConfig } from './models/filter.model';
import { ActiveFiltersComponent } from './components/common/active-filters/active-filters.component';
import { FilterModalComponent } from './components/common/filter-modal/filter-modal.component';
import { GlobalFilterStore } from './filter.store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const DIALOG_CONFIG: MatDialogConfig = {
  height: '100vh',
  width: '25vw',
  position: { right: '0px' },
  disableClose: false,
  hasBackdrop: true,
};

@Component({
  selector: 'app-filter',
  standalone: true,
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActiveFiltersComponent,
    MatButtonModule,
    MatIconModule,
    JsonPipe,
  ],
})
export class FilterComponent implements OnDestroy {
  private dialog = inject(MatDialog);
  readonly store = inject(GlobalFilterStore);

  @Input() set filters(data: FilterConfig[]) {
    this.store.setActiveFilters(data);
  }

  @Output() change = new EventEmitter();

  constructor() {
    effect(() => {
      this.change.emit(
        this.store.activeFiltersWithValue()
          .reduce((data, f) =>
            ({ ...data, [f.key]: f.value }), {} as { [key: string]: unknown; })
      );
    });
  }

  openFilterModal(): void {
    this.dialog.open(FilterModalComponent, { data: this.store.activeFilters(), ...DIALOG_CONFIG });
  }

  ngOnDestroy(): void {
    this.store.clearLocalFilters();
  }
}
