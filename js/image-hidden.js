let keysPressed = [];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
const hiddenContent = $('#hidden-content');
const konamiText = $('#konami-text');

$(document).keydown(function(event) {
  keysPressed.push(event.code);
  keysPressed.splice(-konamiCode.length - 1, keysPressed.length - konamiCode.length);
  if (JSON.stringify(keysPressed) === JSON.stringify(konamiCode)) {
    if (hiddenContent.is(':hidden')) {
      hiddenContent.show();
      konamiText.hide();
    } else {
      hiddenContent.hide();
      konamiText.show();
    }
  }
});
