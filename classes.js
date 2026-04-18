class Fighter {
  constructor({ name, position, velocity, color, offset }) {
    this.name = name;
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.width = 50;
    this.height = 150;
    this.health = 100;
    this.lastKey = '';
    this.attackBox = {
      position: { x: this.position.x, y: this.position.y },
      offset,
      width: 100,
      height: 50,
    };
    this.isAttacking = false;
    this.isDead = false;
    this.attackFrame = 0;
    this.facingRight = true;
    this.walkFrame = 0;
    this.hitFlash = 0;
    this.jumpCount = 0;
  }

  draw(ctx) {
    const { x, y } = this.position;

    // hit flash effect
    const alpha = this.hitFlash > 0 ? 0.4 + Math.sin(this.hitFlash * 0.8) * 0.3 : 1;
    ctx.globalAlpha = alpha;

    // body
    ctx.fillStyle = this.color.body;
    ctx.fillRect(x, y, this.width, this.height);

    // head (with snout for Kaban)
    ctx.fillStyle = this.color.head;
    ctx.fillRect(x + 5, y - 40, 40, 40);

    // snout / face detail
    if (this.name === '🐗 Кабан') {
      // snout
      ctx.fillStyle = '#c2785a';
      ctx.fillRect(x + 12, y - 18, 26, 14);
      // nostrils
      ctx.fillStyle = '#7a3e2e';
      ctx.beginPath();
      ctx.arc(x + 18, y - 12, 4, 0, Math.PI * 2);
      ctx.arc(x + 32, y - 12, 4, 0, Math.PI * 2);
      ctx.fill();
      // tusks
      ctx.fillStyle = '#f5f0dc';
      ctx.fillRect(x + 10, y - 8, 8, 6);
      ctx.fillRect(x + 32, y - 8, 8, 6);
      // eyes
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(x + 16, y - 28, 5, 0, Math.PI * 2);
      ctx.arc(x + 34, y - 28, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Noname: mystery face with ?
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(x + 16, y - 28, 5, 0, Math.PI * 2);
      ctx.arc(x + 34, y - 28, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#555';
      ctx.fillRect(x + 10, y - 16, 30, 6);
      // ? mark
      ctx.fillStyle = '#aaa';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('?', x + 16, y - 4);
    }

    // legs (walking animation)
    const legOffset = Math.sin(this.walkFrame * 0.3) * 8;
    ctx.fillStyle = this.color.body;
    ctx.fillRect(x + 5, y + this.height, 15, 20 + legOffset);
    ctx.fillRect(x + 30, y + this.height, 15, 20 - legOffset);

    // arm / punch
    if (this.isAttacking) {
      ctx.fillStyle = this.color.head;
      const punchX = this.facingRight
        ? x + this.width
        : x - 50;
      ctx.fillRect(punchX, y + 30, 50, 20);

      // fist glow
      ctx.shadowColor = this.color.glow;
      ctx.shadowBlur = 20;
      ctx.fillStyle = this.color.head;
      ctx.fillRect(punchX, y + 30, 50, 20);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;

    // attack box (debug — hidden by default)
    if (false && this.isAttacking) {
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      ctx.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
      );
    }
  }

  update(ctx, canvas) {
    this.draw(ctx);

    if (this.isDead) return;

    if (this.hitFlash > 0) this.hitFlash--;

    // move attack box
    if (this.facingRight) {
      this.attackBox.position.x = this.position.x + this.width + this.attackBox.offset.x;
    } else {
      this.attackBox.position.x = this.position.x - this.attackBox.width - this.attackBox.offset.x;
    }
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    // gravity
    this.position.y += this.velocity.y;
    const ground = canvas.height - this.height - 60;
    if (this.position.y >= ground) {
      this.velocity.y = 0;
      this.position.y = ground;
      this.jumpCount = 0;
    } else {
      this.velocity.y += 0.7;
    }

    // walking animation
    if (Math.abs(this.velocity.x) > 0.5) {
      this.walkFrame++;
    }

    // attack timer
    if (this.isAttacking) {
      this.attackFrame++;
      if (this.attackFrame > 15) {
        this.isAttacking = false;
        this.attackFrame = 0;
      }
    }
  }

  attack() {
    if (!this.isAttacking) {
      this.isAttacking = true;
      this.attackFrame = 0;
    }
  }

  takeHit() {
    this.health -= 10;
    this.hitFlash = 12;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }
}
