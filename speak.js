const say = require('async-sayjs');

function speak(text) {
  fs.readFile(text, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    say.speak(data);
  });
}

module.exports = { speak };
