import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { TABLE_NAMES, PREFIXES, REQUEST_STATUS } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';

const answerRequest: Handler = async (event, context: Context, callback) => {
  const { input, identity } = event.custom;
  const { PK: requestPK, SK: requestSK, status } = input;

  if (
    status.toLowerCase() !== REQUEST_STATUS.ACCEPTED.toLowerCase() &&
    status.toLowerCase() !== REQUEST_STATUS.REJECTED.toLowerCase()
  ) {
    callback();
    return false;
  }

  try {
    await DynamoDbOperations.update({
      tableName: TABLE_NAMES.ACUDIA_TABLE,
      id: {
        PK: requestPK,
        SK: requestSK
      },
      data: [
        {
          attrName: 'status',
          attrName2: 'newStatus',
          attrValue: status,
          operator: '='
        }
      ],
      conditions: [
        {
          attrName: 'acudier',
          attrValue: `${PREFIXES.ACUDIER}${identity}`,
          operator: '='
        },
        {
          attrName: 'status',
          attrValue: REQUEST_STATUS.PENDING,
          operator: '='
        }
      ]
    });

    callback();
    return true;
  } catch (err) {
    console.error(err);
    callback(err);
    return false;
  }
};

const answerRequestHandler = middy(answerRequest).use(authenticationMiddleware({}));

export { answerRequestHandler };
