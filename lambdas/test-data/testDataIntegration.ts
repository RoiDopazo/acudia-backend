import NAMES_DATA from './data/first-names.json';
import { PREFIXES, REQUEST_STATUS, TABLE_NAMES } from '../utils/constants';
import DynamoDbOperations from '../utils/dynamo-operations';
import { formatTimeString, random } from '../utils/utils';
import { addLocalTestUsers, addLocalTestAssignment, addLocalTestRequest } from './localTestUsers';

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
  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ACUDIA_TABLE, data: profileList });
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

      // Add a second assignment
      if (index < 2) {
        const assignment: IAssignment = {
          PK: `${PREFIXES.HOSPITAL}${hospIds}`,
          SK: `${PREFIXES.ITEM}${index}b`,
          acudierId: acudier.PK.split('#')[1],
          hospId: hosp,
          from: `2021-11-${formatTimeString(index + 1)}`,
          to: `2021-11-${formatTimeString(21)}`,
          startHour: random(7, 10) * 3600,
          endHour: random(19, 23) * 3600,
          fare: random(6, 15),
          createdAt: today.getTime(),
          updatedAt: today.getTime()
        };
        assignmentList.push(assignment);
      }
    });
  });
  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ASSIGNMENTS_TABLE, data: assignmentList });
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
  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ACUDIA_TABLE, data: commentList });
};

export const buildRequests = ({
  acudier,
  client,
  from,
  to,
  status,
  index
}: {
  acudier: IProfile;
  client: IProfile;
  index: number;
  from: string;
  to: string;
  status: REQUEST_STATUS;
}) => {
  const requestsList: IRequest[] = [];

  const creationDate = Math.round(Date.now() / 10);

  const request: IRequest = {
    PK: `${PREFIXES.REQUEST}${index}`,
    SK: new Date(from).getTime().toString(),
    status: status,
    acudier: `${PREFIXES.ACUDIER}${acudier.PK.split('#')[1]}`,
    acudierName: `${acudier.name} ${acudier.secondName ?? ''}`.trim(),
    acudierPhoto: acudier.photoUrl,
    client: `${PREFIXES.CLIENT}${client.PK.split('#')[1]}`,
    clientName: `${client.name} ${client.secondName ?? ''}`.trim(),
    clientPhoto: client.photoUrl,
    hospId: '10040',
    hospName: 'Hospital San José',
    from: from,
    to: to,
    startHour: random(10, 13) * 3600,
    endHour: random(16, 19) * 3600,
    price: random(120, 300),
    createdAt: parseInt(`${creationDate}0`),
    updatedAt: parseInt(`${creationDate}0`)
  };

  requestsList.push(request);
  DynamoDbOperations.batchAdd({ tableName: TABLE_NAMES.ACUDIA_TABLE, data: requestsList });
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
  // Add profiles
  const profiles: IProfile[] = buildProfiles({ acudiers, clients });

  // Add assignments
  buildAssignments({
    hospIds,
    acudiers: profiles.slice(0, acudiers),
    fromDate,
    toDate
  });

  // Add comments
  buildComments({ acudiers: profiles.slice(0, acudiers / 5) });

  // Add requests
  buildRequests({
    acudier: profiles[0],
    client: profiles[acudiers + 1],
    index: 0,
    from: '2021-08-12',
    to: '2021-08-15',
    status: REQUEST_STATUS.REJECTED
  });
  buildRequests({
    acudier: profiles[1],
    client: profiles[acudiers + 1],
    index: 1,
    from: '2021-12-12',
    to: '2021-12-15',
    status: REQUEST_STATUS.PENDING
  });
  buildRequests({
    acudier: profiles[1],
    client: profiles[acudiers + 1],
    index: 2,
    from: '2021-08-20',
    to: '2021-08-24',
    status: REQUEST_STATUS.PENDING
  });
  buildRequests({
    acudier: profiles[3],
    client: profiles[acudiers + 1],
    index: 3,
    from: '2021-10-04',
    to: '2021-10-30',
    status: REQUEST_STATUS.ACCEPTED
  });
  buildRequests({
    acudier: profiles[2],
    client: profiles[acudiers + 1],
    index: 4,
    from: '2021-10-04',
    to: '2021-10-30',
    status: REQUEST_STATUS.ACCEPTED
  });

  if (addLocalUsers) {
    addLocalTestUsers();
    addLocalTestAssignment({ fromDate, toDate });
    addLocalTestRequest();
  }
};

export { testDataIntegration };
