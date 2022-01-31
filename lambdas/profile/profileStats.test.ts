var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
import DynamoDbOperations from '../utils/dynamo-operations';
import * as profileStats from './profileStats';

const querySpy = jest.spyOn(DynamoDbOperations, 'query');

describe('Profile stats', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should return stats if data is in DB', async () => {
    querySpy.mockReturnValue({ Items: [{}, {}], Count: 10 } as any);

    const result = await profileStats.profileStats(
      {
        custom: { input: { role: 'acudier' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    expect(result.jobsCompleted).toEqual(10);
  });

  it('Should return 0 jobs if user has no requests completed', async () => {
    querySpy.mockReturnValue({ Items: [], Count: 0 } as any);

    const result = await profileStats.profileStats(
      {
        custom: { input: { role: 'acudier' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    expect(result.jobsCompleted).toEqual(0);
  });

  it('Should return as bestAcudier the one with more jobs/request completed', async () => {
    querySpy.mockReturnValue({
      Items: [
        { acudier: 'J', acudierName: 'Jose' },
        { acudier: 'P', acudierName: 'Pedro' },
        { acudier: 'J', acudierName: 'Jose' }
      ],
      Count: 3
    } as any);

    const result = await profileStats.profileStats(
      {
        custom: { input: { role: 'acudier' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    expect(result.acudier.name).toEqual('Jose');
  });

  it('Should return as bestHops the one with more jobs/request completed', async () => {
    querySpy.mockReturnValue({
      Items: [
        { hospId: 'C', hospName: 'CHUAC' },
        { hospId: 'S', hospName: 'CHUS' },
        { hospId: 'C', hospName: 'CHUAC' }
      ],
      Count: 3
    } as any);

    const result = await profileStats.profileStats(
      {
        custom: { input: { role: 'acudier' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    expect(result.hosp.name).toEqual('CHUAC');
  });
});
