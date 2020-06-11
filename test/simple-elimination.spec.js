const assert = require('chai').assert;
const { BracketsManager } = require('../dist');
const { storage } = require('../dist/storage/json');

const manager = new BracketsManager(storage);

describe('Create single elimination stage', () => {
    beforeEach(() => {
        storage.reset();
    });

    it('should create a single elimination stage', () => {
        const example = {
            name: 'Example',
            type: 'single_elimination',
            participants: [
                'Team 1', 'Team 2',
                'Team 3', 'Team 4',
                'Team 5', 'Team 6',
                'Team 7', 'Team 8',
                'Team 9', 'Team 10',
                'Team 11', 'Team 12',
                'Team 13', 'Team 14',
                'Team 15', 'Team 16',
            ],
            settings: { seedOrdering: ['natural'] },
        };

        manager.createStage(example);

        const stage = storage.select('stage', 0);
        assert.equal(stage.name, example.name);
        assert.equal(stage.type, example.type);

        assert.equal(storage.select('group').length, 1);
        assert.equal(storage.select('round').length, 4);
        assert.equal(storage.select('match').length, 15);
    });

    it('should create a single elimination stage with BYEs', () => {
        const example = {
            name: 'Example with BYEs',
            type: 'single_elimination',
            participants: [
                'Team 1', null,
                'Team 3', 'Team 4',
                null, null,
                'Team 7', 'Team 8',
            ],
            settings: { seedOrdering: ['natural'] },
        };

        manager.createStage(example);

        assert.equal(storage.select('match', 4).opponent1.id, 0); // Determined because of opponent's BYE.
        assert.equal(storage.select('match', 4).opponent2.id, null); // To be determined.
        assert.equal(storage.select('match', 5).opponent1, null); // BYE propagated.
        assert.equal(storage.select('match', 5).opponent2.id, null); // To be determined.
    });

    it('should create a single elimination stage with consolation final', () => {
        const example = {
            name: 'Example with consolation final',
            type: 'single_elimination',
            participants: [
                'Team 1', 'Team 2',
                'Team 3', 'Team 4',
                'Team 5', 'Team 6',
                'Team 7', 'Team 8',
            ],
            settings: { consolationFinal: true, seedOrdering: ['natural'] },
        };

        manager.createStage(example);

        const stage = storage.select('stage', 0);
        assert.equal(stage.name, example.name);
        assert.equal(stage.type, example.type);

        assert.equal(storage.select('group').length, 2);
        assert.equal(storage.select('round').length, 4);
        assert.equal(storage.select('match').length, 8);
    });

    it('should create a single elimination stage with consolation final and BYEs', () => {
        const example = {
            name: 'Example with consolation final and BYEs',
            type: 'single_elimination',
            participants: [
                null, null,
                null, 'Team 4',
                'Team 5', 'Team 6',
                'Team 7', 'Team 8',
            ],
            settings: { consolationFinal: true, seedOrdering: ['natural'] },
        };

        manager.createStage(example);

        assert.equal(storage.select('match', 4).opponent1, null);
        assert.equal(storage.select('match', 4).opponent2.id, 0);

        // Consolation final
        assert.equal(storage.select('match', 7).opponent1, null);
        assert.equal(storage.select('match', 7).opponent2.id, null);
    });

    it('shoud create a single elimination stage with Bo3 matches', () => {
        const example = {
            name: 'Example with consolation final',
            type: 'single_elimination',
            participants: [
                'Team 1', 'Team 2',
                'Team 3', 'Team 4',
                'Team 5', 'Team 6',
                'Team 7', 'Team 8',
            ],
            settings: { seedOrdering: ['natural'], matchesChildCount: 3 },
        };

        manager.createStage(example);

        assert.equal(storage.select('group').length, 1);
        assert.equal(storage.select('round').length, 3);
        assert.equal(storage.select('match').length, 7);
        assert.equal(storage.select('match_game').length, 7 * 3);
    });
});