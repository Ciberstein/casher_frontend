const currencyFormat = (value, currency = 'USD', country = 'es-CO') => {
  const output = new Intl.NumberFormat(country, {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
  }).format(value);

  return output;
}

export default currencyFormat;