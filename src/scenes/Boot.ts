import { Scene } from 'phaser';

import * as assets from '../assets';
import { key } from '../constants';

export class Boot extends Scene {
  constructor() {
    super(key.scene.boot);
  }

  preload() {
    this.load.spritesheet(key.spritesheet.knight, assets.spritesheets.knight, {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0,
    });

    this.load.image(key.image.spike, assets.images.spike);

    this.load.image(key.image.ei, assets.images.ei);

    this.load.image(key.image.tiles, assets.tilemaps.tilesetWorld);

    this.load.tilemapTiledJSON(key.tilemap.level1, assets.tilemaps.level1);
  }

  create() {
    this.scene.start(key.scene.main);
  }
}
