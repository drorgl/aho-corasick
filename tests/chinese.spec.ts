import {expect} from "chai";
import "mocha";
import AhoCorasick from "../src";

describe("chinese", () => {

	it(`Picks out chinese words`, () => {
		let find_list;
		let i;
		let len;
		let ref;
		let word;

		const ac = new AhoCorasick();

		ref = ["五毛党", "国家", "黑手党", "党国", "毛五贴"];

		for (i = 0, len = ref.length; i < len; i++) {
			word = ref[i];
			ac.add(word);
		}
		ac.build_fail();

		find_list = ["毛五贴", "五毛党", "党国", "国家"];
		const content = "宋国毛五贴五毛党国家是谁啊";

		const r = ac.search(content, (found_word, data, offset) => {
			expect(content.substr(offset, found_word.length))
				.to.deep.equal(found_word);
		});

		expect(find_list.length).to.greaterThan(0);
		expect(Object.keys(r.count)).to.deep.equal(find_list);

		console.log(r);
	});
});
