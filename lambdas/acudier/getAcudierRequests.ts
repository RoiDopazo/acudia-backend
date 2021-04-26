import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { PREFIXES, REQUEST_STATUS, TABLE_NAMES, INDEXES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';

const getAcudierRequests: Handler = async (event, context: Context, callback) => {
  console.info(`[LAMBDA] ${context.functionName}`, event);

  const { input, identity } = event.custom;

  try {
    const requestsAccepted: QueryOutput<IRequest[]> = await DynamoDbOperations.query<IRequest[]>({
      tableName: TABLE_NAMES.ACUDIA_TABLE,
      indexName: INDEXES.INVERTED_INDEX,
      hashIndexOpts: {
        attrName: 'SK',
        attrValue: PREFIXES.REQUEST,
        operator: '='
      },
      rangeIndexOpts: {
        attrName: 'PK',
        attrValue: `${PREFIXES.ACUDIER}${input.acudier}`,
        operator: 'begins_with'
      },
      filters: [
        {
          attrName: 'status',
          attrValue: input.status ?? REQUEST_STATUS.ACCEPTED,
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
