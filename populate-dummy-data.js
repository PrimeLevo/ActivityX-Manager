#!/usr/bin/env node

/**
 * Script to populate dummy data in Electron app's localStorage
 * Run this with: node populate-dummy-data.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Generate dummy data
const dummyUsers = [
    {
        "userId": "user_001",
        "id": "user_001",
        "name": "Ahmet Yılmaz",
        "email": "ahmet.yilmaz@example.com",
        "pcName": "PC-001",
        "displayName": "Ahmet Y.",
        "team": "Hukuk",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 8,
            "minutes": 45,
            "seconds": 30,
            "total": 31530
        },
        "batchIds": ["batch_001", "batch_002", "batch_003"],
        "apps": [
            {"name": "Chrome", "usage": 7200},
            {"name": "Visual Studio Code", "usage": 5400},
            {"name": "Microsoft Word", "usage": 3600},
            {"name": "Slack", "usage": 2700},
            {"name": "Excel", "usage": 1800}
        ],
        "websites": [
            {"name": "github.com", "url": "https://github.com", "usage": 3600},
            {"name": "stackoverflow.com", "url": "https://stackoverflow.com", "usage": 2400},
            {"name": "google.com", "url": "https://google.com", "usage": 1800},
            {"name": "youtube.com", "url": "https://youtube.com", "usage": 1200},
            {"name": "linkedin.com", "url": "https://linkedin.com", "usage": 900}
        ]
    },
    {
        "userId": "user_002",
        "id": "user_002",
        "name": "Ayşe Demir",
        "email": "ayse.demir@example.com",
        "pcName": "PC-002",
        "displayName": "Ayşe D.",
        "team": "Muhasebe",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 7,
            "minutes": 30,
            "seconds": 15,
            "total": 27015
        },
        "batchIds": ["batch_004", "batch_005"],
        "apps": [
            {"name": "Excel", "usage": 9000},
            {"name": "Chrome", "usage": 5400},
            {"name": "Outlook", "usage": 3600},
            {"name": "Teams", "usage": 2700},
            {"name": "PowerPoint", "usage": 1800}
        ],
        "websites": [
            {"name": "office.com", "url": "https://office.com", "usage": 4200},
            {"name": "e-defter.gov.tr", "url": "https://e-defter.gov.tr", "usage": 3000},
            {"name": "gib.gov.tr", "url": "https://gib.gov.tr", "usage": 2400},
            {"name": "google.com", "url": "https://google.com", "usage": 1200}
        ]
    },
    {
        "userId": "user_003",
        "id": "user_003",
        "name": "Mehmet Kaya",
        "email": "mehmet.kaya@example.com",
        "pcName": "PC-003",
        "displayName": "Mehmet K.",
        "team": "Hukuk",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 9,
            "minutes": 15,
            "seconds": 45,
            "total": 33345
        },
        "batchIds": ["batch_006", "batch_007", "batch_008"],
        "apps": [
            {"name": "Microsoft Word", "usage": 10800},
            {"name": "Chrome", "usage": 7200},
            {"name": "Adobe Acrobat", "usage": 5400},
            {"name": "Outlook", "usage": 3600},
            {"name": "Teams", "usage": 1800}
        ],
        "websites": [
            {"name": "uyap.gov.tr", "url": "https://uyap.gov.tr", "usage": 5400},
            {"name": "e-imza.uyap.gov.tr", "url": "https://e-imza.uyap.gov.tr", "usage": 3600},
            {"name": "mevzuat.gov.tr", "url": "https://mevzuat.gov.tr", "usage": 2700},
            {"name": "kazanci.com", "url": "https://kazanci.com", "usage": 1800}
        ]
    },
    {
        "userId": "user_004",
        "id": "user_004",
        "name": "Fatma Çelik",
        "email": "fatma.celik@example.com",
        "pcName": "PC-004",
        "displayName": "Fatma Ç.",
        "team": "İnsan Kaynakları",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 6,
            "minutes": 45,
            "seconds": 30,
            "total": 24330
        },
        "batchIds": ["batch_009", "batch_010"],
        "apps": [
            {"name": "Excel", "usage": 7200},
            {"name": "Chrome", "usage": 5400},
            {"name": "Microsoft Word", "usage": 3600},
            {"name": "Teams", "usage": 2700},
            {"name": "Outlook", "usage": 1800}
        ],
        "websites": [
            {"name": "sgk.gov.tr", "url": "https://sgk.gov.tr", "usage": 3600},
            {"name": "iskur.gov.tr", "url": "https://iskur.gov.tr", "usage": 2400},
            {"name": "linkedin.com", "url": "https://linkedin.com", "usage": 1800},
            {"name": "kariyer.net", "url": "https://kariyer.net", "usage": 1200}
        ]
    },
    {
        "userId": "user_005",
        "id": "user_005",
        "name": "Ali Öztürk",
        "email": "ali.ozturk@example.com",
        "pcName": "PC-005",
        "displayName": "Ali Ö.",
        "team": "IT",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 10,
            "minutes": 30,
            "seconds": 0,
            "total": 37800
        },
        "batchIds": ["batch_011", "batch_012", "batch_013", "batch_014"],
        "apps": [
            {"name": "Visual Studio Code", "usage": 14400},
            {"name": "Chrome", "usage": 9000},
            {"name": "Terminal", "usage": 5400},
            {"name": "Slack", "usage": 3600},
            {"name": "Docker Desktop", "usage": 2700}
        ],
        "websites": [
            {"name": "github.com", "url": "https://github.com", "usage": 5400},
            {"name": "stackoverflow.com", "url": "https://stackoverflow.com", "usage": 4200},
            {"name": "dev.to", "url": "https://dev.to", "usage": 2400},
            {"name": "aws.amazon.com", "url": "https://aws.amazon.com", "usage": 1800},
            {"name": "npmjs.com", "url": "https://npmjs.com", "usage": 1200}
        ]
    },
    {
        "userId": "user_006",
        "id": "user_006",
        "name": "Zeynep Yıldız",
        "email": "zeynep.yildiz@example.com",
        "pcName": "PC-006",
        "displayName": "Zeynep Y.",
        "team": "Pazarlama",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 8,
            "minutes": 20,
            "seconds": 45,
            "total": 30045
        },
        "batchIds": ["batch_015", "batch_016"],
        "apps": [
            {"name": "Chrome", "usage": 8100},
            {"name": "Canva", "usage": 6300},
            {"name": "PowerPoint", "usage": 4500},
            {"name": "Excel", "usage": 3600},
            {"name": "Outlook", "usage": 2700}
        ],
        "websites": [
            {"name": "canva.com", "url": "https://canva.com", "usage": 4800},
            {"name": "instagram.com", "url": "https://instagram.com", "usage": 3600},
            {"name": "twitter.com", "url": "https://twitter.com", "usage": 2700},
            {"name": "linkedin.com", "url": "https://linkedin.com", "usage": 2100},
            {"name": "facebook.com", "url": "https://facebook.com", "usage": 1800}
        ]
    },
    {
        "userId": "user_007",
        "id": "user_007",
        "name": "Mustafa Şahin",
        "email": "mustafa.sahin@example.com",
        "pcName": "PC-007",
        "displayName": "Mustafa Ş.",
        "team": "Hukuk",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 7,
            "minutes": 55,
            "seconds": 20,
            "total": 28520
        },
        "batchIds": ["batch_017", "batch_018", "batch_019"],
        "apps": [
            {"name": "Microsoft Word", "usage": 9000},
            {"name": "Chrome", "usage": 6300},
            {"name": "Adobe Acrobat", "usage": 4500},
            {"name": "Outlook", "usage": 3600},
            {"name": "Excel", "usage": 1800}
        ],
        "websites": [
            {"name": "uyap.gov.tr", "url": "https://uyap.gov.tr", "usage": 4500},
            {"name": "mevzuat.gov.tr", "url": "https://mevzuat.gov.tr", "usage": 3000},
            {"name": "lexpera.com", "url": "https://lexpera.com", "usage": 2100},
            {"name": "hukukturk.com", "url": "https://hukukturk.com", "usage": 1500}
        ]
    },
    {
        "userId": "user_008",
        "id": "user_008",
        "name": "Emine Aydın",
        "email": "emine.aydin@example.com",
        "pcName": "PC-008",
        "displayName": "Emine A.",
        "team": "Muhasebe",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 9,
            "minutes": 10,
            "seconds": 30,
            "total": 33030
        },
        "batchIds": ["batch_020", "batch_021", "batch_022"],
        "apps": [
            {"name": "Excel", "usage": 12600},
            {"name": "Chrome", "usage": 7200},
            {"name": "ETA", "usage": 5400},
            {"name": "Outlook", "usage": 3600},
            {"name": "Teams", "usage": 2700}
        ],
        "websites": [
            {"name": "gib.gov.tr", "url": "https://gib.gov.tr", "usage": 5400},
            {"name": "e-defter.gov.tr", "url": "https://e-defter.gov.tr", "usage": 4200},
            {"name": "earsivportal.efatura.gov.tr", "url": "https://earsivportal.efatura.gov.tr", "usage": 3000},
            {"name": "ivd.gib.gov.tr", "url": "https://ivd.gib.gov.tr", "usage": 1800}
        ]
    },
    {
        "userId": "user_009",
        "id": "user_009",
        "name": "Can Arslan",
        "email": "can.arslan@example.com",
        "pcName": "PC-009",
        "displayName": "Can A.",
        "team": "IT",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 11,
            "minutes": 5,
            "seconds": 15,
            "total": 39915
        },
        "batchIds": ["batch_023", "batch_024", "batch_025", "batch_026"],
        "apps": [
            {"name": "Visual Studio Code", "usage": 16200},
            {"name": "Chrome", "usage": 10800},
            {"name": "Terminal", "usage": 5400},
            {"name": "Docker Desktop", "usage": 3600},
            {"name": "Postman", "usage": 2700}
        ],
        "websites": [
            {"name": "github.com", "url": "https://github.com", "usage": 6300},
            {"name": "stackoverflow.com", "url": "https://stackoverflow.com", "usage": 5400},
            {"name": "medium.com", "url": "https://medium.com", "usage": 2700},
            {"name": "dev.to", "url": "https://dev.to", "usage": 1800},
            {"name": "npmjs.com", "url": "https://npmjs.com", "usage": 1500}
        ]
    },
    {
        "userId": "user_010",
        "id": "user_010",
        "name": "Elif Doğan",
        "email": "elif.dogan@example.com",
        "pcName": "PC-010",
        "displayName": "Elif D.",
        "team": "İnsan Kaynakları",
        "lastActivity": new Date().toISOString(),
        "activeTime": {
            "hours": 7,
            "minutes": 40,
            "seconds": 50,
            "total": 27650
        },
        "batchIds": ["batch_027", "batch_028"],
        "apps": [
            {"name": "Excel", "usage": 8100},
            {"name": "Chrome", "usage": 6300},
            {"name": "Microsoft Word", "usage": 4500},
            {"name": "Teams", "usage": 3600},
            {"name": "Outlook", "usage": 2700}
        ],
        "websites": [
            {"name": "linkedin.com", "url": "https://linkedin.com", "usage": 3600},
            {"name": "kariyer.net", "url": "https://kariyer.net", "usage": 2700},
            {"name": "sgk.gov.tr", "url": "https://sgk.gov.tr", "usage": 2100},
            {"name": "iskur.gov.tr", "url": "https://iskur.gov.tr", "usage": 1800},
            {"name": "secretcv.com", "url": "https://secretcv.com", "usage": 1200}
        ]
    }
];

// Generate teams
const teams = [
    { id: 1, name: "Hukuk", memberCount: 3 },
    { id: 2, name: "Muhasebe", memberCount: 2 },
    { id: 3, name: "İnsan Kaynakları", memberCount: 2 },
    { id: 4, name: "IT", memberCount: 2 },
    { id: 5, name: "Pazarlama", memberCount: 1 }
];

// Create a JSON file that can be imported
const dataToSave = {
    users: dummyUsers,
    teams: teams,
    timestamp: new Date().toISOString()
};

// Save to file
const outputFile = path.join(__dirname, 'dummy-data.json');
fs.writeFileSync(outputFile, JSON.stringify(dataToSave, null, 2));

console.log('✅ Dummy data has been saved to dummy-data.json');
console.log('📁 File location:', outputFile);
console.log('');
console.log('To load this data into your Electron app:');
console.log('1. Open your Electron app');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to the Console tab');
console.log('4. Run this command:');
console.log('');
console.log(`fetch('dummy-data.json').then(r => r.json()).then(data => {
    localStorage.setItem('kta_persisted_users_v1', JSON.stringify(data.users));
    localStorage.setItem('kta_teams_v1', JSON.stringify(data.teams));
    location.reload();
});`);
console.log('');
console.log('Or manually copy the data from dummy-data.json and paste it into localStorage.');
console.log('');
console.log('Summary:');
console.log(`  - ${dummyUsers.length} users created`);
console.log(`  - ${teams.length} teams created`);
console.log(`  - Total active time: ${Math.floor(dummyUsers.reduce((sum, u) => sum + u.activeTime.total, 0) / 3600)} hours`);