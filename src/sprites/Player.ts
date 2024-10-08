import Phaser from 'phaser';

import { key } from '../constants';

enum Animation {
  Idle = 'PlayerIdle',
  Run = 'PlayerRun',
}

type Cursors = Record<
  'w' | 'a' | 's' | 'd' | 'up' | 'left' | 'down' | 'right',
  Phaser.Input.Keyboard.Key
>;

export class Player extends Phaser.Physics.Arcade.Sprite {
  body!: Phaser.Physics.Arcade.Body;
  private cursors: Cursors;

  private hasDoubleJumped: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture = key.spritesheet.player,
    frame = 0,
  ) {
    super(scene, x, y, texture, frame);

    // Add cursor keys
    this.cursors = this.createCursorKeys();

    // Create sprite animations
    this.createAnimations();

    // Enable sprite physics
    this.enablePhysics();

    this.cursors.up.on('down', () => {
      // Only allow the player to jump if they are on the ground
      if (this.body.blocked.down) {
        this.setVelocityY(-500);
      } else if (this.hasDoubleJumped === false) {
        this.setVelocityY(-500);
        this.hasDoubleJumped = true;
      }
    });
  }

  private enablePhysics() {
    // Enable physics for the sprite
    this.scene.physics.world.enable(this);

    // Create the physics-based sprite that we will move around and animate
    this.setDrag(1000, 0)
      .setMaxVelocity(300, 400)
      .setSize(18, 24)
      .setOffset(7, 9);

    // Add the sprite to the scene
    this.scene.add.existing(this);
  }

  private createCursorKeys() {
    return this.scene.input.keyboard!.addKeys(
      'w,a,s,d,up,left,down,right',
    ) as Cursors;
  }

  private createAnimations() {
    // Create the animations we need from the player spritesheet
    const anims = this.scene.anims;

    if (!anims.exists(Animation.Idle)) {
      anims.create({
        key: Animation.Idle,
        frames: anims.generateFrameNumbers(key.spritesheet.player, {
          start: 0,
          end: 3,
        }),
        frameRate: 3,
        repeat: -1,
      });
    }

    if (!anims.exists(Animation.Run)) {
      anims.create({
        key: Animation.Run,
        frames: anims.generateFrameNumbers(key.spritesheet.player, {
          start: 8,
          end: 15,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }
  }

  freeze() {
    this.body.moves = false;
  }

  update() {
    const acceleration = this.body.blocked.down ? 600 : 200;

    // Allow double jumping when blocked down
    if (this.body.blocked.down) {
      this.hasDoubleJumped = false;
    }

    // Apply horizontal acceleration when left or right are applied
    switch (true) {
      case this.cursors.left.isDown:
      case this.cursors.a.isDown:
        // No need to have a separate set of graphics for running to the left & to the right
        // Instead we can just mirror the sprite
        this.setFlipX(true);
        this.setAccelerationX(-acceleration);
        break;

      case this.cursors.right.isDown:
      case this.cursors.d.isDown:
        this.setFlipX(false);
        this.setAccelerationX(acceleration);
        break;

      default:
        this.setAccelerationX(0);
    }

    // Update the animation/texture based on the state of the player
    if (this.body.blocked.down) {
      this.anims.play(
        this.body.velocity.x ? Animation.Run : Animation.Idle,
        true,
      );
    } else {
      this.anims.stop();
      this.setTexture(key.spritesheet.player, 10);
    }
  }
}
