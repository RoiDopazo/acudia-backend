export const MIN_FARE = 4;
export const MAX_FARE = 100;
export const DEFAULT_LIMIT: number = 20;

export enum TABLE_NAMES {
  ACUDIA_TABLE = 'AcudiaTable',
  ASSIGNMENTS_TABLE = 'AssignmentsTable'
}

export enum INDEXES {
  INVERTED_INDEX = 'InvertedIndex',
  ACUDIER_INDEX = 'AcudierIndex',
  CLIENT_INDEX = 'ClientIndex'
}

export enum PREFIXES {
  ACUDIER = 'ACUDIER#',
  HOSPITAL = 'HOSP#',
  CLIENT = 'CLIENT#',
  ITEM = 'ITEM#',
  PROFILE = 'PROFILE',
  COMMENT = 'COMMENT#',
  REQUEST = 'REQUEST#'
}
export enum REQUEST_STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum ROLES {
  ACUDIER = 'ACUDIER',
  CLIENT = 'CLIENT'
}

export const MAX_NUM_COMMENT_SEARCH_RESPONSE = 5;
