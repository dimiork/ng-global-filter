import { Observable } from "rxjs";
import { DataUtil, StringUtil } from "../utils";

export enum LoadingState {
  INIT = 'INIT',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

export enum FilterType {
  select = 'select',
  input = 'input',
}

export interface FilterProps {
  multiple?: boolean;
  labelKey?: string;
  valueKey?: string;
  options?: Observable<any[]> | ((search?: string) => Observable<any[]>);
}

export type FilterConfig = {
  type: FilterType;
  key: string;
  label?: string;
  props?: FilterProps;
  local?: boolean;
  expandable?: boolean;
}

export const FilterEmptyValue = Symbol('empty_value');

export class FilterRecord implements Pick<FilterConfig, 'label' | 'props' | 'local' | 'key' | 'expandable'> {
  id!: string;
  type!: FilterType;
  value: unknown | typeof FilterEmptyValue = FilterEmptyValue;
  label: string;
  local: boolean;
  key!: string;
  props: FilterProps;
  expandable: boolean = true;

  constructor(data: FilterConfig) {
    this.id = DataUtil.generateId();
    this.type = data.type;
    this.label = data.label || StringUtil.capitalize(this.type);
    this.props = data.props || {};
    this.local = data.local || false;
    this.key = data.key;
    this.expandable = data.expandable ?? true;
  }
};
