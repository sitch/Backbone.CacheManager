define(function(require) {
	'use strict';

	var _ = require('underscore');

	return {
		url: function() {
			var encodedQuery = this.flattenQueryParams(this.getQueryParams());
			return this.getService() + (encodedQuery ? '/?' + encodedQuery : '');
		},
		register: function(service, params) {
			if(!this.hasRegistered) {
				this.setService(service);
				this.setQueryParams(params || {});
				this.hasRegistered = true;
			}
		},
		getService: function() {
			return this.service;
		},
		setService: function(service) {
			this.service = service;
		},
		getQueryParams: function() {
			return this.queryParams;
		},
		setQueryParams: function(params) {
			this.queryParams = params;
		},
		addQueryParams: function(params) {
			_.extend(this.queryParams, params);
		},
		flattenQueryParams: function(params) {
			var value;
			var key;
			var stack = [];

			for(var unencodedKey in params) {
				if(params.hasOwnProperty(unencodedKey)) {
					key = encodeURIComponent(unencodedKey);
					value = params[unencodedKey];

					if(_.isNull(value) || _.isUndefined(value) || value === '') {
						continue;
					}
					if(_.isArray(value)) {
						_.each(_.compact(value), function(item) {
							stack.push(key + '=' + encodeURIComponent(item));
						});
					} else {
						stack.push(key + '=' + encodeURIComponent(value));
					}
				}
			}
			return stack.join('&');
		}
	};
});