import NAMES_DATA from './data/first-names.json';
import { PREFIXES, TABLE_NAMES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';
import { formatTimeString, random } from '../utils/utils';
import { addLocalTestUsers, addLocalTestAssignment } from './localTestUsers';

const today = new Date();
const todayString = today.toLocaleDateString('en-GB');

const buildProfiles = ({ acudiers, clients }: { acudiers: number; clients: number }) => {
  const profileList: IProfile[] = [];
  const total = acudiers + clients;

  for (let i = 0; i < total; i++) {
    const name = NAMES_DATA[random(0, NAMES_DATA.length)];
    const isAcudier = i < acudiers;
    const isMale = random(0, 1);

    const profile: IProfile = {
      PK: `${isAcudier ? PREFIXES.ACUDIER : PREFIXES.CLIENT}${todayString}-${i + 1}`,
      SK: PREFIXES.PROFILE,
      name: name,
      secondName: random(0, 1) ? NAMES_DATA[random(0, NAMES_DATA.length)] : undefined,
      email: `${name}${random(0, 100)}@gmail.com`,
      genre: isMale ? 'MALE' : 'FEMALE',
      birthDate: `19${random(40, 99)}-01-01`,
      photoUrl: `https://randomuser.me/api/portraits/${isMale ? 'men' : 'women'}/${i}.jpg`,
      jobsCompleted: isAcudier ? random(0, 80) : undefined,
      popularity: isAcudier ? random(2, 5, true) : undefined,
      createdAt: today.getTime(),
      updatedAt: today.getTime(),
      deletedAt: undefined
    };
    profileList.push(profile);
  }
  return profileList;
};

const buildAssignments = ({
  hospIds,
  acudiers,
  fromDate,
  toDate
}: {
  hospIds: string[];
  acudiers: IProfile[];
  fromDate: string;
  toDate: string;
}) => {
  const assignmentList: IAssignment[] = [];

  hospIds.map((hosp) => {
    acudiers.map((acudier, index) => {
      const assignment: IAssignment = {
        PK: `${PREFIXES.HOSPITAL}${hospIds}`,
        SK: `${PREFIXES.ITEM}${index}`,
        acudierId: acudier.PK.split('#')[1],
        hospId: hosp,
        from: `${fromDate}-${formatTimeString(index + 1)}`,
        to: `${toDate}-${formatTimeString(index + 1)}`,
        startHour: random(7, 10) * 3600,
        endHour: random(19, 23) * 3600,
        fare: random(6, 15),
        createdAt: today.getTime(),
        updatedAt: today.getTime()
      };
      assignmentList.push(assignment);
    });
  });
  return assignmentList;
};

const buildComments = ({ acudiers }: { acudiers: IProfile[] }) => {
  const commentList: IComment[] = [];

  acudiers.map((acudier) => {
    for (let i = 0; i < 5; i++) {
      const creationDate = Math.round(Date.now() / 10);
      const formattedCreationDate = `${creationDate}${i}`;
      const name = NAMES_DATA[random(0, NAMES_DATA.length)];

      const comment: IComment = {
        PK: `${acudier.PK}`,
        SK: `${PREFIXES.COMMENT}${formattedCreationDate}`,
        author: `${name} ${random(0, 1) ? NAMES_DATA[random(0, NAMES_DATA.length)] : ''}`,
        comment: 'Mocked comment data',
        date: `2020-02-${formatTimeString(random(1, 5))}`,
        rating: random(2, 5, true)
      };
      commentList.push(comment);
    }
  });
  return commentList;
};

const testDataIntegration = ({
  acudiers = 10,
  clients = 4,
  addLocalUsers,
  hospIds = [],
  fromDate = '2021-02',
  toDate = '2021-10'
}: {
  acudiers: number;
  clients: number;
  addLocalUsers: boolean;
  hospIds: string[];
  fromDate: string;
  toDate: string;
}) => {
  const profiles: IProfile[] = buildProfiles({ acudiers, clients });

  // Add profiles
  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ACUDIA_TABLE, data: profiles });

  const assignments: IAssignment[] = buildAssignments({
    hospIds,
    acudiers: profiles.slice(0, acudiers),
    fromDate,
    toDate
  });

  // Add assignments
  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ASSIGNMENTS_TABLE, data: assignments });

  const comments: IComment[] = buildComments({ acudiers: profiles.slice(0, acudiers / 5) });

  // Add comments
  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ACUDIA_TABLE, data: comments });

  if (addLocalUsers) {
    addLocalTestUsers();
    addLocalTestAssignment({ fromDate, toDate });
  }
};

export { testDataIntegration };
