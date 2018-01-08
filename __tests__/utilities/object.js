import { convertBackendKeysRecursive } from '../../src/utilities/object';

describe('convertBackendKeysRecursive', () => {
  it('converts backend keys recursively', () => {
    const backendObject = {
      foo_bar: 10,
      foo_baz: {
        foo_bar: 'test',
      },
    };
    const expectedFrontend = {
      fooBar: 10,
      fooBaz: {
        fooBar: 'test',
      },
    };
    expect(convertBackendKeysRecursive(backendObject)).toEqual(
      expectedFrontend
    );
  });

  it('works with arrays', () => {
    expect(
      convertBackendKeysRecursive([
        5,
        {
          foo_bar: 'test',
        },
      ])
    ).toEqual([
      5,
      {
        fooBar: 'test',
      },
    ]);
  });

  it('works with empty object', () => {
    expect(convertBackendKeysRecursive({})).toEqual({});
  });

  it('works with null', () => {
    expect(convertBackendKeysRecursive(null)).toEqual(null);
  });
});
