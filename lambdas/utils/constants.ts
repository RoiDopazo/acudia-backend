export const MIN_FARE = 4;
export const MAX_FARE = 100;
export const DEFAULT_LIMIT: number = 20;

export enum TABLE_NAMES {
  ACUDIA_TABLE = 'AcudiaTable',
  ASSIGNMENTS_TABLE = 'AssignmentsTable'
}

export enum INDEXES {
  INVERTED_INDEX = 'InvertedIndex',
  ACUDIER_INDEX = 'AcudierIndex'
}

export enum PREFIXES {
  ACUDIER = 'ACUDIER#',
  HOSPITAL = 'HOSP#',
  CLIENT = 'CLIENT#',
  ITEM = 'ITEM#',
  PROFILE = 'PROFILE'
}
