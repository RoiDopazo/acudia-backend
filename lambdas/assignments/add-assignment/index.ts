import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import { authenticationMiddleware } from '../../middlewares/authenticationMiddleware';
import { ACUDIA_TABLE, PREFIXES } from '../../utils/constants';
import DynamoDbUtils from '../../utils/dynamo-operations';
import { buildId } from '../../utils/helpers';

const addAssignment: Handler = async (event, context: Context) => {
  console.info('[LAMBDA] add-assignment', event);

  const {
    arguments: {
      arguments: { input },
      identity,
    },
  } = event;

  try {
    const assignment = await DynamoDbUtils.find(
      {
        PK: `${PREFIXES.ACUDIER}${buildId(identity)}`,
        SK: `${PREFIXES.HOSPITAL}${input.hospId}`,
      },
      ACUDIA_TABLE,
    );

    let dataToUpdate = {};

    if (assignment) {
      dataToUpdate = {
        ...assignment,
        itemList: [...assignment.itemList, ...input.itemList],
      };
    } else {
      dataToUpdate = {
        ...input,
        PK: `${PREFIXES.ACUDIER}${buildId(identity)}`,
        SK: `${PREFIXES.HOSPITAL}${input.hospId}`,
      };
    }

    const updatedAssignment = await DynamoDbUtils.insertOrReplace(
      dataToUpdate,
      ACUDIA_TABLE,
    );
    return updatedAssignment;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const addAssignmentHandler = middy(addAssignment).use(
  authenticationMiddleware({}),
);

export { addAssignmentHandler };
