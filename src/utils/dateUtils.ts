export const getTwoDaysAgo = () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const year = twoDaysAgo.getFullYear();
  const month = String(twoDaysAgo.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(twoDaysAgo.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getThisYear = () => {
  const today = new Date();
  return today.getFullYear();
};
