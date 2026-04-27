import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deepDefaults } from '../src/utils.js';

describe('deepDefaults', () => {

    const TEST_CASES = [
        [ undefined, undefined, undefined ],
        [ undefined, null, undefined ],
        [ undefined, {}, {} ],
        [ undefined, { key: 'default' }, { key: 'default' } ],
        [ undefined, [], [] ],
        [ undefined, [ 1 ], [ 1 ] ],
        [ undefined, 0, 0 ],
        [ undefined, 1, 1 ],
        [ undefined, 1.1, 1.1 ],
        [ undefined, false, false ],
        [ undefined, true, true ],
        [ undefined, 'str', 'str' ],
        [ null, undefined, null ],
        [ null, null, null ],
        [ null, {}, {} ],
        [ null, [], [] ],
        [ null, 0, 0 ],
        [ null, 1, 1 ],
        [ null, 1.1, 1.1 ],
        [ null, false, false ],
        [ null, true, true ],
        [ null, 'str', 'str' ],
        [ {}, undefined, {} ],
        [ {}, null, {} ],
        [ {}, {}, {} ],
        [ {}, { key: 'default' }, { key: 'default' } ],
        [ {}, { key0: { key1: 'default' } }, { key0: { key1: 'default' } } ],
        [ {}, [], [] ],
        [ {}, [ 1 ], [ 1 ] ],
        [ {}, 0, 0 ],
        [ {}, 1, 1 ],
        [ {}, 1.1, 1.1 ],
        [ {}, false, false ],
        [ {}, true, true ],
        [ {}, 'str', 'str' ],
        [ [], undefined, [] ],
        [ [], null, [] ],
        [ [], {}, {} ],
        [ [], { key: 'default' }, { key: 'default' } ],
        [ [], [], [] ],
        [ [], [ 1 ], [ 1 ] ],
        [ [], 0, 0 ],
        [ [], 1, 1 ],
        [ [], 1.1, 1.1 ],
        [ [], false, false ],
        [ [], true, true ],
        [ [], 'str', 'str' ],
        [ { key: 'value' }, undefined, { key: 'value' } ],
        [ { key: 'value' }, null, { key: 'value' } ],
        [ { key: 'value' }, {}, { key: 'value' } ],
        [ { key: 'value' }, { key: 'default' }, { key: 'value' } ],
        [ { key: 'value' }, [], [] ],
        [ { key: 'value' }, [ 1 ], [ 1 ] ],
        [ { key: 'value' }, 0, 0 ],
        [ { key: 'value' }, 1, 1 ],
        [ { key: 'value' }, 1.1, 1.1 ],
        [ { key: 'value' }, false, false ],
        [ { key: 'value' }, true, true ],
        [ { key: 'value' }, 'str', 'str' ],
        [ { key: undefined }, { key: 'default' }, { key: 'default' } ],
        [ { key: null }, { key: 'default' }, { key: 'default' } ],
        [ { key: false }, { key: 'default' }, { key: 'default' } ],
        [ { key: false }, { key: true }, { key: false } ],
        [ [ { key: 1 } ], [], [ { key: 1 } ] ],
        [ [ { key: 1 }, 2 ], [ 3 ], [ { key: 1 }, 2, 3 ] ],
        [ { l0: { l1: [ 'value' ] } }, null, { l0: { l1: [ 'value' ] } } ],
        [ { l0: { l1: [ 'value' ] } }, undefined, { l0: { l1: [ 'value' ] } } ],
        [ { l0: { l1: [ 'value' ] } }, {}, { l0: { l1: [ 'value' ] } } ],
        [ { l0: { l1: [ 'value' ] } }, { l00: false }, { l0: { l1: [ 'value' ] }, l00: false } ],
        [ 1, 2, 1 ],
        [ -.1, -.2, -.1 ],
        [ { key: 1 }, { key: 2 }, { key: 1 } ],
    ];

    TEST_CASES.forEach(t => {
        const [ inputObj, inputDefault, expectedOutput ] = t;
        it(`${JSON.stringify(inputObj)} with defaults ${JSON.stringify(inputDefault)} should return ${JSON.stringify(expectedOutput)}`, () => {
            assert.deepStrictEqual(deepDefaults(inputObj, inputDefault), expectedOutput);
        });
    });

    it('clones any default object', () => {
        const defaults = { key: true };
        const output = deepDefaults({}, defaults);
        assert.deepStrictEqual(output, { key: true });
        output.key = false;
        assert.deepStrictEqual(output, { key: false });
        assert.deepStrictEqual(defaults, { key: true });
    });

    it('clones any nested default object', () => {
        const defaults = {
            key0: {
                key1: true,
            },
        };
        const output = deepDefaults({}, defaults);
        assert.deepStrictEqual(output, { key0: { key1: true } });
        output.key0.key1 = false;
        assert.deepStrictEqual(output, { key0: { key1: false } });
        assert.deepStrictEqual(defaults, { key0: { key1: true } });
    });

    it('clones any default array', () => {
        const defaults = [ 1, 2, 3 ];
        const output = deepDefaults([], defaults);
        assert.deepStrictEqual(output, [ 1, 2, 3 ]);
        output.push(4);
        assert.deepStrictEqual(output, [ 1, 2, 3, 4 ]);
        assert.deepStrictEqual(defaults, [ 1, 2, 3 ]);
    });

});
