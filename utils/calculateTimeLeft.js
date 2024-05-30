export function calculateTimeLeft(expiry) {
  const currentDate = new Date();
  const expiryDate = new Date(expiry);

  if (currentDate > expiryDate) {
    return 0;
  }

  const timeLeft = expiryDate - currentDate;

  return timeLeft / 1000;
}
