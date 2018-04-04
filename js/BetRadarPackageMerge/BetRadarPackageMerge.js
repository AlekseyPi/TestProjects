var fs = require('fs');

var inputFolder = process.argv[2];
var resultJson = null;

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      if (filename.startsWith("__")) return;
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}


function processFile(fileName, content) {
  console.log(fileName);
  let json = JSON.parse(content);
  if (!resultJson) {
    resultJson = json;
    if (resultJson.Odds == null) resultJson.Odds = [];
    if (resultJson.Probabilities == null) resultJson.Probabilities = [];
    return;
  }

  let hasChanges = false;

  let existsMarkets = resultJson.Odds.map(item => item.OddsType);
  let nonExistsOdds = json.Odds.filter(item => !existsMarkets.includes(item.OddsType));
  resultJson.Odds = resultJson.Odds.concat(nonExistsOdds);
  hasChanges = existsMarkets.length > 0;

  existsMarkets = resultJson.Probabilities.map(item => item.OddsType);
  let nonExistsProbs = json.Probabilities.filter(item => !existsMarkets.includes(item.OddsType));
  resultJson.Probabilities = resultJson.Probabilities.concat(nonExistsProbs);
  hasChanges = hasChanges || existsMarkets.length > 0;

  if (hasChanges) {
    fs.writeFile(inputFolder + "\__merged.json", JSON.stringify(resultJson, null, 4), 'utf-8', function(err) {
      if(err) {
        return console.log(err);
      }

    }); 
  }
}

readFiles(inputFolder, processFile);


/*
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
*/