module.exports.buildId = (identity) => {
  if (identity.username) {
    return identity.username;
  } else {
    return '';
  }
};
