let i = 0
const handler = (req, res) => {
  i += 10;
  res.end(i.toString())
}


module.exports = handler
