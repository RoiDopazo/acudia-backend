import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { TABLE_NAMES, INDEXES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';

const getAcudierRequests: Handler = async (event, context: Context, callback) => {
  console.info(`[LAMBDA] ${context.functionName}`, event);

  const { input, identity } = event.custom;

  try {
    const requestsAccepted: QueryOutput<IRequest[]> = await DynamoDbOperations.query<IRequest[]>({
      tableName: TABLE_NAMES.ACUDIA_TABLE,
      indexName: INDEXES.ACUDIER_INDEX,
      hashIndexOpts: {
        attrName: 'acudier',
        attrValue: input.acudier,
        operator: '='
      },
      filters: [
        {
          attrName: 'status',
          attrValue: input.status ?? '',
          operator: '='
        }
      ]
    });

    const result = {
      items: requestsAccepted.Items
    };

    callback('', result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const getAcudierRequestsHandler = middy(getAcudierRequests).use(authenticationMiddleware({}));

export { getAcudierRequestsHandler };
