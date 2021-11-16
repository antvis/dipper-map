import type { IEntity } from './common';
import { GeoJSONObject } from '@turf/turf';
import { ILayerType } from './layer';

export type IDatasetFieldType = 'string' | 'number' | 'boolean';

export interface IDatasetStringField<T = string> {
  type: 'string';
  name: T | string;
  values: string[];
  uniqueValues: string[];
  range?: [number, number];
}

export interface IDatasetNumberField<T = string> {
  type: 'number';
  name: T | string;
  values: number[];
  uniqueValues: number[];
  range: [number, number];
}

export interface IDatasetBooleanField<T = string> {
  type: 'boolean';
  name: T | string;
}

export type IDatasetField<T = string> =
  | IDatasetStringField<T>
  | IDatasetBooleanField<T>
  | IDatasetNumberField<T>;

export type IDatasetGeoJsonMap = Partial<{
  [key in ILayerType]: GeoJSONObject[];
}>;

export interface IDatasetGeoJson {
  enable: boolean;
  map: IDatasetGeoJsonMap;
  layerTypes: ILayerType[];
}

export interface IDataset<P = Record<string, any>> extends IEntity {
  type: 'json' | 'csv';
  url?: string;
  data: P[];
  fields: IDatasetField<keyof P>[];
  id: string;
  geoJson?: IDatasetGeoJson;
}
