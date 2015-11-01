var assert = require('assert')
var merger = require('../lib/merger')

describe('Merger', () => {
	it('Does nothing if nothing has to be done', () => {
		var arr1 = []
		var arr2 = []
		var output = merger([arr1, arr2])
		assert.deepEqual(output, [])
	})
	it('Leaves first array alone if second array empty', () => {
		var arr1 = [{timestamp: 1, text: 'Hello'}]
		var arr2 = []
		var output = merger([arr1, arr2])
		assert.deepEqual(output, arr1)
	})
	it('Leaves second array alone if first array empty', () => {
		var arr1 = []
		var arr2 = [{timestamp: 1, text: 'Hello'}]
		var output = merger([arr1, arr2])
		assert.deepEqual(output, arr2)
	})
	it('Merges based on the date', () => {
		var arr1 = [
			{
				"user": null,
				"timestamp": "2015-11-01T16:05:04.281Z",
				"text": "Hello World"
			},
			{
				"user": null,
				"timestamp": "2015-11-01T16:07:04.281Z",
				"text": "Hello IPFS"
			}
		]
		var arr2 = [
			{
				"user": null,
				"timestamp": "2015-11-01T16:06:04.281Z",
				"text": "Planet World"
			},
			{
				"user": null,
				"timestamp": "2015-11-01T16:08:04.281Z",
				"text": "Byebye IPFS!"
			}
		]
		var output = merger([arr1, arr2])
		assert.equal(output.length, 4)
		assert.equal(output[0].text, 'Hello World')
		assert.equal(output[1].text, 'Planet World')
		assert.equal(output[2].text, 'Hello IPFS')
		assert.equal(output[3].text, 'Byebye IPFS!')
	})
	it('Can merge four arrays based on date', () => {
		var arr1 = [{
				"user": null,
				"timestamp": "2015-11-01T16:05:04.281Z",
				"text": "Hello World"
		}]
		var arr2 = [{
				"user": null,
				"timestamp": "2015-11-01T16:07:04.281Z",
				"text": "Hello IPFS"
		}]
		var arr3 = [
			{
				"user": null,
				"timestamp": "2015-11-01T16:06:04.281Z",
				"text": "Planet World"
		}]
		var arr4 = [{
				"user": null,
				"timestamp": "2015-11-01T16:08:04.281Z",
				"text": "Byebye IPFS!"
		}]
		var output = merger([arr1, arr2, arr3, arr4])
		assert.equal(output.length, 4)
		assert.equal(output[0].text, 'Hello World')
		assert.equal(output[1].text, 'Planet World')
		assert.equal(output[2].text, 'Hello IPFS')
		assert.equal(output[3].text, 'Byebye IPFS!')
	})
	it('Remove duplicates', () => {
		var arr1 = [{timestamp: 1, text: 'Hello'}]
		var arr2 = [{timestamp: 1, text: 'Hello'}, {timestamp: 2, text: 'World'}]
		var output = merger([arr1, arr2])
		assert.equal(output.length, 2)
		assert.equal(output[0].text, 'Hello')
		assert.equal(output[1].text, 'World')
	})
  it('Works with array of arrays', () => {
		var arr1 = [{timestamp: 1, text: 'Hello'}]
		var arr2 = [{timestamp: 1, text: 'Hello'}, {timestamp: 2, text: 'World'}]
		var output = merger([arr1, arr2])
		assert.equal(output.length, 2)
		assert.equal(output[0].text, 'Hello')
		assert.equal(output[1].text, 'World')
  })
})
