var blessed = require('blessed')
  , screen = blessed.screen();

var box = blessed.box({
  parent: screen,
  left: 0,
  top: 0,
  width: '100%',
  height: '90%',
  bg: 0,
  content: 'HelloWorld\nA another line!'
})

var input = blessed.textbox({
  parent: screen,
  bg: 0,
  mouse: true,
  keys: true,
  name: 'submit',
  width: '100%',
  focused: true,
  height: 1,
  left: 0,
  right: 0,
  bottom: 0
})

input.on('submit', function() {
  box.setContent(input.getValue())
  input.clearValue()
  screen.render()
})

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render();

