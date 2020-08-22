const TABLE = 'Hospitals';
const AWS = require('aws-sdk');
const CNH = require('../.local/CNH.json');

const isLocal = process.env.STAGE === 'local';

if (isLocal) {
  AWS.config.update({
    region: process.env.REGION,
    endpoint: process.env.DB_HOST,
  });
}

// Create the DynamoDB service object
const docClient = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3();

const AWS_S3_DATA_BUCKET = process.env.AWS_S3_DATA_BUCKET;
const AWS_S3_DATA_FILE = 'CNH.json';

const capitalize = function (text = '') {
  const lc_text = text ? text.toLowerCase() : '';
  return lc_text
    .replace(/(?:^|\s(?!de|del|y\s)|\/|-)\S/g, (a) => a.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

const parseJSON = (jsonFile) => {
  /*
  A: 'CCN',
  B: 'CODCNH',
  C: 'NOMBRE',
  D: 'TIPO VIA',
  E: 'NOMBRE VIA',
  F: 'NUMERO VIA',
  G: 'TELEFONO',
  H: 'CODMU',
  I: 'MUNICIPIO',
  J: 'CODPROV',
  K: 'PROVINCIA',
  L: 'CODAUTO',
  M: 'CCAA',
  N: 'CODPOSTAL',
  O: 'NCAMAS',
  P: 'COD CLASE CENTRO',
  Q: 'CLASE CENTRO',
  R: 'COD DEPENDENCIA FUNCIONAL',
  S: 'DEPENDENCIA FUNCIONAL',
  T: 'FORMA PARTE COMPLEJO',
  U: 'COD COMPLEJO',
  V: 'NOMBRE COMPLEJO',
  W: 'ALTA',
  X: 'EMAIL',
*/

  const catalogue = jsonFile['DIRECTORIO DE HOSPITALES'];
  catalogue.splice(0, 1);

  const data = catalogue.slice(0, 25).map((el) => {
    const numBeds = parseInt(el.O);
    return {
      id: parseFloat(el.A),
      name: capitalize(el.C),
      address: capitalize(`${el.D} ${el.E}, ${el.F}`),
      telephone: parseInt(el.G),
      province: capitalize(el.K),
      municipallity: el.I,
      state: capitalize(el.M),
      postal_code: el.N,
      purpose: capitalize(el.Q),
      isPrivate: el.S === 'Privados',
      email: el.X ? el.X.toLowerCase() : null,
      num_beds: numBeds,
    };
  });

  return data;
};

const getFromS3 = async () => {
  let jsonFile = {};
  try {
    const paramsS3 = {
      Bucket: AWS_S3_DATA_BUCKET,
      Key: AWS_S3_DATA_FILE,
    };
    const response = await s3.getObject(paramsS3).promise();
    jsonFile = JSON.parse(response.Body.toString());
    return jsonFile;
  } catch (error) {
    console.log(error);
    return null;
  }
};

exports.job = async (event) => {
  const jsonFile = isLocal ? CNH : await getFromS3();

  const data = parseJSON(jsonFile);

  const params = {
    [TABLE]: [],
  };
  data.forEach((d) => {
    params[TABLE].push({
      PutRequest: {
        Item: {
          PK: capitalize(d.province),
          SK: `HOSP#${d.id}`,
        },
      },
    });
  });

  var i;
  var j;
  var temparray;
  const chunk = 25;
  for (i = 0, j = params[TABLE].length; i < j; i += chunk) {
    temparray = params[TABLE].slice(i, i + chunk);

    docClient
      .batchWrite({ RequestItems: { [TABLE]: temparray } })
      .promise()
      .then((response) => response)
      .catch((err) => {
        console.log(err);
        return err;
      });
  }
};
