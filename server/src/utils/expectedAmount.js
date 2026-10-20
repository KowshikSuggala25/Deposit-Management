const getExpectedAmount = (amount, interestRate, depositDate, period, category = "bank") => {
  const principal = Number(amount) || 0;
  const rate = Number(interestRate) || 0;
  const elapsedMilliseconds = Math.max(Date.now() - new Date(depositDate).getTime(), 0);
  const elapsedYears = elapsedMilliseconds / (365.25 * 24 * 60 * 60 * 1000);
  const duration = category === "bank"
    ? (period === "month" ? elapsedYears / 12 : elapsedYears)
    : (period === "month" ? elapsedYears * 12 : elapsedYears);

  return Number((principal + principal * (rate / 100) * duration).toFixed(2));
};

module.exports = getExpectedAmount;
