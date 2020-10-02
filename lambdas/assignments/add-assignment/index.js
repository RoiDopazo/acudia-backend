const middy = require('@middy/core');
const { PREFIXES, ACUDIA_TABLE } = require('../../utils/constants');
const { find, insertOrReplace } = require('../../utils/dynamo-operations');
const { buildId } = require('../../utils/helpers');
const authenticationMiddleware = require('../../middlewares/authenticationMiddleware');

const addAssignment = async (event, context) => {
  console.info('[LAMBDA] add-assignment', event);

  console.log(event, context);
  const {
    arguments: {
      arguments: { input },
      identity,
    },
  } = event;

  // try {
  //   const assignment = await find(
  //     {
  //       PK: `${PREFIXES.ACUDIER}${buildId(identity)}`,
  //       SK: `${PREFIXES.HOSPITAL}${input.hospId}`,
  //     },
  //     ACUDIA_TABLE,
  //   );

  //   let dataToUpdate = {};

  //   if (assignment) {
  //     dataToUpdate = {
  //       ...assignment,
  //       itemList: [...assignment.itemList, ...input.itemList],
  //     };
  //   } else {
  //     dataToUpdate = {
  //       ...input,
  //       PK: `${PREFIXES.ACUDIER}${buildId(identity)}`,
  //       SK: `${PREFIXES.HOSPITAL}${input.hospId}`,
  //     };
  //   }

  //   const updatedAssignment = await insertOrReplace(dataToUpdate, ACUDIA_TABLE);
  //   return updatedAssignment;
  // } catch (err) {
  //   console.error(err);
  //   return err;
  // }
};

const addAssignmentHandler = middy(addAssignment).use(
  authenticationMiddleware(),
);

module.exports = { addAssignmentHandler };
