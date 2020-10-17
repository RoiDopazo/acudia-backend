import middy from '@middy/core';
import { Context, Handler } from 'aws-lambda';
import uuid from 'uuid';
import { authenticationMiddleware } from '../../middlewares/authenticationMiddleware';
import { ACUDIA_TABLE, PREFIXES } from '../../utils/constants';
import DynamoDbUtils from '../../utils/dynamo-operations';

const addAssignment: Handler = async (event, context: Context) => {
  console.info(`[LAMBDA] ${context.functionName}`, event);

  const { input, identity } = event.custom;

  try {
    const assignment = await DynamoDbUtils.find(
      {
        PK: `${PREFIXES.HOSPITAL}${input.hospId}`,
        SK: `${PREFIXES.ITEM}${uuid()}`,
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
        PK: `${PREFIXES.ACUDIER}${identity}`,
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
