var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
import DynamoDbOperations from '../utils/dynamo-operations';
import * as getAcudierRequests from './getAcudierRequests';

const querySpy = jest.spyOn(DynamoDbOperations, 'query');

describe('Get acudier requests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should read from database acudier requests info', async () => {
    querySpy.mockReturnValue({} as any);
    await getAcudierRequests.getAcudierRequests(
      {
        custom: { input: {} }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
  });

  it('Should through an error if no input is provided', async () => {
    querySpy.mockReturnValue({} as any);
    const result = await getAcudierRequests.getAcudierRequests(
      {
        custom: {}
      },
      { functionName: '' } as any,
      () => {}
    );

    expect(result).toBeInstanceOf(TypeError);
    expect(querySpy).not.toHaveBeenCalled();
  });
});
