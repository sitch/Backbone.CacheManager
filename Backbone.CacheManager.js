define(function (require) {
	'use strict';

	var _ = require('underscore');
	var BaseTraits = require('./Trait.Base');
	var CacheEntry = require('./Cache.Entry');

	/*
	 * Cache
	 *
	 * All requests should be written towards this facade, as it will automatically handle cache invalidation
	 * dependencies and trigger auto gets.
	 */

	function Cache(options) {
		if (!_.isObject(options)) {
			throw new Error('InvalidArgument:: Must pass a configuration object to instantiate');
		}
		if (!options.hasOwnProperty('enabled')) {
			throw new Error('InvalidArgument:: Must specify if cache is enabled');
		}
		if (!options.hasOwnProperty('constructorMap')) {
			throw new Error('InvalidArgument:: Must contain a constructorMap');
		}
		if (!options.hasOwnProperty('invalidateMap')) {
			throw new Error('InvalidArgument:: Must contain an invalidateMap');
		}
		this.enabled = options.enabled;
		this.constructorMap = options.constructorMap;
		this.invalidateMap = this._buildInvalidationMap(options.invalidateMap);

		// this.log = options.log || this._noop;

		this.cache = {};
		return this;
	}
	Cache.prototype = {
		/*
		 * Get
		 */
		get: function (name, params, options) {
			var hash = this._generateHash(name, params);
			var cached = this.enabled && this.cache.hasOwnProperty(hash);
			var resource, cacheEntry;

			var logCache = cached;
			if (!cached) {
				resource = this._requestFromServer(
					this.constructorMap[name],
					name,
					params || {},
					options || {}
				);
				this.cache[hash] = new CacheEntry(this, name, resource);
			} else {
				cacheEntry = this.cache[hash];
				resource = cacheEntry.entry;
				if (!cacheEntry.valid) {
					cacheEntry.refresh();
					cached = false;
				}
			}
			if (!logCache) {
				this._log('GET ' + (logCache ? '(cached)' : '(SERVER)'), name, resource);
			}
			return resource;
		},
		/*
		 *
		 */
		prepare: function (name, params) {
			var hash = this._generateHash(name, params);
			var cached = this.enabled && this.cache.hasOwnProperty(hash);

			var resource = cached ? this.cache[hash] : new this.constructorMap[name]();

			if (!cached) {
				this.cache[hash] = new CacheEntry(this, name, resource);
			}
			return resource;
		},
		/*
		 * Flush
		 */
		flush: function (name, params) {
			var hash = this._generateHash(name, params);
			if (this.cache.hasOwnProperty(hash)) {
				this.cache[hash].invalidate();
				delete this.cache[hash];
			}
			return this;
		},
		/*
		 * Invalidate
		 */
		invalidate: function (name, params) {
			var hash = this._generateHash(name, params);
			if (this.cache.hasOwnProperty(hash)) {
				this.cache[hash].invalidate();
			}
			return this;
		},
		/*
		 * InvalidateAll
		 */
		invalidateAll: function () {
			_.each(this.cache, function (entry, key) {
				entry.invalidate();
			}, this);
			return this;
		},
		/*
		 * InvalidateService
		 */
		invalidateService: function (service) {
			_.each(this.cache, function (entry, key) {
				if (entry.service === service) {
					entry.invalidate();
				}
			});
			return this;
		},
		/*
		 * InvalidateDependencies
		 */
		invalidateDependencies: function (method, service) {
			if (!this.invalidateMap.hasOwnProperty(service)) {
				throw new Error('InvalidServiceDependencyError:: ' + service + ' is not a valid service');
			}
			var dependentSections = this.invalidateMap[service];
			_.each(this.cache, function (entry, key) {
				if (dependentSections.hasOwnProperty(entry.service)) {
					entry.invalidate();
				}
			});
			return this;
		},
		/*
		 * Refresh
		 */
		refresh: function () {
			_.each(this.cache, function (entry, key) {
				if (!entry.valid) {
					entry.refresh();
				}
			});
			return this;
		},
		/*
		 * RefreshEntry
		 */
		refreshEntry: function (name, params) {
			var hash = this._generateHash(name, params);
			if (this.cache.hasOwnProperty(hash)) {
				this.cache[hash].refresh();
			}
			return this;
		},
		/*
		 * No operation fn
		 */
		_noop: function () {},
		/*
		 * _log
		 */
		_log: function (method, name, entry) {
			var padding = '                     ';
			var url = _.isFunction(entry.urlRead) ? entry.urlRead() : entry.url();

			var left = Math.floor((16 - name.length) / 2);
			var right = (name.length % 2) ? left + 1 : left;
			name = padding.split('', left).join('') + name + padding.split('', right).join('');

			debug.info(['<CACHE> ' + method, name, url].join(' : '));
		},
		/*
		 * _buildInvalidationMap
		 *
		 *  Builds a map of invalidation that keys the service name with a value of true
		 */
		_buildInvalidationMap: function (map) {
			var result = {};
			var reduceFn = function (memo, item) {
				memo[item] = true;
				return memo;
			};
			for (var i in map) {
				if (map.hasOwnProperty(i)) {
					result[i] = _.reduce(map[i], reduceFn, {});
				}
			}
			return result;
		},
		/*
		 * _generateHash
		 *
		 * TODO: it is possible that flattenQueryParams could generate two different hashes for the same collection if
		 * the params evaluated in a different order
		 */
		_generateHash: function (name, params) {
			return name + '|' + BaseTraits.flattenQueryParams(params || {});
		},
		/*
		 * RequestFromServer
		 *
		 * Makes a request from the server by first constructing the model or collection, then issuing a fetch
		 */
		_requestFromServer: function (Constructor, name, params, options) {
			if (!Constructor) {
				throw new Error('CacheConstructorNotFound:: Could not locate constructor for ' + name);
			}
			var resource = new Constructor();

			if (resource.queryParams) {
				resource.setQueryParams(params || {});
			}

			resource.serverRead({
				success: options.success || Constructor.prototype.readSuccess || this._noop,
				error: options.error || Constructor.prototype.readError || this._noop
			});
			return resource;
		}
	};
	return Cache;
});