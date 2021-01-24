const authenticationMiddleware = (config) => {
  // might set default options in config
  return {
    before: (handler, next) => {
      handler.event.custom = {};
      handler.event.custom.identity = handler.event.arguments.identity.username ?? process.env.LOCAL_EMAIL;
      handler.event.custom.input = handler.event.arguments?.arguments?.input;
      next();
    },
  };
};

export { authenticationMiddleware };
