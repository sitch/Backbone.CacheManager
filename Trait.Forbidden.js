define(function(require) {
	'use strict';

	return {
		create: function() {
			throw new Error('InvalidFunctionInvocation :: Cannot call backbone methods when using Backbone.CacheManager');
		},
		fetch: function() {
			throw new Error('InvalidFunctionInvocation :: Cannot call backbone methods when using Backbone.CacheManager');
		},
		save: function() {
			throw new Error('InvalidFunctionInvocation :: Cannot call backbone methods when using Backbone.CacheManager');
		},
		destroy: function() {
			throw new Error('InvalidFunctionInvocation :: Cannot call backbone methods when using Backbone.CacheManager');
		}
	};
});