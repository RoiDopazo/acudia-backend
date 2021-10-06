import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { TABLE_NAMES, INDEXES, PREFIXES, ROLES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';

const getMyRequests: Handler = async (event, context: Context, callback) => {
  const { input, identity } = event.custom;

  const isClient = input.role.toUpperCase() === ROLES.CLIENT;

  try {
    const requestsAccepted: QueryOutput<IRequest> = await DynamoDbOperations.query<IRequest>({
      tableName: TABLE_NAMES.ACUDIA_TABLE,
      indexName: isClient ? INDEXES.CLIENT_INDEX : INDEXES.ACUDIER_INDEX,
      hashIndexOpts: {
        attrName: isClient ? 'client' : 'acudier',
        attrValue: `${isClient ? PREFIXES.CLIENT : PREFIXES.ACUDIER}${identity}`,
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

    const now = Date.now();

    const [incoming, active] = requestsAccepted.Items.reduce(
      ([incoming, active], value) => {
        const startDate = new Date(value.from);
        startDate.setSeconds(value.startHour);
        if (value.status === 'ACCEPTED') {
          if (now > startDate.getTime()) {
            const endDate = new Date(value.to);
            endDate.setSeconds(value.endHour);
            const hasFinished = now > endDate.getTime();
            return [incoming, [...active, { ...value, hasStarted: true, hasFinished: hasFinished }]];
          }
        }
        if (value.status === 'PENDING') {
          return [[...incoming, { ...value, hasStarted: now > startDate.getTime() }], active];
        }
        return [[...incoming, value], active];
      },
      [[], []]
    );

    const result = {
      incoming,
      active
    };

    callback('', result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const getMyRequestsHandler = middy(getMyRequests).use(authenticationMiddleware({}));

export { getMyRequestsHandler };
