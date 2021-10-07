type REQUEST_STATUS = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

interface IResult<T> {
  Items: T[];
  Count: number;
  ScannedCount: number;
  LastEvaluatedKey: any;
}

interface ScanOutput<T> {
  nextToken: string | null;
  result: IResult<T>;
}

interface QueryOutput<T> extends IResult<T> {}

interface GetItemOutput<T> {
  Item: T;
}

interface FiltersExpressions {
  filterExpression: string;
  filterExpressionAttrValues: object;
  filterExpressionAttrNames: object;
}

interface IAttrComp {
  attrName: string;
  attrName2?: string;
  attrValue: string | number;
  attrValue2?: string | number;
  operator: '<=' | '<' | '>' | '>=' | 'AND' | 'OR' | '=' | '!=' | 'BETWEEN' | 'begins_with';
}

interface IProfile {
  PK: string;
  SK: string;
  name: string;
  secondName?: string;
  email: string;
  genre: string;
  birthDate?: string;
  photoUrl?: string;
  jobsCompleted?: number;
  popularity?: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

interface IAssignment {
  PK: string;
  SK: string;
  acudierId: string;
  hospId: string;
  hospName?: string;
  hospProvince?: string;
  from: string;
  to: string;
  startHour: number;
  endHour: number;
  fare: number;
  days?: [Boolean];
  createdAt: number;
  updatedAt: number;
}

interface IComment {
  PK: string;
  SK: string;
  author: string;
  comment: string;
  date: string;
  rating: number;
}

interface IRequest {
  PK: string;
  SK: string;
  status: REQUEST_STATUS;
  acudier: string;
  acudierName: string;
  acudierPhoto?: String;
  client: string;
  clientName: string;
  clientPhoto?: string;
  hospId: string;
  hospName: string;
  from: string;
  to: string;
  startHour: number;
  endHour: number;
  price: number;
  createdAt: number;
  updatedAt: number;
}
