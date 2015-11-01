var _ = require('underscore')
module.exports = function(arrays) {
	// Just merges all arguments (should be array) based on timestamp
	var new_arr = []
	arrays.forEach((array) => {
		new_arr = new_arr.concat(array)
	})
	sorted_arr = _.sortBy(new_arr, (o) => {
		return o.timestamp
	})
	return _.uniq(sorted_arr, (item, key, timestamp) => {
		return item.timestamp
	})
}
