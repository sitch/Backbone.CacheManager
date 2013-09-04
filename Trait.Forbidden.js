define(function(require) {
	'use strict';

	return {
		create: function() {
			throw new Error('InvalidFunctionInvocation :: Cannot call create when using Backbone.CacheManager');
		},
		fetch: function() {
			throw new Error('InvalidFunctionInvocation :: Cannot call fetch when using Backbone.CacheManager');
		},
		save: function() {
			throw new Error('InvalidFunctionInvocation :: Cannot call save when using Backbone.CacheManager');
		},
		destroy: function() {
			throw new Error('InvalidFunctionInvocation :: Cannot call destroy when using Backbone.CacheManager');
		}
	};
});