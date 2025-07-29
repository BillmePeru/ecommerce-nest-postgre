export const getPriceWithIgv = (price: number) => {
  return Number((price * 1.18).toFixed(2));
};

export const getIgv = (price: number) => {
  return Number((price * 0.18).toFixed(2));
};
