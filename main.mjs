import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'https://raider.io/api/characters/mythic-plus-runs?season=SEASON_STRING_REPLACE_ME&dungeonId=DUNGEON_ID_REPLACE_ME&characterId=CHARACTER_ID_REPLACE_ME&role=all&specId=0&mode=scored&affixes=all&date=all'

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const WAIT_MS = 1000;

const seasonStartDates = {
  'season-df-1': new Date('2022-12-13T14:00:00.000Z'),
  'season-df-2': new Date('2023-05-09T14:00:00.000Z'),
  'season-df-3': new Date('2023-11-14T14:00:00.000Z'),
}

const dungeonIds = {
  'season-df-1': [
    6932, // SMBG
    8079, // CoS
    13954, // Azure Vault
    7672, // HoV
    5965, // ToJS
    14032, // AA
    13982, // Nokhud
    14063, // RLP
  ],
  'season-df-2': [
    9164, // FH
    9391, // UR
    13991, // Bracken
    13968, // Uldaman
    14082, // HoI
    14011, // Neltharus
    5035, // VP
    7546, // NL
  ],
  'season-df-3': [
    1000010, // Fall
    1000011, // Rise
    9424, // WCM
    7805, // BRH
    9028, // AD
    7673, // DHT
    7109, // EB
    4738, // ToT
  ]
}

const characterIds = {
  // Rad1: 112164039, // Prot Warrior
  // Rad2: 59206090, // BDK
  // Rad3: 66540510, // Raddy
  // Kommit1: 128972101, // Paladin
  // Kommit2: 130120220, // BRM
  // Finesthour: 57632278,
  // Kymiro: 121354538,
  // Sinadin: 194617968,
  // Yellowr: 140418895,
  // Tide: 151331571,
  // Immortal: 121322143,
  // Snak1: 111765791, // Evoker
  // Snak2: 82606823, // Shaman
  // Dz: 187211851,
  // Pru1: 116727030, // Druid
  // Pru2: 111848776, // Evoker
  // Ryeshot: 57632279,
  // Twelve: 164394770,
  // Chickenism: 206343167,
  // Zalea: 90486953,
  // Lupp: 151872620,
  // Garronan: 126619316,
  // Xaidra: 158571009,
  // Meg: 154188600,
  // Clandon: 140169911,
  // Kalid1: 161710592, // Priest
  // Kalid2: 185455165, // Rsham
  // Oregano1: 204593173, // Lock
  // Oregano2: 111854721, // Evoker
  // Shu: 124034835, // Paladin
  Shu2: 198569819, // DK
}

async function main() {
  const output = {}
  const errors = []
  const nameIdPairs = Object.entries(characterIds);

  for (let a = 0; a < nameIdPairs.length; a++) {
    await wait(WAIT_MS);
    const [unchangedName, id] = nameIdPairs[a];
    // Replace all numbers with nothing, to condense people with several alts into one name.
    const name = unchangedName.replace(/\d/g, '');

    console.log('> checking player', name)
    if (!output[name]) {
      output[name] = {};
    }

    const seasonIds = Object.keys(dungeonIds);
    for (let i = 0; i < seasonIds.length; i++) {
      await wait(WAIT_MS);
      const seasonId = seasonIds[i];

      console.log('>> checking season', seasonId)
      if (!output[name][seasonId]) {
        output[name][seasonId] = {
          week1: {keyCount: 0, timeInKeys: 0},
          week2: {keyCount: 0, timeInKeys: 0},
        };
      }

      const dungeonIdsForSeason = dungeonIds[seasonId];
      for (let j = 0; j < dungeonIdsForSeason.length; j++) {
        await wait(WAIT_MS);
        const dungeonId = dungeonIdsForSeason[j];

        console.log('>>> checking dungeon id', dungeonId)
        const url = BASE_URL.replace('SEASON_STRING_REPLACE_ME', seasonId).replace('DUNGEON_ID_REPLACE_ME', dungeonId).replace('CHARACTER_ID_REPLACE_ME', id);
        await fetch(url)
          .then(response => response.json())
          .then(data => {
            const runs = data.runs;
            // console.log(seasonId, dungeonId, runs.length)
            for (let k = 0; k < runs.length; k++) {
              const run = runs[k];
              const completedDate = run.summary.completed_at;
              const timeToComplete = Math.floor(run.summary.clear_time_ms / 1000 / 6) / 10;
              const timeElapsed = new Date(completedDate) - seasonStartDates[seasonId];
              const daysDifference = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));

              if (daysDifference < 7) {
                output[name][seasonId].week1.keyCount = output[name][seasonId].week1.keyCount + 1;
                output[name][seasonId].week1.timeInKeys = output[name][seasonId].week1.timeInKeys + timeToComplete;
              } else if (daysDifference < 14) {
                output[name][seasonId].week2.keyCount = output[name][seasonId].week2.keyCount + 1;
                output[name][seasonId].week2.timeInKeys = output[name][seasonId].week2.timeInKeys + timeToComplete;
              }

              // return daysDifference < 7 ? 'week1' : (daysDifference < 14 ? 'week2' : 'laterweek');
            }
          })
          .catch(error => {
            console.log('>>>> ERROR ON', name, seasonId, dungeonId)
            console.log(error)
            errors.push({name, seasonId, dungeonId})
          })
      }
    }
  }
  
  fs.writeFile('output.json', JSON.stringify(output, null, 2), function (err) {})
  fs.writeFile('errors.json', JSON.stringify(errors, null, 2), function (err) {})
}

main();