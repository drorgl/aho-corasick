import { Trie } from "./trie";

export class FailTrie<T> extends Trie<T> {
	public fail?: Trie<T>;
}
