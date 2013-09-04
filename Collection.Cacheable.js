define(function (require) {
	'use strict';

	var _ = require('underscore');
	var Backbone = require('backbone');
	var BaseTrait = require('./Trait.Base');
	var ForbiddenTrait = require('./Trait.Forbidden');

	return Backbone.Collection.extend(_.extend({
		_toJSON: Backbone.Collection.prototype.toJSON,
		// CREATE
		serverCreate: function (model, options) {
			var dataFormat = this.toJSONCreate || this._toJSON;
			var urlFormat = this.urlCreate || this.url;

			model = this._prepareModel(model, options);
			this.add(model, options);

			return this.crud('create', dataFormat, urlFormat, options, model);
		},
		// READ
		serverRead: function (options) {
			var dataFormat = this.toJSONRead || this._toJSON;
			var urlFormat = this.urlRead || this.url;

			return this.crud('read', dataFormat, urlFormat, options);
		},
		// UPDATE
		serverUpdate: function (options) {
			var dataFormat = this.toJSONUpdate || this._toJSON;
			var urlFormat = this.urlUpdate || this.url;

			return this.crud('update', dataFormat, urlFormat, options);
		},
		// DELETE
		serverDelete: function (options) {
			var dataFormat = this.toJSONDelete || this._toJSON;
			var urlFormat = this.urlDelete || this.url;

			return this.crud('delete', dataFormat, urlFormat, options);
		},
		// CRUD Abstract
		crud: function (method, dataFormat, urlFormat, options, model) {
			options = options ? _.clone(options) : {};

			var toJSON = this.toJSON;
			var url = this.url;

			var collection = _.extend(this, {
				toJSON: dataFormat,
				url: urlFormat
			});
			var success = options.success;
			var error = options.error;
			var self = this;

			_.extend(options, {
				success: function (resp, status, xhr) {
					var opts = options;
					var result = true;
					self.response = resp;

					// collection.cacheEntry.validate();
					// restore original
					_.extend(self, {
						toJSON: toJSON,
						url: url
					});

					if (!collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), opts)) {
						result = false;
					}

					if (method !== 'read') {
						self.cacheEntry.manager.invalidateDependencies(method, collection.service);
					}
					if (!result) {
						return result;
					}
					if (_.isFunction(success)) {
						success(collection, resp);
					} else if (model) {
						collection.trigger('sync', model, resp, options);
					}
				}
				// ,error: wrapError(error, collection, options)
			});
			this.deferred = Backbone.sync.call(collection, method, collection, options);
			return this.deferred;
		}
	}, BaseTrait, ForbiddenTrait));
});