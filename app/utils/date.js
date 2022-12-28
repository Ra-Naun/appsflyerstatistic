export const getDateStr = (date, shiftDays = 0) => {
  const shiftedDate = shiftDate(date, shiftDays);

  return `${shiftedDate.getFullYear()}-${shiftedDate.getMonth() + 1}-${shiftedDate.getDate()}`;
};

export const shiftDate = (date, shiftDays = 0) => {
  const cloneDate = new Date(date);
  const shiftedDate = new Date(cloneDate.setDate(cloneDate.getDate() + shiftDays));
  return shiftedDate;
};
