import fs from 'fs';

function readOutputFile() {
  try {
    const jsonData = fs.readFileSync('saved_output.json', 'utf8');
    const parsedData = JSON.parse(jsonData);

    return parsedData;
  } catch (error) {
    console.error('Error parsing JSON file:', error.message);
    return null;
  }
}

// MAKE SURE TO RENAME output.json TO saved_output.json FIRST
// This way additional error-fixing runs can be made to fix issues in the data without
// overwriting any good data and without needing to rerun the whole dataset

function main() {
 const data = readOutputFile();

 const output = [];
 output.push('Player\t\tWeek 1\tWeek 2\tHours in Keys (W1-2)\t\tWeek 1\tWeek 2\tTime in Keys (W1-2)\t\tWeek 1\tWeek2\tTime in Keys (W1-2)\t\t');

  Object.entries(data).forEach(([name, seasons]) => {
    const seasonValues = Object.values(seasons);
    const line = [`${name}\t\t`];

    seasonValues.forEach(seasonData => {
      const seasonLineContent = `${seasonData.week1.keyCount}\t${seasonData.week1.keyCount + seasonData.week2.keyCount}\t${Math.floor((seasonData.week1.timeInKeys + seasonData.week2.timeInKeys) / 6) / 10}\t\t`;
      line.push(seasonLineContent);
    })

    output.push(line.join(''));
  })
  console.log(data)

  fs.writeFile('output.tsv', output.join('\n'), function (err) {})
}

main();