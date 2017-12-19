export default class Collection {
  constructor(key = 'id') {
    this.key = key;
    this.items = {}; // <key, data>
    this.list = []; // [key]

    // We need to know about the last item in the collection so that we can tell
    // if we've hit the last page. This is to determine if data is loading or
    // not. If the view is requesting items range but the full range doesn't exist,
    // we assume that we're currentle loading the missing items. But if we have
    // hit the last page, then the last items will never come because they don't
    // exist.
    //
    // TODO: Is there a more explicit way to determine if data is loading?
    // Can we do something on sending the request?

    this.lastItem = null; // key
  }
  putItems(offset, items) {
    items.forEach(item => {
      this.items[item[this.key]] = item;
    });

    if (offset > this.list.length) {
      // offset can become higher than the items in the list if a page in middle
      // of the collection is requested.

      // Make space for new data, so that the new items are spliced into the
      // right index.
      this.list = this.list.concat(new Array(offset - this.list.length));
    }

    // Put the items so that item with offset i, is found at index i
    Array.prototype.splice.apply(
      this.list,
      [offset, items.length].concat(items.map(i => i[this.key]))
    );
  }

  /**
   * Set the last item of this collection. It's used to determine if last page
   * is reached.
   */
  reachedEnd() {
    if (this.list[this.list.length - 1]) {
      this.lastItem = this.list[this.list.length - 1];
    } else {
      // weird edge case if immediately going to a offset without any items
      this.lastItem = 'empty';
    }
  }

  /**
   * Get `limit` items from starting at `offset`. Return `null` unless all the
   * items in the range exist. If the range includes `lastItem`, all the items
   * from `offset` up to `lastItem` are returned.
   */
  getItems(offset, limit) {
    if (this.list.length < offset + limit && !this.lastItem) {
      // All the requested items don't exist and it's not the last page either.
      return null;
    }

    if (this.lastItem === 'empty') {
      // empty state
      return [];
    }

    const result = [];
    let curr;
    for (let i = offset; i < offset + limit; i++) {
      curr = this.items[this.list[i]];
      if (!curr) {
        // There's a gap in the list of items so the items are not there yet.
        return null;
      }
      result.push(curr);

      if (this.lastItem === curr[this.key]) {
        // That should be all items in the collection.
        break;
      }
    }

    return result;
  }

  getAll() {
    return this.list.filter(Boolean).map(id => this.items[id]);
  }
}
