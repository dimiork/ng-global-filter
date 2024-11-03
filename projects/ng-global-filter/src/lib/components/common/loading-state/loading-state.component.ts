import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LoadingState } from '../../../models/filter.model';

@Component({
  selector: 'gf-loading-state',
  standalone: true,
  templateUrl: './loading-state.component.html',
  styleUrl: './loading-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  readonly LoadingState = LoadingState;

  @Input({ required: true }) state: LoadingState = LoadingState.INIT;
  @Input() showContentOnInit = false;
}
