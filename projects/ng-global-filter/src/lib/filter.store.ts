import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { FilterRecord, FilterConfig, FilterEmptyValue } from './models/filter.model';
import { ArrayUtil } from './utils';

type GlobalFilterState = {
  globalFilters: Map<string, FilterRecord>;
  localFilters: Map<string, FilterRecord>;
  activeTypes: string[];
};

const INITIAL_STATE: GlobalFilterState = {
  globalFilters: new Map(),
  localFilters: new Map(),
  activeTypes: [],
};

export const GlobalFilterStore = signalStore(
  { providedIn: 'root' },
  withState(INITIAL_STATE),
  withComputed(({ globalFilters, localFilters, activeTypes }) => ({
    activeFilters: computed(() => {
      return activeTypes().reduce((acc: FilterRecord[], type) => {
        const localRecord = localFilters().get(type);
        if (localRecord) {
          acc.push(localRecord);

          return acc;
        }

        const globalrecord = globalFilters().get(type);
        if (globalrecord) {
          acc.push(globalrecord);

          return acc;
        }

        return acc;
      }, []);
    }),
  })),
  withComputed(({ activeFilters }) => ({
    activeFiltersWithValue: computed(() => activeFilters().filter(f => f.value !== FilterEmptyValue)),
  })),
  withMethods((store) => ({

    setActiveFilters(filters: FilterConfig[]): void {

      validateFilterConfig(filters);

      patchState(store, (state) => {
        const locals = new Map(state.localFilters);
        const globals = new Map(state.globalFilters);

        for (const filter of filters) {

          if (filter.local && !locals.has(filter.key)) {

            locals.set(filter.key, new FilterRecord(filter));
          } else if (!globals.has(filter.key)) {

            globals.set(filter.key, new FilterRecord(filter));
          }
        }

        return ({
          activeTypes: [...new Set(filters.map(f => f.key))],
          globalFilters: globals,
          localFilters: locals,
        });
      });
    },

    setFilterValue(key: string, value: unknown): void {
      const locals = new Map(store.localFilters());
      let filter = locals.get(key);
      if (filter) {
        filter.value = value;
        patchState(store, ({ localFilters: locals }));
        return
      }

      const globals = new Map(store.globalFilters());
      filter = globals.get(key);
      if (filter) {
        filter.value = value;
        patchState(store, ({ globalFilters: globals }));
        return
      }

      throw new Error(`Filter ${key} is not registered`);
    },

    getFilterValue: <T>(key: string): T | typeof FilterEmptyValue => {
      const localValue = store.localFilters().get(key)?.value;
      if (localValue && localValue !== FilterEmptyValue) {
        return localValue as T;
      }

      const globalValue = store.globalFilters().get(key)?.value;

      if (globalValue && globalValue !== FilterEmptyValue) {
        return globalValue as T;
      }

      return FilterEmptyValue;
    },

    clearFilterValue<T>(key: string): void {
      const locals = new Map(store.localFilters());
      let filter = locals.get(key);
      if (filter) {
        filter.value = FilterEmptyValue;
        return patchState(store, ({ localFilters: locals }));
      }

      const globals = new Map(store.globalFilters());
      filter = globals.get(key);
      if (filter) {
        filter.value = FilterEmptyValue;
        return patchState(store, ({ globalFilters: globals }));
      }

      throw new Error(`Filter ${key} is not reigistered`);
    },

    clearLocalFilters: (): void => patchState(store, ({ localFilters: new Map() })),
  })),
);

function validateFilterConfig(configs: FilterConfig[]) {
  if (ArrayUtil.hasDuplicates(configs.map(c => c.key))) {
    throw new Error(`Filter configuration error: keys must be unique.`);
  }
}
