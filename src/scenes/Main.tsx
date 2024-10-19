import Phaser from 'phaser';

import {
  key,
  Tile,
  TilemapLayer,
  TilemapObject,
  TILESET_NAME,
} from '../constants';
import { Player } from '../sprites';

export class Main extends Phaser.Scene {
  public groundLayer!: Phaser.Tilemaps.TilemapLayer;

  private foregroundLayer!: Phaser.Tilemaps.TilemapLayer;
  private player!: Player;
  private spikeGroup!: Phaser.Physics.Arcade.StaticGroup;
  private isPlayerDead = false;

  constructor() {
    super(key.scene.main);
  }

  create() {
    this.isPlayerDead = false;

    const map = this.make.tilemap({ key: key.tilemap.level1 });
    const tileset = map.addTilesetImage(TILESET_NAME, key.image.tiles)!;

    map.createLayer(TilemapLayer.Background, tileset);
    this.groundLayer = map.createLayer(TilemapLayer.Ground, tileset)!;

    this.foregroundLayer = map.createLayer(TilemapLayer.Foreground, tileset)!;
    this.foregroundLayer.setDepth(10);

    // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map
    const spawnPoint = map.findObject(
      TilemapLayer.Objects,
      ({ name }) => name === TilemapObject.SpawnPoint,
    )!;
    this.player = new Player(this, spawnPoint.x!, spawnPoint.y!);

    // Collide the player against the ground layer
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.physics.world.addCollider(this.player, this.groundLayer);

    // The map contains a row of spikes. The spike only take a small sliver of the tile graphic, so
    // if we let arcade physics treat the spikes as colliding, the player will collide while the
    // sprite is hovering over the spikes. We'll remove the spike tiles and turn them into sprites
    // so that we give them a more fitting hitbox
    this.spikeGroup = this.physics.add.staticGroup();
    this.groundLayer.forEachTile((tile) => {
      if (tile.index === Tile.Spike) {
        const spike = this.spikeGroup.create(
          tile.getCenterX(),
          tile.getCenterY(),
          key.image.spike,
        );

        // The map has spikes rotated in Tiled (z key), so parse out that angle to the correct body
        // placement
        spike.rotation = tile.rotation;
        if (spike.angle === 0) {
          spike.body.setSize(32, 6).setOffset(0, 26);
        } else if (spike.angle === -90) {
          spike.body.setSize(6, 32).setOffset(26, 0);
        } else if (spike.angle === 90) {
          spike.body.setSize(6, 32).setOffset(0, 0);
        }

        this.groundLayer.removeTileAt(tile.x, tile.y);
      }
    });

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    if (this.isPlayerDead) {
      return;
    }

    this.player.update();

    if (
      this.player.y > this.groundLayer.height ||
      this.physics.world.overlap(this.player, this.spikeGroup)
    ) {
      // Flag that the player is dead so that we can stop update from running in the future
      this.isPlayerDead = true;

      this.cameras.main.shake(100, 0.05);
      this.cameras.main.fade(250, 0, 0, 0);

      // Freeze the player to leave them on screen while fading but remove the marker immediately
      this.player.freeze();

      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.player.destroy();
        this.scene.restart();
      });
    }
  }
}
