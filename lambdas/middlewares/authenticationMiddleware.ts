const authenticationMiddleware = (config) => {
  // might set default options in config
  return {
    before: (handler, next) => {
      if (handler.arguments.identity) {
        handler.context.identity = handler.arguments.identity;
      } else {
        handler.context.identity = 'roidopazo@gmail.com';
      }
      next();
    },
  };
};

export { authenticationMiddleware };
