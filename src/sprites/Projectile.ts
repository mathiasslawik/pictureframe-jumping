import { Scene } from 'phaser';

import { key } from '../constants';
import { Main } from '../scenes';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  body!: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    frame = 0,
    flipX: boolean,
    velocity: Phaser.Math.Vector2,
  ) {
    super(scene, x, y, key.image.ei, frame);

    // Enable sprite physics
    this.enablePhysics(flipX, velocity);
  }

  private enablePhysics(flipX: boolean, velocity: Phaser.Math.Vector2) {
    // Add a collider
    this.scene.physics.world.addCollider(
      this,
      (this.scene as Main).groundLayer,
    );

    // Enable physics for the sprite
    this.scene.physics.world.enable(this);

    // Create the physics-based sprite that we will move around and animate
    this.setDrag(500, 0)
      .setSize(8, 8)
      .setVelocityX((flipX ? -300 : 300) + velocity.x)
      .setVelocityY(-100 + velocity.y);

    // Add the sprite to the scene
    this.scene.add.existing(this);
  }
}
