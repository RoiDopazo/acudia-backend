export const random = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min) + min);
};

export const formatTimeString = (time: number = 0) => {
  if (time < 10) return `0${time}`;
  return time;
};
