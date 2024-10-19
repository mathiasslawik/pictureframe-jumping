const image = {
  spike: 'spike',
  tiles: 'tiles',
  ei: 'ei',
} as const;

const scene = {
  boot: 'boot',
  main: 'main',
} as const;

const spritesheet = {
  player: 'player',
  knight: 'knight',
} as const;

const tilemap = {
  level1: 'level1',
} as const;

export const key = {
  image,
  scene,
  spritesheet,
  tilemap,
} as const;
