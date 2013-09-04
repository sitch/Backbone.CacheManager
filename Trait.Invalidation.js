define(function(require) {
	'use strict';

	var _ = require('underscore');

	return {
		_swapConfig: function (params) {
			if (params.url) {
				this.url = params.url;
			}
			if (params.isNew) {
				this.isNew = params.isNew;
			}
			if (params.toJSON) {
				this.toJSON = params.toJSON;
			}
		},
		_injectInvalidation: function (method, options, config) {
			var self = this;
			var original = {
				url: self.url,
				isNew: self.isNew,
				toJSON: self.toJSON,
				success: options.success
			}
			
			self._swapConfig(config);
			options.success = function () {
				self._swapConfig(original);

				if (method !== 'read') {
					self.cacheEntry.manager.invalidateDependencies(method, model.getService());
				}
				if (_.isFunction(original.success)) {
					original.success(model, response);
				}
			}
			return options;
		}
	};
});