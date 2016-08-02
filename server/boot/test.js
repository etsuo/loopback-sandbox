'use strict';

module.exports = function (app) {
  console.log('Starting test...'.blue);

  createTestGeoEntry(app)
    .then(doSimpleGeoQuery)
    .then(doCompoundGeoQuery)
    .then(() => console.log('Examples done.'.rainbow))
    .catch(function (err) {
      console.log(`err: ${err}`.red);
      process.exit(1);
    });
};

function createTestGeoEntry(app) {
  return new Promise(function (resolve, reject) {
    let Test = app.models.Test;

    Test.findOrCreate(
      {
        where: {name: 'test'}
      },
      {
        location: {
          "lat": 41.128611,
          "lng": -73.707778
        },
        name: 'test'
      }, function (err, result) {
        if (err) {
          console.log(`Unexpected error attempting to create test location document in MongoDB`.red);
          return reject(err);
        }
        console.log(`Test location created ${JSON.stringify(result, null, 2)}`.green);
        resolve({Test, result});
      });
  });
}

function doSimpleGeoQuery(params) {
  return new Promise(function (resolve, reject) {
    let Test = params.Test;
    let entry = params.result;

    console.log('Performing simple geo query:'.blue);
    let query = {
      where: {
        location: {
          near: {lat: entry.location.lat, lng: entry.location.lng}
        }
      }
    };
    console.log(`Query: ${JSON.stringify(query, null, 2)}`.magenta);

    Test.find(query, (err, result) => {
      if (err) {
        console.log('Unexpected error trying to perform a simple geo query'.red);
        return reject(err);
      }

      console.log(`Entry found 'where near' as expected:\n${JSON.stringify(result, null, 2)}`.green);
      resolve({Test, result: entry});
    })
  });
}

function doCompoundGeoQuery(params) {
  return new Promise(function (resolve, reject) {
    let Test = params.Test;
    let entry = params.result;
    let db = Test.dataSource.connector.db;

    console.log('Performing compund geo query:'.blue);
    let query = {
      where: {
        and: [
          {
            location: {
              near: {lat: entry.location.lat, lng: entry.location.lng}
            }
          },
          {
            name: 'test'
          }
        ]
      }
    };
    console.log(`Query: ${JSON.stringify(query, null, 2)}`.magenta);

    Test.find(query, (err, result) => {
      if (err) {
        console.log('Expected, but undesired, error trying to performing compound geo query:'.yellow);
        return reject(err);
      } else {
        console.log(`This is what should happen, but doesn't:\n${JSON.stringify(result, null, 2)}`.red);
        resolve({Test, entry});
      }
    })
  });
}
