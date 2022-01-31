var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
import DynamoDbOperations from '../utils/dynamo-operations';
import * as getMyRequests from './getMyRequests';

const querySpy = jest.spyOn(DynamoDbOperations, 'query');

describe('Get my requests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should return empty data if there are not requests in DB', async () => {
    querySpy.mockReturnValue({ Items: [] } as any);

    const result = await getMyRequests.getMyRequests(
      {
        custom: { input: { role: 'acudier', status: 'ACCEPTED' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    expect(result.incoming).toHaveLength(0);
  });
  it('Should return incoming data if there are requests in DB', async () => {
    querySpy.mockReturnValue({ Items: [{ requestId: 'ID' }] } as any);

    const result = await getMyRequests.getMyRequests(
      {
        custom: { input: { role: 'acudier', status: 'ACCEPTED' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    console.log('result: ', result);
    expect(result.incoming).toHaveLength(1);
  });

  it('Should return completed data if there are requests in DB', async () => {
    querySpy.mockReturnValue({ Items: [{ requestId: 'ID', status: 'COMPLETED' }] } as any);

    const result = await getMyRequests.getMyRequests(
      {
        custom: { input: { role: 'acudier', status: 'ACCEPTED' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    console.log('result: ', result);
    expect(result.completed).toHaveLength(1);
  });

  it('Should return accepted data if there are requests in DB and user is client', async () => {
    querySpy.mockReturnValue({
      Items: [{ requestId: 'ID', status: 'ACCEPTED', from: '2021-10-10', startHour: 0 }]
    } as any);

    const result = await getMyRequests.getMyRequests(
      {
        custom: { input: { role: 'client', status: 'ACCEPTED' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    console.log('result: ', result);
    expect(result.active).toHaveLength(1);
  });
});
