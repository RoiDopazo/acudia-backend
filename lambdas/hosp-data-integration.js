const TABLE = 'AcudiaTable';
const AWS = require('aws-sdk');

// Create the DynamoDB service object
const docClient = new AWS.DynamoDB.DocumentClient();

var params = {
  TableName: TABLE,
  Item: {
    PK: 'sdasd#11111',
    SK: 'PROFILE',
  },
};

exports.job = async (event) => {
  return docClient
    .put(params)
    .promise()
    .then((response) => response)
    .catch((err) => {
      console.log(err);
      return err;
    });
};
