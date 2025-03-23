const convertDate = (
  date,
  options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
) => {
  const OriginalDate = new Date(date);
  return OriginalDate.toLocaleString(
    'en-US',
    options,
  );
};

export default convertDate;
