import AWS from 'aws-sdk';
import _ from 'lodash';

const isLocal = process.env.STAGE === 'local';
const DEFAULT_LIMIT = 20 as number;

if (isLocal) {
  AWS.config.update({
    region: process.env.REGION,
    // @ts-ignore
    endpoint: process.env.DB_HOST,
  });
}

const docClient = new AWS.DynamoDB.DocumentClient();

const insertOrReplace = async (item, tableName) => {
  const params = {
    TableName: tableName,
    Item: item,
  };

  await docClient.put(params).promise();
  return item;
};

const find = async (id, tableName) => {
  const params = {
    Key: id,
    TableName: tableName,
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

const list = async ({ tableName, limit, nextToken }) => {
  if (!limit) {
    limit = DEFAULT_LIMIT;
  }

  const params = {
    Limit: limit,
    TableName: tableName,
  };
  if (nextToken) {
    // @ts-ignore
    params.ExclusiveStartKey = { id: nextToken };
  }

  // console.log({params});
  const result = await docClient.scan(params).promise();
  // console.log({result});

  let newNextToken: string | null = null;
  if (_.has(result, 'LastEvaluatedKey')) {
    // @ts-ignore
    newNextToken = result.LastEvaluatedKey.id;
  }

  return {
    nextToken: newNextToken,
    items: result.Items,
  };
};

const query = async ({
  tableName,
  indexName,
  hashIndexOpts,
  rangeIndexOpts = {},
}) => {
  // rangeIndexOpts is not implemented yet.
  console.log({ hashIndexOpts });
  const { attrName, attrValue, operator } = hashIndexOpts;
  console.log({ attrName, attrValue, operator });

  const params = {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: `${attrName} ${operator} :hkey`,
    ExpressionAttributeValues: {
      ':hkey': attrValue,
    },
  };
  console.log({ params });

  const result = await docClient.query(params).promise();
  console.log({ result });

  return result.Items;
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
    ExpressionAttributeValues: expressionsValues,
  };
  console.log({ params });

  const result = await docClient.update(params).promise();
  console.log({ result });

  return result;
};

export default { find, list, query, update, getWhereIdIn, insertOrReplace };