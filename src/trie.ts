export class Trie<T = any> {
	public next: {
		[k: string]: Trie<T>
	} = {};
	public is_word: boolean = null;
	public value: string = null;
	public data: T[] = [];

	// fail?: Trie = null;

	public add(word: string, data?: T, original_word?: string): boolean {
		let chr: string;
		let node: Trie;
		chr = word.charAt(0);
		node = this.next[chr];
		if (!node) {
			node = this.next[chr] = new Trie();
			if (original_word) {
				node.value = original_word.substr(0, original_word.length - word.length + 1);
			} else {
				node.value = chr;
			}
		}
		if (word.length > 1) {
			return node.add(word.substring(1), data, original_word || word);
		} else {
			node.data.push(data);
			return node.is_word = true;
		}
	}

	public explore_fail_link(word: string) {
		let chr;
		let i;
		let node: Trie<T>;
		let _i;
		let _ref;
		node = this;
		for (i = _i = 0, _ref = word.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
			chr = word.charAt(i);
			node = node.next[chr];
			if (!node) {
				return null;
			}
		}
		return node;
	}

	public each_node(callback: (trie: this, node: Trie<T>) => void) {
		const _ref = this.next;
		for (const _k of Object.keys(_ref)) {
			const node = _ref[_k];
			callback(this, node);
		}
		const _ref1 = this.next;
		for (const _k of Object.keys(_ref1)) {
			const node = _ref1[_k];
			node.each_node(callback);
		}
		return this;
	}
}
