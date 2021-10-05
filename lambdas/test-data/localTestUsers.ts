import { PREFIXES, REQUEST_STATUS, TABLE_NAMES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';
import { formatTimeString, random } from '../utils/utils';

const LOCAL_HOSP_ID = '10040';
const today = new Date();

const clientName = 'roi-client-test';
const acudierName = 'roi-acudier-test';

const clientPhoto = 'https://randomuser.me/api/portraits/men/99.jpg';
const acudierPhoto = 'https://randomuser.me/api/portraits/men/98.jpg';

export const addLocalTestUsers = () => {
  const profile1: IProfile = {
    PK: `${PREFIXES.ACUDIER}${process.env.LOCAL_EMAIL}`,
    SK: `${PREFIXES.PROFILE}`,
    name: acudierName,
    secondName: '1',
    email: `${process.env.LOCAL_EMAIL}`,
    genre: 'MALE',
    birthDate: `19${random(40, 99)}-01-01`,
    photoUrl: acudierPhoto,
    jobsCompleted: 143,
    popularity: 4.2,
    createdAt: today.getTime(),
    updatedAt: today.getTime(),
    deletedAt: undefined
  };
  const profile2: IProfile = {
    PK: `${PREFIXES.CLIENT}${process.env.LOCAL_EMAIL2}`,
    SK: `${PREFIXES.PROFILE}`,
    name: clientName,
    secondName: '2',
    email: `${process.env.LOCAL_EMAIL2}`,
    genre: 'MALE',
    birthDate: `19${random(40, 99)}-01-01`,
    photoUrl: clientPhoto,
    createdAt: today.getTime(),
    updatedAt: today.getTime(),
    deletedAt: undefined
  };

  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ACUDIA_TABLE, data: [profile1, profile2] });
};

export const addLocalTestAssignment = ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
  const assignment: IAssignment = {
    PK: `${PREFIXES.HOSPITAL}${LOCAL_HOSP_ID}`,
    SK: `${PREFIXES.ITEM}local-1`,
    acudierId: process.env.LOCAL_EMAIL ?? '',
    hospId: LOCAL_HOSP_ID,
    hospName: 'Hospital San José',
    hospProvince: 'Álava',
    from: `${fromDate}-${formatTimeString(1)}`,
    to: `${toDate}-${formatTimeString(1)}`,
    startHour: random(7, 10) * 3600,
    endHour: random(19, 23) * 3600,
    fare: random(6, 15),
    createdAt: today.getTime(),
    updatedAt: today.getTime()
  };

  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ASSIGNMENTS_TABLE, data: [assignment] });
};

export const addLocalTestRequest = () => {
  const requestsList: IRequest[] = [];

  const creationDate = Math.round(Date.now() / 10);

  const fromValues = ['2021-08-12', '2021-09-20', '2021-10-19'];
  const toValues = ['2021-08-18', '2021-09-23', '2021-10-20'];
  const statusValues = [REQUEST_STATUS.PENDING, REQUEST_STATUS.ACCEPTED, REQUEST_STATUS.REJECTED];

  [0, 1, 2].forEach((_, index) => {
    const request: IRequest = {
      PK: `${PREFIXES.REQUEST}${index}`,
      SK: `${new Date(fromValues[index]).getTime()}`,
      status: statusValues[index],
      acudier: `${PREFIXES.ACUDIER}${process.env.LOCAL_EMAIL}`,
      acudierName: acudierName,
      acudierPhoto: acudierPhoto,
      client: `${PREFIXES.CLIENT}${process.env.LOCAL_EMAIL2}`,
      clientName: clientName,
      clientPhoto: clientPhoto,
      from: fromValues[index],
      to: toValues[index],
      hospId: '10040',
      hospName: 'Hospital San José',
      startHour: random(10, 13) * 3600,
      endHour: random(16, 19) * 3600,
      price: random(120, 300),

      createdAt: parseInt(`${creationDate}0`),
      updatedAt: parseInt(`${creationDate}0`)
    };
    requestsList.push(request);
  });
  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ACUDIA_TABLE, data: requestsList });
};
