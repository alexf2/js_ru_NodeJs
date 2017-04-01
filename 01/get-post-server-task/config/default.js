const path = require('path')

module.exports = {
     publicDir       : path.normalize(path.join(process.cwd(), '/public')),     
     filesDir        : path.normalize(path.join(process.cwd(), '/files')),
     serverUiPage    : path.normalize(path.join(process.cwd(), '/public', 'index.html')),
     uploadLimitBytes: 1048576,
     port            : 3000,
     host            : '127.0.0.1'
 }
