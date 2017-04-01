// В какой момент срабатывают - до или после чтения файла?
const fs = require('fs');

// libuv
// v8

// microqueue = [nextTick, promise]

// macroqueue = [open]
//
fs.open(__filename, 'r', (err, fd) => {
  console.log('IO!'); // 1
});

// for (let i = 0; i < 3; i++) {
  // setImmediate(() => {
  //   console.log('immediate'); // 2
  // });

  // new Promise(resolve => {
  //   resolve('promise'); // 4
  // }).then(console.log);

  process.nextTick(() => {
    console.log('nextTick2'); // 3
  });

  process.nextTick(() => {
    console.log('nextTick1'); // 3
  });


// }

console.log('start!'); // 5
