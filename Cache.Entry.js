define(function (require) {
	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	function CacheEntry(manager, name, entry) {
		entry.cacheEntry = this;
		this.name = name;
		this.entry = entry;
		this.manager = manager;
		this.isValid = true;
		this.isRefreshing = false;
		this.service = entry.service;
	}

	CacheEntry.prototype = {
		validate: function () {
			this.isValid = true;
			this.isRefreshing = false;
		},
		invalidate: function () {
			if (this.isValid && !this.isRefreshing) {
				this.manager._log(' INVALIDATE ', this.name, this.entry);
				this.isValid = false;
				this.entry.trigger('cache:invalidated');
			}
			return this;
		},
		evict: function () {
			this.manager._log('  EVICTION  ', this.name, this.entry);
			this.isValid = false;
			this.entry.trigger('cache:evicted');
			this.entry = null;
			return this;
		},
		refresh: function () {
			if (!this.isValid && !this.isRefreshing) {
				this.manager._log('  RE-FRESH  ', this.name, this.entry);

				this.isRefreshing = true;
				this.entry.trigger('cache:refresh:begin');

				var self = this;
				$.when(this.entry.serverRead()).then(function () {
					self.isValid = true;
					self.isRefreshing = false;
					self.entry.trigger('cache:refresh:complete');
				});
			}
			return this;
		}
	};
	return CacheEntry;
});