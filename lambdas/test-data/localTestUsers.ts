import { PREFIXES, TABLE_NAMES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';
import { formatTimeString, random } from '../utils/utils';

const LOCAL_HOSP_ID = '10040';
const today = new Date();

export const addLocalTestUsers = () => {
  const profile1: IProfile = {
    PK: `${PREFIXES.ACUDIER}${process.env.LOCAL_EMAIL}`,
    SK: `${PREFIXES.PROFILE}`,
    name: 'roi-test-user',
    secondName: '1',
    email: `${process.env.LOCAL_EMAIL}`,
    genre: 'MALE',
    birthDate: `01-01-19${random(40, 99)}`,
    photoUrl: `https://randomuser.me/api/portraits/men/99.jpg`,
    createdAt: today.getTime(),
    updatedAt: today.getTime(),
    deletedAt: undefined
  };
  const profile2: IProfile = {
    PK: `${PREFIXES.CLIENT}${process.env.LOCAL_EMAIL2}`,
    SK: `${PREFIXES.PROFILE}`,
    name: 'roi-test-user',
    secondName: '2',
    email: `${process.env.LOCAL_EMAIL2}`,
    genre: 'MALE',
    birthDate: `01-01-19${random(40, 99)}`,
    photoUrl: `https://randomuser.me/api/portraits/men/98.jpg`,
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
    acudierId: `${PREFIXES.ACUDIER}${process.env.LOCAL_EMAIL}`,
    hospId: LOCAL_HOSP_ID,
    hospName: 'Hospital San José',
    hospProvince: 'Álava',
    from: `${fromDate}-${formatTimeString(0)}`,
    to: `${toDate}-${formatTimeString(0)}`,
    startHour: random(7, 10) * 3600,
    endHour: random(19, 23) * 3600,
    fare: random(6, 15),
    createdAt: today.getTime(),
    updatedAt: today.getTime()
  };

  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ASSIGNMENTS_TABLE, data: [assignment] });
};
