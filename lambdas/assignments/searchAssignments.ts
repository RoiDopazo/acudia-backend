import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { MIN_FARE, MAX_FARE, PREFIXES, TABLE_NAMES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';

const searchAssignment: Handler = async (event, context: Context, callback) => {
  console.info(`[LAMBDA] ${context.functionName}`, event);

  const { input, identity } = event.custom;

  try {
    const assignments: QueryOutput<IAssignment> = await DynamoDbOperations.query<IAssignment>({
      tableName: TABLE_NAMES.ASSIGNMENTS_TABLE,
      hashIndexOpts: {
        attrName: 'PK',
        attrValue: `${PREFIXES.HOSPITAL}${input.hospId}`,
        operator: '='
      },
      filters: [
        {
          attrName: 'from',
          attrValue: input?.query?.from,
          operator: '>='
        },
        {
          attrName: 'to',
          attrValue: input?.query?.to,
          operator: '<='
        },
        {
          attrName: 'startHour',
          attrValue: input?.query?.startHour,
          operator: '>='
        },
        {
          attrName: 'endHour',
          attrValue: input?.query?.endHour,
          operator: '<='
        },
        {
          attrName: 'fare',
          attrValue: input?.query?.minFare || MIN_FARE,
          attrValue2: input?.query?.maxFare || MAX_FARE,
          operator: 'BETWEEN'
        }
      ]
    });

    const acudiers: ScanOutput<IProfile> = await DynamoDbOperations.list<IProfile>({
      tableName: TABLE_NAMES.ACUDIA_TABLE,
      filterJoinCondition: 'OR',
      filters: assignments.Items?.map((assignment) => ({
        attrName: 'PK',
        attrValue: `${PREFIXES.ACUDIER}${assignment.acudierId}`,
        operator: '='
      }))
    });

    const data = assignments.Items?.map((assignment) => {
      const acudier = acudiers.result.Items.find(
        (acudier) => acudier.PK.includes(assignment.acudierId) && acudier.SK === PREFIXES.PROFILE
      );
      return {
        assignment: { ...assignment },
        acudier: { ...acudier }
      };
    });

    const result = {
      items: data,
      pagination: {
        lastEvaluatedKey: assignments.LastEvaluatedKey,
        count: assignments.Count
      }
    };

    callback('', result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const searchAssignmentHandler = middy(searchAssignment).use(authenticationMiddleware({}));

export { searchAssignmentHandler };
