module.exports = function (server) {

  console.log('Ensuring indexes exist...'.blue);
  server.models().forEach((model) => {
    if (model.dataSource) {
      model.dataSource.autoupdate((err, data) => {
        if (err) {
          console.log('Unexpected error running autoupdate on model'.red);
          console.log(err);
        }
      });
    }
  });
  console.log('done ensuring indexes.'.green);
};
