import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../middlewares/authenticationMiddleware';
import { MIN_FARE, MAX_FARE, PREFIXES, TABLE_NAMES, MAX_NUM_COMMENT_SEARCH_RESPONSE } from '../utils/constants';
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
          attrName: 'to',
          attrValue: input?.query?.from,
          operator: '>'
        },
        {
          attrName: 'from',
          attrValue: input?.query?.to,
          operator: '<'
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

    if (!assignments || assignments?.Count > 0) {
      const acudiersData: ScanOutput<IProfile | IComment> = await DynamoDbOperations.list<IProfile>({
        tableName: TABLE_NAMES.ACUDIA_TABLE,
        filterJoinCondition: 'OR',
        filters: assignments.Items?.map((assignment) => ({
          attrName: 'PK',
          attrValue: `${PREFIXES.ACUDIER}${assignment.acudierId}`,
          operator: '='
        }))
      });

      const acudiers = acudiersData.result.Items.filter((acData) => acData.SK.includes(PREFIXES.PROFILE));

      const finalData: any[] = [];

      acudiers.forEach((acudier) => {
        const acudierAssignments = assignments.Items.filter(
          (assign) => acudier.PK === `${PREFIXES.ACUDIER}${assign.acudierId}`
        );
        const comments =
          acudiersData.result.Items.filter(
            (aData) => aData.SK.startsWith(PREFIXES.COMMENT) && aData.PK === acudier.PK
          ) ?? [];

        finalData.push({
          assignment: acudierAssignments,
          acudier: {
            profile: acudier,
            comments: comments.slice(0, MAX_NUM_COMMENT_SEARCH_RESPONSE)
          }
        });
      });

      const result = {
        items: finalData,
        pagination: {
          lastEvaluatedKey: assignments.LastEvaluatedKey,
          count: assignments.Count
        }
      };
      callback('', result);
      return result;
    }

    callback('');
    return null;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const searchAssignmentHandler = middy(searchAssignment).use(authenticationMiddleware({}));

export { searchAssignmentHandler };
