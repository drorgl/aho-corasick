import { FailTrie } from "./failtrie";
import {Trie} from "./trie";

export class AhoCorasick<T = any> {
	public trie: FailTrie<T> = new FailTrie();

	public add(word: string, data?: T) {
		return this.trie.add(word, data);
	}

	public build_fail(node?: FailTrie<T>) {
		let _k;
		let fail_node;
		let i;
		let j;
		let ref;
		let ref1;
		let sub_node;
		node = node || this.trie;
		node.fail = null;
		if (node.value) {
			for (i = j = 1, ref = node.value.length; (1 <= ref ? j < ref : j > ref); i = 1 <= ref ? ++j : --j) {
				fail_node = this.trie.explore_fail_link(node.value.substring(i));
				if (fail_node) {
					node.fail = fail_node;
					break;
				}
			}
		}
		ref1 = node.next;
		for (_k of Object.keys(ref1)) {
			sub_node = ref1[_k];
			this.build_fail(sub_node);
		}
		return this;
	}

	public foreach_match(node: FailTrie<T>, pos: number, callback: IAhoCorasickCallback<T>) {
		let offset: number;
		while (node) {
			if (node.is_word) {
				offset = pos - node.value.length;
				callback(node.value, node.data, offset, node);
			}
			node = node.fail;
		}
		return this;
	}

	public search(string: string, callback?: IAhoCorasickCallback<T>): IAhoCorasickResult<T>;
	public search<R = IAhoCorasickResult<T>>(string: string, callback?: IAhoCorasickCallback<T>): R;
	public search(string: string, callback?: IAhoCorasickCallback<T>) {
		/**
		 * 參考 aca 回傳的資料結構
		 * @see https://www.npmjs.com/package/aca
		 */
		const result: IAhoCorasickResult<T> = {
			matches: {},
			positions: {},
			count: {},
			data: {},
		};

		let callbackResult: IAhoCorasickCallback<T>;

		if (callback) {
			callbackResult = (...argv) => {
				const [value, data, offset, node] = argv;

				result.matches[value] = result.matches[value] || [];

				result.matches[value].push(offset);

				result.positions[offset] = result.positions[offset] || [];
				result.positions[offset].push(value);

				if (result.count[value] == null) {
					result.count[value] = 0;
				}

				result.count[value]++;

				result.data[value] = node.data;

				callback.call(result, ...argv);
			};
		} else {
			callbackResult = (...argv) => {
				const [value, data, offset, node] = argv;

				result.matches[value] = result.matches[value] || [];

				result.matches[value].push(offset);

				result.positions[offset] = result.positions[offset] || [];
				result.positions[offset].push(value);

				if (result.count[value] == null) {
					result.count[value] = 0;
				}

				result.count[value]++;

				result.data[value] = node.data;
			};
		}

		let chr;
		let idx;
		let j;
		let ref;
		let current = this.trie;
		for (idx = j = 0, ref = string.length; (0 <= ref ? j < ref : j > ref); idx = 0 <= ref ? ++j : --j) {
			chr = string.charAt(idx);
			while (current && !current.next[chr]) {
				current = current.fail;
			}
			if (!current) {
				current = this.trie;
			}
			if (current.next[chr]) {
				current = current.next[chr];

				this.foreach_match(current, idx + 1, callbackResult);
			}
		}

		return result;
	}

	public to_dot(): string {
		const dot = ["digraph Trie {"];
		const v_ = (node: FailTrie<T>) => {
			if (node && node.value) {
				return `"${node.value}"`;
			} else {
				return "\"\"";
			}
		};
		const last_chr = (str: string) => {
			if (str) {
				return str.charAt(str.length - 1);
			}
		};
		const link_cb = (from: FailTrie<T>, to: FailTrie<T>) => {
			let k;
			let to_label;
			let to_opt;
			let v;
			to_label = last_chr(to.value);
			to_opt = [`label = "${to_label}"`];
			if (to.is_word) {
				const option: {[name: string]: string} = {
					style: "filled",
					color: "skyblue"
				};
				for (k of Object.keys(option)) {
					v = option[k];
					to_opt.push(`${k} = "${v}"`);
				}
			}
			dot.push(`${v_(from)} -> ${v_(to)};`);
			dot.push(`${v_(to)} [ ${to_opt.join(",")} ];`);
			return fail_cb(from, to);
		};
		const fail_cb = (from: FailTrie<T>, to: FailTrie<T>) => {
			let style;
			[from, to] = [to, to.fail];
			style = to ? "dashed" : "dotted";
			return dot.push(`${v_(from)} -> ${v_(to)} [ style = "${style}" ];`);
		};
		this.trie.each_node(link_cb);
		dot.push("}");
		return dot.join("\n");
	}

}

export type IAhoCorasickCallback<T> = (value: string, data: T[], offset: number, node: Trie<T>) => void;

export interface IAhoCorasickResult<T = any> {
	/**
	 * keyword: position[]
	 */
	matches: {
		[k: string]: number[],
	};
	/**
	 * position: keyword[]
	 */
	positions: {
		[k: number]: string[],
	};
	/**
	 * keyword: count
	 */
	count: {
		[k: string]: number,
	};
	/**
	 * keyword: data
	 */
	data: {
		[k: string]: T[],
	};
}
