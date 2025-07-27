/**
 * Returns the date of two days ago in the format YYYY-MM-DD.
 *
 * @returns {string} - A string representing the date two days ago.
 */
export const getTwoDaysAgo = () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const year = twoDaysAgo.getFullYear();
  const month = String(twoDaysAgo.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(twoDaysAgo.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Returns the current year.
 *
 * @returns {number} - The current year as a number.
 */
export const getThisYear = () => {
  const today = new Date();
  return today.getFullYear();
};
