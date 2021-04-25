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

const DynamoDbOperations = {
  insertOrReplace: async (item, tableName) => {
    const params = {
      TableName: tableName,
      Item: item
    };

    await docClient.put(params).promise();
    return item;
  },

  find: async (id, tableName, gsi = false) => {
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
  },

  getWhereIdIn: async (ids: string[], tableName: string) => {
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

    console.log('params', params);

    if (nextToken) {
      // @ts-ignore
      params.ExclusiveStartKey = { id: nextToken };
    }

    const result = ((await docClient.scan(params).promise()) as any) as IResult<T>;

    console.log('results', result);

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
    filters
  }: {
    tableName: TABLE_NAMES;
    indexName?: INDEXES;
    hashIndexOpts: IAttrComp;
    filters: IAttrComp[];
  }): Promise<QueryOutput<T>> => {
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

    const result = ((await docClient.query(params).promise()) as any) as IResult<T>;

    return result;
  },

  update: async ({ tableName, id, data }) => {
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
  }
};
export default DynamoDbOperations;
