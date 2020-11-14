import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { ScanOutput } from '../@types';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { PREFIXES, TABLE_NAMES, INDEXES, MIN_FARE, MAX_FARE } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';

const searchAssignment: Handler = async (event, context: Context, callback) => {
  console.info(`[LAMBDA] ${context.functionName}`, event);

  const { input, identity } = event.custom;

  try {
    const assignments: AWS.DynamoDB.DocumentClient.QueryOutput = await DynamoDbOperations.query({
      tableName: TABLE_NAMES.ASSIGNMENTS_TABLE,
      indexName: undefined,
      hashIndexOpts: {
        attrName: 'PK',
        attrValue: `${PREFIXES.HOSPITAL}${input.hospId}`,
        operator: '=',
      },
      filters: [
        {
          attrName: 'from',
          attrValue: input?.query?.from,
          operator: '<=',
        },
        {
          attrName: 'to',
          attrValue: input?.query?.to,
          operator: '>=',
        },
        {
          attrName: 'startHour',
          attrValue: input?.query?.startHour,
          operator: '<=',
        },
        {
          attrName: 'endHour',
          attrValue: input?.query?.endHour,
          operator: '>=',
        },
        {
          attrName: 'fare',
          attrValue: input?.query?.minFare || MIN_FARE,
          attrValue2: input?.query?.maxFare || MAX_FARE,
          operator: 'BETWEEN',
        },
      ],
    });

    const acudiers: ScanOutput = await DynamoDbOperations.list({
      tableName: TABLE_NAMES.ACUDIA_TABLE,
      limit: undefined,
      nextToken: undefined,
      filterJoinCondition: 'OR',
      filters: assignments.Items?.map((assignment) => ({
        attrName: 'PK',
        attrValue: `${PREFIXES.ACUDIER}${assignment.acudierId}`,
        operator: '=',
      })),
    });

    console.log(acudiers.result.Items);

    const data = assignments.Items?.map((assignment) => {
      const acudier = acudiers.result.Items?.find(
        (acudier) => acudier.PK.includes(assignment.acudierId) && acudier.SK === PREFIXES.PROFILE,
      );
      return {
        assignment: { ...assignment },
        acudier: { ...acudier },
      };
    });

    callback('', { items: data });
    return { items: data };
  } catch (err) {
    console.error(err);
    return err;
  }
};

const searchAssignmentHandler = middy(searchAssignment).use(authenticationMiddleware({}));

export { searchAssignmentHandler };
