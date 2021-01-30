export const random = (min: number, max: number, decimals?: boolean) => {
  const rand = Math.random() * (max - min) + min;
  if (!decimals) return Math.round(rand);
  return parseInt(rand.toFixed(2));
};

export const formatTimeString = (time: number = 0) => {
  if (time < 10) return `0${time}`;
  return time;
};
