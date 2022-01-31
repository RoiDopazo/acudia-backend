import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { TABLE_NAMES, INDEXES, PREFIXES, ROLES, REQUEST_STATUS } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';

export const getMyRequests: Handler = async (event, context: Context, callback) => {
  const { input, identity } = event.custom;

  const isClient = input.role.toUpperCase() === ROLES.CLIENT;

  const computedStatus =
    input.status === REQUEST_STATUS.COMPLETED && !isClient
      ? [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.ACCEPTED]
      : input.status.split(',');

  const filters = computedStatus.map(
    (cStatus) =>
      ({
        attrName: 'status',
        attrValue: cStatus,
        operator: '='
      } as IAttrComp)
  );
  try {
    const requests: QueryOutput<IRequest> = await DynamoDbOperations.query<IRequest>({
      tableName: TABLE_NAMES.ACUDIA_TABLE,
      indexName: isClient ? INDEXES.CLIENT_INDEX : INDEXES.ACUDIER_INDEX,
      hashIndexOpts: {
        attrName: isClient ? 'client' : 'acudier',
        attrValue: `${isClient ? PREFIXES.CLIENT : PREFIXES.ACUDIER}${identity}`,
        operator: '='
      },
      filterJoinCondition: 'OR',
      filters: filters
    });

    const now = Date.now();

    const [incoming, active, completed] = requests.Items.reduce(
      ([incoming, active, completed], value) => {
        if (value.status !== REQUEST_STATUS.COMPLETED) {
          const startDate = new Date(value.from);
          startDate.setSeconds(value.startHour);
          if (value.status === 'ACCEPTED') {
            if (now > startDate.getTime()) {
              const endDate = new Date(value.to);
              endDate.setSeconds(value.endHour);
              const hasFinished = now > endDate.getTime();
              if (isClient) {
                return [incoming, [...active, { ...value, hasStarted: true, hasFinished: hasFinished }], completed];
              } else {
                return [incoming, active, [...completed, { ...value, hasStarted: true, hasFinished: hasFinished }]];
              }
            }
          }
          if (value.status === 'PENDING') {
            if (!isClient && now > startDate.getTime()) {
              return [incoming, active, completed];
            } else {
              return [[...incoming, { ...value, hasStarted: now > startDate.getTime() }], active, completed];
            }
          }
          return [[...incoming, value], active, completed];
        } else {
          return [[], [], [...completed, value]];
        }
      },
      [[], [], []]
    );

    const result = {
      incoming,
      active,
      completed
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
