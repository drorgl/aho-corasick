import {expect} from "chai";
import "mocha";

import { ITest } from "mocha";

import AhoCorasick from "../src";

describe("test", () => {

	it(`Test simple`, () => {
		let ac;
		let j;
		let len;
		let ref;
		let word;
		ac = new AhoCorasick();
		ref = ["ab", "bcr", "caa"];
		for (j = 0, len = ref.length; j < len; j++) {
			word = ref[j];
			ac.add(word, {
				word
			});
		}
		ac.build_fail();

		ac.search("foab", (found_word, data, offset) => {

			const expected = "ab";

			expect(found_word).to.deep.equal(expected);
			expect(data[0].word).to.deep.equal(expected);

			expect(offset).to.deep.equal(2);
		});

		ac.search("bcaa", (found_word, data, offset) => {

			const expected = "caa";

			expect(found_word).to.deep.equal(expected);
			expect(data[0].word).to.deep.equal(expected);

			expect(offset).to.deep.equal(1);
		});
	});

	it(`Picks out multiple words`, () => {

		let ac;
		let find_list;
		let j;
		let len;
		let ref;
		let word;
		ac = new AhoCorasick();
		ref = ["little bit of", "receivings", "ivi", "boot", "here"];
		for (j = 0, len = ref.length; j < len; j++) {
			word = ref[j];
			ac.add(word);
		}
		ac.build_fail();
		find_list = ["here", "little bit of", "ivi", "boot"];
		const content = "here is a little bit of text that more closely resembles the kind of style that this library will be receiving. maybe with another sentance one to boot";

		const r = ac.search(content, (found_word, data, offset) => {

			const actual = content.substr(offset, found_word.length);

			expect(actual).to.deep.equal(found_word);
		});

		expect(find_list.length).to.greaterThan(0);
		expect(Object.keys(r.count)).to.deep.equal(find_list);

		console.log(r);
	});

	it(`Match every`, () => {

		const ac = new AhoCorasick();
		const ref = ["foo", "foo bar"];
		for (let j = 0, len = ref.length; j < len; j++) {
			const word = ref[j];
			ac.add(word);
		}
		ac.build_fail();
		ac.search("foo", (found_word, data, offset) => {

			expect(found_word).to.deep.equal("foo");

			expect(offset).to.deep.equal(0);

		});
		let i = 0;
		const match_word = ["foo", "foo bar"];
		const r = ac.search("foo bar", (found_word, data, offset) => {

			expect(found_word).to.deep.equal(match_word[i++]);

			expect(offset).to.deep.equal(0);
		});

	});

	it(`Multiple matches`, () => {

		const ac = new AhoCorasick();
		const ref = ["say", "she", "shr", "he", "her"];
		for (let j = 0, len = ref.length; j < len; j++) {
			const word = ref[j];
			ac.add(word, {
				word
			});
		}
		ac.build_fail();
		const expected = {
			she: 1,
			he: 1,
			her: 1
		};
		const actual: {[word: string]: number} = {};
		const r = ac.search("yasherhs", (found_word: string) => {
			if (actual[found_word] == null) {
				actual[found_word] = 0;
			}
			return actual[found_word]++;
		});

		expect(actual).to.deep.equal(expected);

		console.log(r);

	});

	it(`Allow attaching multiple bits of data`, () => {

		const ac = new AhoCorasick();
		ac.add("foo", "data1");
		ac.add("foo", "data2");

		ac.build_fail();

		const r = ac.search("foo", (found_word, data) => {

			expect(data[0]).to.deep.equal("data1");
			expect(data[1]).to.deep.equal("data2");

		});

		expect(r.count["foo"]).to.deep.equal(1);

		expect(r.data["foo"]).to.deep.equal(["data1", "data2"]);

		console.log(r);

	});

});
