const { PREFIXES, ACUDIA_TABLE } = require('../../util/constants');
const { find, insertOrReplace } = require('../../util/dynamo-operations');
const { buildId } = require('../../util/helpers');

exports.handler = async (event) => {
  console.info('[LAMBDA] add-assignment', event);

  const {
    arguments: {
      arguments: { input },
      identity,
    },
  } = event;

  try {
    const assignment = await find(
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

    const updatedAssignment = await insertOrReplace(dataToUpdate, ACUDIA_TABLE);
    return updatedAssignment;
  } catch (err) {
    console.error(err);
    return error;
  }
};
