var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
import DynamoDbOperations from '../utils/dynamo-operations';
import * as answerRequest from './answerRequest';

const updateSpy = jest.spyOn(DynamoDbOperations, 'update');

describe('Answer requests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should return true if data is updated in DB', async () => {
    updateSpy.mockReturnValue({} as any);

    const result = await answerRequest.answerRequest(
      {
        custom: { input: { role: 'acudier', status: 'ACCEPTED' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(updateSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
  it('Should return false if error happens', async () => {
    updateSpy.mockImplementation(() => {
      throw new Error();
    });

    const result = await answerRequest.answerRequest(
      {
        custom: { input: { role: 'acudier', status: 'ACCEPTED' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(updateSpy).toHaveBeenCalled();
    expect(result).toBeFalsy();
  });
  it('Should return false if input is not correct', async () => {
    const result = await answerRequest.answerRequest(
      {
        custom: { input: { role: 'acudier', status: 'Pending' } }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(updateSpy).not.toHaveBeenCalled();
    expect(result).toBeFalsy();
  });
});
