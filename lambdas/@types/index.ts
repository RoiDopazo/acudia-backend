interface ScanOutput {
  nextToken: string | null;
  result: AWS.DynamoDB.DocumentClient.ScanOutput;
}

interface FiltersExpressions {
  filterExpression: string;
  filterExpressionAttrValues: object;
  filterExpressionAttrNames: object;
}

interface IAttrComp {
  attrName: string;
  attrValue: string | number;
  attrValue2?: string | number;
  operator: '<=' | '<' | '>' | '>=' | 'AND' | 'OR' | '=' | '!=' | 'BETWEEN';
}
