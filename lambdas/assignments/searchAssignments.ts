import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { ACUDIA_TABLE, PREFIXES } from '../utils/constants';
import DynamoDbUtils from '../utils/dynamo-operations';

const searchAssignment: Handler = async (event, context: Context) => {
  console.info(`[LAMBDA] ${context.functionName}`, event);

  const { input, identity } = event.custom;

  try {
    const acudiers: AWS.DynamoDB.DocumentClient.QueryOutput = await DynamoDbUtils.query(
      {
        tableName: ACUDIA_TABLE,
        indexName: 'InvertedIndex',
        hashIndexOpts: {
          attrName: 'SK',
          attrValue: `${PREFIXES.HOSPITAL}${input.hospId}`,
          operator: '=',
        },
      },
    );

    console.log(acudiers);
    acudiers.Items?.filter((acudier) => {
      console.log(acudier.itemList);
    });
    return { name: 'asda' };
  } catch (err) {
    console.error(err);
    return err;
  }
};

const searchAssignmentHandler = middy(searchAssignment).use(
  authenticationMiddleware({}),
);

export { searchAssignmentHandler };
