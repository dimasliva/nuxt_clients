import { injectable } from "inversify";


class CacheNode {
  key: string;
  value: any;
  expire;
  prev: CacheNode | null;
  next: CacheNode | null;

  constructor(key: string, value: any, expire: number | null = null) {
    this.key = key;
    this.value = value;
    this.expire = expire;
    this.prev = null;
    this.next = null;
  }
}


@injectable()
export default class MemoryCache implements ICache {
  protected _maxSize;
  protected _size;
  protected _expire;
  protected _cache;
  protected _head: CacheNode | null;
  protected _tail: CacheNode | null;


  constructor(maxSize = 10000) {
    this._maxSize = maxSize;
    this._size = 0;
    this._cache = new Map();
    this._head = null;
    this._tail = null;
  }


  getValue(key: string) {
    const node = this._cache.get(key) as CacheNode;
    if (!node) return null;
    if (node.expire && node.expire < Date.now()) {
      this._delete(node);
      return null;
    }
    this._moveToFront(node);
    return node.value;
  }



  async _setValFromFunc(key, func: (key, settingObj: { ttl: number | null }) => Promise<any | null>) {
    let par = { ttl: null };
    let val = await func(key, par);
    if (val != null)
      this.setValue(key, val, par.ttl);
    return val;
  }



  async getOrCreate(key: string, func: (key, settingObj: { ttl: number | null }) => Promise<any | null>) {
    const node = this._cache.get(key) as CacheNode;
    if (!node)
      return await this._setValFromFunc(key, func);

    if (node.expire && node.expire < Date.now()) {
      this._delete(node);
      return await this._setValFromFunc(key, func);
    }

    this._moveToFront(node);
    return node.value;
  }



  setValue(key: string, value: any, ttl: number | null = null) {
    let node = this._cache.get(key) as CacheNode;
    if (node) {
      node.value = value;
      node.expire = ttl ? Date.now() + ttl * 1000 : null;
      this._moveToFront(node);
      return;
    }
    node = new CacheNode(key, value, ttl ? Date.now() + ttl * 1000 : null);
    this._cache.set(key, node);
    if (this._size === this._maxSize) {
      this._delete(this._tail!);
    }
    this._addToFront(node);
  }



  removeValue(key: string) {
    const node = this._cache.get(key) as CacheNode;;
    if (!node) return;
    this._delete(node);
  }



  clear() {
    this._size = 0;
    this._cache = new Map();
    this._head = null;
    this._tail = null;
  }



  protected _delete(node: CacheNode) {
    this._cache.delete(node.key);
    if (node.prev) node.prev.next = node.next;
    else this._head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this._tail = node.prev;
    this._size--;
  }



  protected _moveToFront(node: CacheNode) {
    if (node === this._head) return;
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this._tail) this._tail = node.prev;
    node.prev = null;
    node.next = this._head;
    if (this._head) this._head.prev = node;
    this._head = node;
  }



  protected _addToFront(node: CacheNode) {
    if (!this._head) {
      this._head = node;
      this._tail = node;
    } else {
      node.next = this._head;
      this._head.prev = node;
      this._head = node;
    }
    this._size++;
  }
}
