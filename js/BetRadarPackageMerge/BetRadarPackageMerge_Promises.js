var fs = require('fs');

const MATCH_FILE_REGEX = /^\d-(\d{7}|\d{8}|\d{9})-\d{2}_\d{2}_\d{2}.\d{3}.json/;

//!var inputFolder = process.argv[2];
var inputFolder = "D:\\projects\\BetRadarMock\\Builds\\Debug\\BetRadar.MockApp\\Messages\\";
var resultJson = null;

// promisify fs.readFile()
fs.readFileAsync = function (filename) {
    return new Promise(function (resolve, reject) {
        try {
            fs.readFile(filename, function(err, content){
                if (err) reject(err); else resolve(content);
            });
        } catch (err) {
            reject(err);
        }
    });
};

// promisify fs.readdir
fs.readdirAsync = function (dirname) {
    return new Promise(function (resolve, reject) {
        try {
            fs.readdir(dirname, function(err, filenames){
                if (err) reject(err); else resolve(filenames);
            });
        } catch (err) {
            reject(err);
        }
    });
};

// promisify fs.writeFile
fs.writeFileAsync = function (filename, content) {
    return new Promise(function (resolve, reject) {
        try {
            fs.writeFile(filename, content, 'utf-8', function(err) {
                if (err) reject(err); else resolve();
            }); 
        } catch (err) {
            reject(err);
        }
    });
};

function processFile(fileName, content) {
  console.log(fileName);
  let json = JSON.parse(content);
  if (!resultJson) {
    resultJson = json;
    if (resultJson.Odds == null) resultJson.Odds = [];
    if (resultJson.Probabilities == null) resultJson.Probabilities = [];
    return;
  }

  let existsMarkets = resultJson.Odds.map(item => item.OddsType);
  let nonExistsOdds = json.Odds.filter(item => !existsMarkets.includes(item.OddsType));
  resultJson.Odds = resultJson.Odds.concat(nonExistsOdds);

  existsMarkets = resultJson.Probabilities.map(item => item.OddsType);
  let nonExistsProbs = json.Probabilities.filter(item => !existsMarkets.includes(item.OddsType));
  resultJson.Probabilities = resultJson.Probabilities.concat(nonExistsProbs);
}

function processFileAsync(filename) {
    return fs.readFileAsync(inputFolder + filename).then(content => processFile(filename, content));
};

const filefilter = filename => MATCH_FILE_REGEX.test(filename);

fs.readdirAsync(inputFolder)
.then(filenames => Promise.all(filenames.filter(filefilter).map(processFileAsync)))
.then(() => fs.writeFileAsync(inputFolder + "\__merged.json", JSON.stringify(resultJson, null, 4)))
.catch(function (err) {
    console.error(err);
});