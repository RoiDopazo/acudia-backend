var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
import DynamoDbOperations from '../utils/dynamo-operations';
import * as searchAssignments from './searchAssignments';

const querySpy = jest.spyOn(DynamoDbOperations, 'query');
const listSpy = jest.spyOn(DynamoDbOperations, 'list');

describe('Search assignments', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should read data from database', async () => {
    querySpy.mockReturnValue({ Count: 10 } as any);
    listSpy.mockReturnValue({} as any);

    await searchAssignments.searchAssignment(
      {
        custom: { input: {} }
      },
      { functionName: '' } as any,
      () => {}
    );
    expect(querySpy).toHaveBeenCalled();
    expect(listSpy).toHaveBeenCalled();
  });

  it('Should return [] is there are no assignments', async () => {
    querySpy.mockReturnValue({ Count: 0 } as any);
    listSpy.mockReturnValue({} as any);

    const result = await searchAssignments.searchAssignment(
      {
        custom: { input: {} }
      },
      { functionName: '' } as any,
      () => {}
    );

    expect(querySpy).toHaveBeenCalled();
    expect(listSpy).not.toHaveBeenCalled();
    expect(result.items).toHaveLength(0);
  });

  it('Should return [] if couldnt find any acudier in DB', async () => {
    querySpy.mockReturnValue({ Count: 10 } as any);
    listSpy.mockReturnValue({ result: { Items: [] } } as any);

    const result = await searchAssignments.searchAssignment(
      {
        custom: { input: {} }
      },
      { functionName: '' } as any,
      () => {}
    );

    expect(querySpy).toHaveBeenCalled();
    expect(listSpy).toHaveBeenCalled();
    expect(result.items).toHaveLength(0);
  });
});
