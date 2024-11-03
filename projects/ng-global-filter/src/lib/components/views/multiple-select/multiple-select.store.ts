import { effect, inject } from '@angular/core';

import { tapResponse } from '@ngrx/operators';
import { getState, patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, isObservable, map, of, pipe, switchMap, tap } from 'rxjs';

import { GlobalFilterStore } from '../../../filter.store';
import { FilterEmptyValue, FilterRecord } from '../../../models/filter.model';
import { SelectRecord } from './multiple-select.model';
import { LoadingState } from '../../../models/filter.model';
import { DEBOUNCE_TIME } from '../../../models/contsants';

type MultipleSelectState = {
  state: LoadingState;
  items: SelectRecord[];
  record: FilterRecord | undefined;
};

const INITIAL_STATE: MultipleSelectState = {
  items: [],
  state: LoadingState.INIT,
  record: undefined,
};

export const MultipleSelectStore = signalStore(
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
            checked: existedItem ? existedItem.checked : item.checked,
          };
        }),
      }));

      const recordKey = store.record()?.key;
      if (!recordKey) return;

      globalFilterStore.setFilterValue(recordKey, store.items().filter(i => i.checked).map(i => i.value));
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

              let selectedItems = globalFilterStore.getFilterValue<string[]>(record.key);

              if (selectedItems === FilterEmptyValue) {
                selectedItems = [];
              }

              return items.map(item => ({
                checked: selectedItems.includes(item[record.props.valueKey as string]),
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
