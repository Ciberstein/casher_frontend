const cutString = (string, max) => {
  if (string?.length > max) {
    return string.slice(0, max - 3) + '...';
  } else {
    return string;
  }
};

export default cutString;
