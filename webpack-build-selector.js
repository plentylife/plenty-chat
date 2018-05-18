function webpackSelection (serverTest, server, library, visualTests) {
  return [
    serverTest,
    // server,
    library,
    visualTests
  ]
}

module.exports = webpackSelection
