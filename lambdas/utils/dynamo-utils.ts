import { DEFAULT_LIMIT, INDEXES, TABLE_NAMES } from './constants';

const buildFilters = ({
  filters = [],
  joinCondition = 'AND'
}: {
  filters?: IAttrComp[];
  joinCondition?: 'AND' | 'OR';
}): FiltersExpressions => {
  const filterExpressionArray: string[] = [];
  const filterExpressionAttrValues = {};
  const filterExpressionAttrNames = {};

  filters.forEach((filter, index) => {
    if (filter.attrValue) {
      switch (filter.operator) {
        case 'BETWEEN': {
          filterExpressionAttrNames[`#${filter.attrName}`] = `${filter.attrName}`;
          filterExpressionAttrValues[`:${filter.attrName}1`] = filter.attrValue;
          filterExpressionAttrValues[`:${filter.attrName}2`] = filter.attrValue2;
          filterExpressionArray.push(
            `#${filter.attrName} ${filter.operator} :${filter.attrName}1 AND :${filter.attrName}2`
          );
          break;
        }
        case 'AND':
        default: {
          filterExpressionAttrNames[`#${filter.attrName}`] = filter.attrName;
          filterExpressionAttrValues[`:${filter.attrName}${index}`] = filter.attrValue;
          filterExpressionArray.push(`#${filter.attrName} ${filter.operator} :${filter.attrName}${index}`);
          break;
        }
      }
    }
  });

  return {
    filterExpression: filterExpressionArray.join(` ${joinCondition} `),
    filterExpressionAttrValues,
    filterExpressionAttrNames
  };
};

const buildParams = ({
  tableName,
  indexName,
  keyConditionExpression,
  filterExpression,
  expressionAttributeValues,
  expressionAttributeNames,
  limit
}: {
  tableName: TABLE_NAMES;
  indexName?: INDEXES;
  keyConditionExpression?: string;
  filterExpression?: string;
  expressionAttributeValues?: Record<string, string | number>;
  expressionAttributeNames?: Record<string, string>;
  limit?: number;
}) => {
  const params = {
    TableName: tableName,
    IndexName: indexName,
    Limit: limit
  };

  if (filterExpression && filterExpression !== '') {
    params['FilterExpression'] = filterExpression;
  }

  if (keyConditionExpression && keyConditionExpression !== '') {
    params['KeyConditionExpression'] = keyConditionExpression;
  }

  if (expressionAttributeValues && Object.keys(expressionAttributeValues).length) {
    params['ExpressionAttributeValues'] = { ...expressionAttributeValues };
  }

  if (expressionAttributeNames && Object.keys(expressionAttributeNames).length) {
    params['ExpressionAttributeNames'] = { ...expressionAttributeNames };
  }

  return params;
};

export default { buildFilters, buildParams };
