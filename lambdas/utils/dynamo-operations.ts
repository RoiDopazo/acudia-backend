import AWS from 'aws-sdk';
import _ from 'lodash';
import { TABLE_NAMES, INDEXES } from './constants';
import DynamoDbUtils from './dynamo-utils';

const isLocal = process.env.STAGE === 'local';

if (isLocal) {
  AWS.config.update({
    region: process.env.REGION,
    // @ts-ignore
    endpoint: process.env.DB_HOST
  });
}

const docClient = new AWS.DynamoDB.DocumentClient();

const insertOrReplace = async (item, tableName) => {
  const params = {
    TableName: tableName,
    Item: item
  };

  await docClient.put(params).promise();
  return item;
};

const find = async (id, tableName, gsi = false) => {
  const invertedIndex = gsi ? { IndexName: 'InvertedIndex' } : {};

  const params = {
    Key: id,
    TableName: tableName,
    ...invertedIndex
  };

  const result = await docClient.get(params).promise();
  if (_.isEmpty(result)) {
    return null;
  } else {
    return result.Item;
  }
};

const getWhereIdIn = async (ids: string[], tableName: string) => {
  const keys = [];
  for (const id of ids) {
    // @ts-ignore
    keys.push({ id });
  }

  const params = { RequestItems: {} };
  params.RequestItems[tableName] = { Keys: keys };
  console.log({ params });
  console.log(params.RequestItems);
  console.log('Keys: ', params.RequestItems[tableName].Keys);

  try {
    const result = await docClient.batchGet(params).promise();
    console.log({ result });
    console.log('getWhereIdIn:result', result);

    // @ts-ignore
    const items = result.Responses[tableName];
    console.log('getWhereIdIn:items', items);

    if (_.isEmpty(items)) {
      return [];
    }
    return items;
  } catch (err) {
    console.log('getWhereIdIn:err', err);
    return [];
  }
};

const list = async ({
  tableName,
  limit,
  nextToken,
  filterJoinCondition,
  filters
}: {
  tableName: TABLE_NAMES;
  limit?: number;
  nextToken?: string;
  filterJoinCondition?: 'AND' | 'OR';
  filters?: IAttrComp[];
}): Promise<ScanOutput> => {
  const { filterExpression, filterExpressionAttrValues, filterExpressionAttrNames } = DynamoDbUtils.buildFilters({
    filters,
    joinCondition: filterJoinCondition
  });

  const params = DynamoDbUtils.buildParams({
    tableName,
    limit,
    filterExpression,
    expressionAttributeValues: {
      ...filterExpressionAttrValues
    },
    expressionAttributeNames: {
      ...filterExpressionAttrNames
    }
  });

  if (nextToken) {
    // @ts-ignore
    params.ExclusiveStartKey = { id: nextToken };
  }

  const result = await docClient.scan(params).promise();

  let newNextToken: string | null = null;
  if (_.has(result, 'LastEvaluatedKey')) {
    // @ts-ignore
    newNextToken = result.LastEvaluatedKey.id;
  }

  return {
    nextToken: newNextToken,
    result
  };
};

const query = async ({
  tableName,
  indexName,
  hashIndexOpts,
  filters
}: {
  tableName: TABLE_NAMES;
  indexName?: INDEXES;
  hashIndexOpts: IAttrComp;
  filters: IAttrComp[];
}): Promise<AWS.DynamoDB.DocumentClient.QueryOutput> => {
  const { attrName, attrValue, operator } = hashIndexOpts;

  const { filterExpression, filterExpressionAttrValues, filterExpressionAttrNames } = DynamoDbUtils.buildFilters({
    filters
  });

  const params = DynamoDbUtils.buildParams({
    tableName,
    indexName,
    keyConditionExpression: `${attrName} ${operator} :hkey`,
    filterExpression,
    expressionAttributeValues: {
      ':hkey': attrValue,
      ...filterExpressionAttrValues
    },
    expressionAttributeNames: {
      ...filterExpressionAttrNames
    }
  });

  const result: AWS.DynamoDB.DocumentClient.QueryOutput = await docClient.query(params).promise();

  return result;
};

const update = async ({ tableName, id, data }) => {
  const updateExpressions = [] as string[];
  const expressionsValues = {};
  for (const fieldName of Object.keys(data)) {
    const fieldValue = data[fieldName];
    updateExpressions.push(`${fieldName} = :${fieldName}`);
    expressionsValues[`:${fieldName}`] = fieldValue;
  }
  const updateExpression = 'set ' + updateExpressions.join(', ');

  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionsValues
  };
  console.log({ params });

  const result = await docClient.update(params).promise();
  console.log({ result });

  return result;
};

export default { find, list, query, update, getWhereIdIn, insertOrReplace };
