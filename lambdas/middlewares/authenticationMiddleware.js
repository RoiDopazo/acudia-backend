const authenticationMiddleware = (config) => {
  // might set default options in config
  return {
    before: (handler, next) => {
      console.log('asdasd', handler);
      handler.context.identity = 'eeeee';
      next();
    },
  };
};

module.exports = authenticationMiddleware;
