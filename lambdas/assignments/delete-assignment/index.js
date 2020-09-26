const { find } = require('./../../util/dynamo-operations');

exports.handler = async (event) => {
  console.log('--------------------');
  console.log('---- getBook/index.js');
  console.log('--------------------');
  console.log(event);

  // const id = event.arguments.id;
  // const book = await find(id, 'AcudiaTable');

  // console.log(book);
  return true;
};
