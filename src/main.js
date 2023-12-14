const { menubar } = require('menubar');
const path = require('path');

const mb = menubar({
  index: `file://${path.join(__dirname, 'index.html')}`,
  tooltip: 'Your App Name',
  //icon: path.join(__dirname, 'assets', 'icon-0-Template.png'),
});

mb.on('ready', () => {
  console.log('App is ready');
});
