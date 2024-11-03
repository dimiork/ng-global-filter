import { inject } from '@angular/core';

import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, isObservable, map, of, pipe, switchMap, tap } from 'rxjs';

import { GlobalFilterStore } from '../../../filter.store';
import { FilterRecord } from '../../../models/filter.model';
import { SelectRecord } from './select.model';
import { LoadingState } from '../../../models/filter.model';
import { DEBOUNCE_TIME } from '../../../models/contsants';

type SelectState = {
  state: LoadingState;
  items: SelectRecord[];
  record: FilterRecord | undefined;
};

const INITIAL_STATE: SelectState = {
  items: [],
  state: LoadingState.INIT,
  record: undefined,
};

export const SelectStore = signalStore(
  withState(INITIAL_STATE),
  withMethods((
    store,
    globalFilterStore = inject(GlobalFilterStore),
  ) => ({
    setRecord: (record: FilterRecord): void => patchState(store, ({ record })),
    updateItems: (items: SelectRecord[]) => {
      patchState(store, (state) => ({
        ...state,
        items: state.items.map(item => {
          const existedItem = items.find(newItem => newItem.value === item.value);
          return {
            ...item,
            checked: existedItem ? true : false,
          };
        }),
      }));
      const recordKey = store.record()?.key;
      if (!recordKey) return;

      globalFilterStore.setFilterValue(recordKey, store.items().filter(i => i.checked).map(i => i.value)[0]);
    },
    loadItems: rxMethod<void>(
      pipe(
        debounceTime(DEBOUNCE_TIME.USER_SELECT),
        distinctUntilChanged(),
        filter(() => Boolean(store.record)),
        tap(() => patchState(store, { state: LoadingState.LOADING })),
        switchMap(() => {
          return getItems(store.record()).pipe(
            map(items => {
              const record = store.record();
              if (!(record && record.props?.labelKey && record.props?.valueKey)) {
                return [];
              }

              const selectedItem = globalFilterStore.getFilterValue<string>(record.key);

              return items.map(item => ({
                checked: selectedItem === item[record.props.valueKey as string],
                label: item[record.props.labelKey as string],
                value: item[record.props.valueKey as string],
              }));
            }),
            tapResponse({
              next: records => patchState(store, (state) => ({ ...state, items: records, state: LoadingState.LOADED })),
              error: error => {
                console.error(error);
                patchState(store, { state: LoadingState.ERROR })
              },
              finalize: () => patchState(store, { state: LoadingState.LOADED }),
            }),
          )
        })
      ),
    ),
  })),
  withHooks({
    onInit: (store) => store.loadItems(),
  }),
);

function getItems(record: FilterRecord | undefined, search?: string) {
  if (!record?.props.options) return of([]);
  if (Array.isArray(record.props.options)) return of(record.props.options);
  if (isObservable(record.props.options)) return record.props.options;
  if (typeof record.props.options === 'function') return record.props.options(search);

  return of([]);
}
