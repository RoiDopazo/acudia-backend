import { PREFIXES, REQUEST_STATUS, TABLE_NAMES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';
import { formatTimeString, random } from '../utils/utils';
import { buildRequests } from './testDataIntegration';

const LOCAL_HOSP_ID = '10040';
const today = new Date();

const clientName = 'roi-client-test';
const acudierName = 'roi-acudier-test';

const clientPhoto = 'https://randomuser.me/api/portraits/men/99.jpg';
const acudierPhoto = 'https://randomuser.me/api/portraits/men/98.jpg';

const acudierProfile = {
  PK: `${PREFIXES.ACUDIER}${process.env.LOCAL_EMAIL}`,
  name: acudierName,
  photo: acudierPhoto
};

const clientProfile = {
  PK: `${PREFIXES.ACUDIER}${process.env.LOCAL_EMAIL2}`,
  name: clientName,
  photo: clientPhoto
};

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
  buildRequests({
    acudier: acudierProfile as any,
    client: clientProfile as any,
    index: 9990,
    from: '2021-08-12',
    to: '2021-08-15',
    status: REQUEST_STATUS.REJECTED
  });
  buildRequests({
    acudier: acudierProfile as any,
    client: clientProfile as any,
    index: 9991,
    from: '2021-12-12',
    to: '2021-12-15',
    status: REQUEST_STATUS.PENDING
  });
  buildRequests({
    acudier: acudierProfile as any,
    client: clientProfile as any,
    index: 9992,
    from: '2021-08-20',
    to: '2021-08-24',
    status: REQUEST_STATUS.PENDING
  });
  buildRequests({
    acudier: acudierProfile as any,
    client: clientProfile as any,
    index: 9993,
    from: '2021-10-04',
    to: '2021-10-30',
    status: REQUEST_STATUS.ACCEPTED
  });
  buildRequests({
    acudier: acudierProfile as any,
    client: clientProfile as any,
    index: 9994,
    from: '2021-10-04',
    to: '2021-10-05',
    status: REQUEST_STATUS.ACCEPTED
  });
  buildRequests({
    acudier: acudierProfile as any,
    client: clientProfile as any,
    index: 9995,
    from: '2021-10-01',
    to: '2021-10-03',
    status: REQUEST_STATUS.COMPLETED
  });
};
