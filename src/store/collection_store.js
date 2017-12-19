import Collection from './collection';

/**
 * Store handling multiple collections of the same items
 */
export default class CollectionStore {
  constructor({ key, singleItemSource = true }) {
    // key to index items with
    this.key = key;

    // To use a `this.items` as a single source of items in all selections
    // all underlying Collections will reuse the same `items`. Setting this to
    // false will make each collection have its own items
    this.singleItemSource = singleItemSource;

    // this is only used when singleItemSource flag is `true`
    // <key, item>
    this.items = {};

    // <selection, <Collection<events>>
    this.selections = {};
  }

  clearItems(selection) {
    if (!selection) {
      throw new Error('selection is required. here: ' + selection);
    }
    this.selections[selection] = new Collection(this.key);
  }

  putItems(offset, items, selection) {
    if (!selection) {
      throw new Error('selection is required. here: ' + selection);
    }
    if (!this.selections[selection]) {
      this.selections[selection] = new Collection(this.key);

      if (this.singleItemSource) {
        // using the same reference in the collections.
        this.selections[selection].items = this.items;
      }
    }

    this.selections[selection].putItems(offset, items);
  }

  getItems(offset, limit, selection) {
    if (!selection) {
      throw new Error('selection is required. here: ' + selection);
    }
    let result = null;
    if (this.selections[selection]) {
      result = this.selections[selection].getItems(offset, limit);
    }
    return result;
  }

  getAll(selection) {
    let result = null;
    if (this.selections[selection]) {
      result = this.selections[selection].getAll();
    }
    return result;
  }
}
