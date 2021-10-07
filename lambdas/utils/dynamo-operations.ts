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
const dynamodb = new AWS.DynamoDB();

const DynamoDbOperations = {
  insertOrReplace: async <T>({ item, tableName }: { tableName: TABLE_NAMES; item: T }): Promise<T> => {
    const params = {
      TableName: tableName,
      Item: item
    };

    await docClient.put(params).promise();
    return item;
  },

  find: async <T>({
    id,
    tableName,
    indexName
  }: {
    id: any;
    tableName: TABLE_NAMES;
    indexName?: INDEXES;
  }): Promise<GetItemOutput<T>> => {
    const params = {
      Key: id,
      TableName: tableName,
      IndexName: indexName
    };

    const result = ((await docClient.get(params).promise()) as any) as GetItemOutput<T>;
    return result;
  },

  getWhereIdIn: async (ids: string[], tableName: string) => {
    const keys = [];
    for (const id of ids) {
      // @ts-ignore
      keys.push({ id });
    }

    const params = { RequestItems: {} };
    params.RequestItems[tableName] = { Keys: keys };

    try {
      const result = await docClient.batchGet(params).promise();

      // @ts-ignore
      const items = result.Responses[tableName];

      if (_.isEmpty(items)) {
        return [];
      }
      return items;
    } catch (err) {
      return [];
    }
  },

  list: async <T>({
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
  }): Promise<ScanOutput<T>> => {
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

    const result = ((await docClient.scan(params).promise()) as any) as IResult<T>;

    let newNextToken: string | null = null;
    if (_.has(result, 'LastEvaluatedKey')) {
      // @ts-ignore
      newNextToken = result.LastEvaluatedKey.id;
    }

    return {
      nextToken: newNextToken,
      result
    };
  },

  query: async <T>({
    tableName,
    indexName,
    hashIndexOpts,
    rangeIndexOpts,
    filters
  }: {
    tableName: TABLE_NAMES;
    indexName?: INDEXES;
    hashIndexOpts: IAttrComp;
    rangeIndexOpts?: IAttrComp;
    filters: IAttrComp[];
  }): Promise<QueryOutput<T>> => {
    const { attrName, attrValue, operator } = hashIndexOpts;
    const rangeAttrName = rangeIndexOpts?.attrName;
    const rangeAttrValue = rangeIndexOpts?.attrValue;
    const rangeOperator = rangeIndexOpts?.operator;

    const { filterExpression, filterExpressionAttrValues, filterExpressionAttrNames } = DynamoDbUtils.buildFilters({
      filters
    });

    const keyConditionExpression = [`${attrName} ${operator} :hkey`];

    const expressionAttributeValues = {
      ':hkey': attrValue,
      ...filterExpressionAttrValues
    };

    if (rangeAttrName) {
      if (rangeOperator === 'begins_with') {
        keyConditionExpression.push(`${rangeOperator}(${rangeAttrName}, :rkey) `);
      }
      expressionAttributeValues[':rkey'] = rangeAttrValue;
    }

    const params = DynamoDbUtils.buildParams({
      tableName,
      indexName,
      keyConditionExpression: keyConditionExpression.join(' And '),
      filterExpression,
      expressionAttributeValues: expressionAttributeValues,
      expressionAttributeNames: {
        ...filterExpressionAttrNames
      }
    });

    const result = ((await docClient.query(params).promise()) as any) as IResult<T>;

    return result;
  },

  update: async ({
    tableName,
    id,
    data,
    conditions = []
  }: {
    tableName: TABLE_NAMES;
    id: any;
    data: IAttrComp[];
    conditions?: IAttrComp[];
  }) => {
    const updateExpressions = [] as string[];
    const expressionsValues = {};
    const expressionsNames = {};
    const conditionsStr: string[] = [];

    data.forEach((element) => {
      const attrName2 = element.attrName2 ? element.attrName2 : element.attrName;
      updateExpressions.push(`#${element.attrName} ${element.operator} :${attrName2}`);
      expressionsValues[`:${attrName2}`] = element.attrValue;
      expressionsNames[`#${element.attrName}`] = element.attrName;
    });

    conditions.forEach((condition) => {
      expressionsValues[`:${condition.attrName}`] = condition.attrValue;
      expressionsNames[`#${condition.attrName}`] = condition.attrName;
      conditionsStr.push(`#${condition.attrName} ${condition.operator} :${condition.attrName}`);
    });

    const updateExpression = 'set ' + updateExpressions.join(', ');

    const params = {
      TableName: tableName,
      Key: id,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionsNames,
      ExpressionAttributeValues: expressionsValues,
      ConditionExpression: conditionsStr.length ? conditionsStr.join(' AND ') : undefined
    };

    const result = await docClient.update(params).promise();

    return result;
  },
  batchAdd: async ({ tableName, data }: { tableName: TABLE_NAMES; data: any[] }) => {
    if (data && data.length) {
      const finalData = data.map((element) => ({
        PutRequest: {
          Item: {
            ...element
          }
        }
      }));

      return await docClient.batchWrite({ RequestItems: { [tableName]: finalData } }).promise();
    }
  },
  batchGet: async ({ tableName, ids }: { tableName: TABLE_NAMES; ids: any[] }) => {
    const results = await docClient
      .batchGet({
        RequestItems: {
          [tableName]: {
            Keys: ids.map((id) => ({ PK: id }))
          }
        }
      })
      .promise();

    return results;
  },
  deleteTable: ({ tableName }: { tableName: TABLE_NAMES }) => {
    dynamodb.deleteTable(
      {
        TableName: tableName
      },
      function (err, data) {
        if (err) {
          console.error('Unable to delete table. Error JSON:', JSON.stringify(err, null, 2));
        } else {
          console.log('Deleted table. Table description JSON:', JSON.stringify(data, null, 2));
        }
      }
    );
  }
};
export default DynamoDbOperations;
