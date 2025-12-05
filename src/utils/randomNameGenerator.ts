const names = [
  'AmedLion',
  'GreenWave',
  'TribunStar',
  'DiyarbakirSoul',
  'CurvaSur',
  'NorthWall',
  'SouthSide',
  'EastCrew',
  'WestEnd',
];

export const randomNameGenerator = (): string => {
  const randomName = names[Math.floor(Math.random() * names.length)];
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${randomName}-${suffix}`;
};

export default randomNameGenerator;
