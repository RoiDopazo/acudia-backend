import { PREFIXES, TABLE_NAMES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';
import { random } from '../utils/utils';

export const addLocalTestUsers = () => {
  const today = new Date();

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
