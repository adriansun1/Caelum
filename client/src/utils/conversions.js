const ustUusdRatio = 1000000;

export function convertUstToUusd(amount) {
  return amount * ustUusdRatio;
}

export function convertUusdToUst(amount) {
  return amount / ustUusdRatio;
}
