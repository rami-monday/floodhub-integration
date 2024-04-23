export const getUTCDate = (date: string) => {
  const currentDate = new Date(date);

  // Extract individual date components
  const year = currentDate.getUTCFullYear();
  const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(currentDate.getUTCDate()).padStart(2, "0");

  // Extract individual time components
  const hours = String(currentDate.getUTCHours()).padStart(2, "0");
  const minutes = String(currentDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getUTCSeconds()).padStart(2, "0");

  // Formatted UTC time string
  const formattedUtcTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

return formattedUtcTime;
};
