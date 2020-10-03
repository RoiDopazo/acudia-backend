export const buildId = (identity) => {
  if (identity.username) {
    return identity.username;
  } else {
    return '';
  }
};
