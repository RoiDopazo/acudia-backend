import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { PREFIXES, TABLE_NAMES, INDEXES, ROLES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';
import { REQUEST_STATUS } from '../utils/constants';

export const profileStats: Handler = async (event, context: Context, callback) => {
  console.info(`[LAMBDA] ${context.functionName}`, event);

  const { input, identity } = event.custom;

  const isClient = input.role.toUpperCase() === ROLES.CLIENT;

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
      filters: [
        {
          attrName: 'status',
          attrValue: REQUEST_STATUS.COMPLETED,
          operator: '='
        }
      ]
    });

    const counts = requests.Items.reduce(
      (acc, item) => {
        if (acc.acudier[item.acudier]) {
          acc.acudier[item.acudier].occ = acc.acudier[item.acudier].occ + 1;
        } else {
          acc.acudier[item.acudier] = { ...item, occ: 1 };
        }

        if (acc.hosps[item.hospId]) {
          acc.hosps[item.hospId].occ = acc.hosps[item.hospId].occ + 1;
        } else {
          acc.hosps[item.hospId] = { ...item, occ: 1 };
        }

        return acc;
      },
      { acudier: {}, hosps: {} }
    );

    // @ts-ignore
    const bestAcudier: IRequest = Object.values(counts.acudier).sort((a: any, b: any) => a.occ > b.occ)[0];

    // @ts-ignore
    const bestHosp: IRequest = Object.values(counts.hosps).sort((a: any, b: any) => a.occ > b.occ)[0];

    const result = {
      acudier: {
        name: bestAcudier?.acudierName,
        photoUrl: bestAcudier?.acudierPhoto
      },
      hosp: {
        name: bestHosp?.hospName
      },
      jobsCompleted: requests.Count
    };

    callback('', result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const profileStatsHandler = middy(profileStats).use(authenticationMiddleware({}));

export { profileStatsHandler };
