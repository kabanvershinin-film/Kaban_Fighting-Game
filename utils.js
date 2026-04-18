function rectangularCollision({ rect1, rect2 }) {
  return (
    rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x &&
    rect1.attackBox.position.x <= rect2.position.x + rect2.width &&
    rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
    rect1.attackBox.position.y <= rect2.position.y + rect2.height
  );
}

function determineWinner({ player, enemy, timerId, resultEl }) {
  clearInterval(timerId);
  resultEl.style.display = 'block';

  if (player.health === enemy.health) {
    resultEl.innerHTML = '🤝 НИЧЬЯ!';
  } else if (player.health > enemy.health) {
    resultEl.innerHTML = '🐗 КАБАН ПОБЕДИЛ!';
  } else {
    resultEl.innerHTML = '❓ НОУНЕЙМ ПОБЕДИЛ!';
  }
}
