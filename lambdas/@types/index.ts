export interface ScanOutput {
  nextToken: string | null;
  result: AWS.DynamoDB.DocumentClient.ScanOutput;
}

export interface FiltersExpressions {
  filterExpresion: string;
  filterExpressionAttrValues: object;
  filterExpressionAttrNames: object;
}
