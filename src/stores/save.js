import { writable } from 'svelte/store';

export const save = writable({
    balance: Number(0),
    ownedBuildings: {},
    ownedUpgrades: [],
    settings: {
        audio: true,
        walletName: "Namer",
        autoSave: true,
        debug: false
    },
    stats: {
        hnsAllTime: 0,
        hnsClicked: 0,
        timesClicked: 0,
        buildingsPurchased: 0,
        buildingsSold: 0,
        runStarted: new Date(),
    },
    lastSave: new Date()
});