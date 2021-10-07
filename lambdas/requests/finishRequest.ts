import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { TABLE_NAMES, PREFIXES, REQUEST_STATUS } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';

const finishRequest: Handler = async (event, context: Context, callback) => {
  const { input, identity } = event.custom;
  const { PK: requestPK, SK: requestSK, rating, comment, author } = input;

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
          attrValue: REQUEST_STATUS.COMPLETED,
          operator: '='
        }
      ],
      conditions: [
        {
          attrName: 'client',
          attrValue: `${PREFIXES.CLIENT}${identity}`,
          operator: '='
        },
        {
          attrName: 'status',
          attrValue: REQUEST_STATUS.ACCEPTED,
          operator: '='
        }
      ]
    });

    const request = await DynamoDbOperations.find<IRequest>({
      id: {
        PK: requestPK,
        SK: requestSK
      },
      tableName: TABLE_NAMES.ACUDIA_TABLE
    });

    const acudier = await DynamoDbOperations.find<IProfile>({
      id: {
        PK: request.Item.acudier,
        SK: PREFIXES.PROFILE
      },
      tableName: TABLE_NAMES.ACUDIA_TABLE
    });

    const jobsCompleted = acudier.Item.jobsCompleted ?? 0;

    await DynamoDbOperations.update({
      tableName: TABLE_NAMES.ACUDIA_TABLE,
      id: {
        PK: request.Item.acudier,
        SK: PREFIXES.PROFILE
      },
      data: [
        {
          attrName: 'jobsCompleted',
          attrValue: jobsCompleted + 1,
          operator: '='
        },
        {
          attrName: 'popularity',
          attrValue: ((acudier.Item.popularity ?? 0) * jobsCompleted + rating) / (jobsCompleted + 1),
          operator: '='
        }
      ]
    });

    if (comment)
      await DynamoDbOperations.insertOrReplace<IComment>({
        tableName: TABLE_NAMES.ACUDIA_TABLE,
        item: {
          PK: request.Item.acudier,
          SK: `${PREFIXES.COMMENT}${Date.now()}`,
          author: author,
          date: new Date().toLocaleDateString('nl'), // Format required dd-MM-yyyy
          comment: comment,
          rating: rating
        }
      });

    callback();
    return true;
  } catch (err) {
    console.error(err);
    callback(err);
    return false;
  }
};

const finishRequestHandler = middy(finishRequest).use(authenticationMiddleware({}));

export { finishRequestHandler };
