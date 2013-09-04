define(function (require) {
	'use strict';

	var _ = require('underscore');
	var Backbone = require('backbone');
	var BaseTrait = require('./Trait.Base');
	var ForbiddenTrait = require('./Trait.Forbidden');

	return Backbone.Model.extend(_.extend({

		_toJSON: Backbone.Model.prototype.toJSON,

		// CREATE
		serverCreate: function (options) {
			var format = this.toJSONCreate || this._toJSON;
			var url = this.urlCreate || this.url;

			return this.crud('create', format, url, options);
		},
		// READ
		serverRead: function (options) {
			var format = this.toJSONRead || this._toJSON;
			var url = this.urlRead || this.url;

			return this.crud('read', format, url, options);
		},
		// UPDATE
		serverUpdate: function (options) {
			var format = this.toJSONUpdate || this._toJSON;
			var url = this.urlUpdate || this.url;

			return this.crud('update', format, url, options);
		},
		// DELETE
		serverDelete: function (options) {
			var format = this.toJSONDelete || this._toJSON;
			var url = this.urlDelete || this.url;

			return this.crud('delete', format, url, options);
		},
		// CRUD Abstract
		crud: function (method, format, url, options) {
			options = options ? _.clone(options) : {};

			var url = this.url;
			var toJSON = this.toJSON;

			var model = _.extend(this, {
				toJSON: format,
				url: url
			});
			var success = options.success;
			var error = options.error;

			var self = this;

			_.extend(options, {
				success: function (response, status, xhr) {

					_.extend(self, {
						toJSON: toJSON,
						url: url
					});

					var attrs = model.parse(response, xhr);
					if (!model.set(_.isArray(attrs) ? attrs.shift() : attrs, options)) {
						return false;
					}
					if (method !== 'read') { 
						self.cacheEntry.manager.invalidateDependencies(method, model.service);
					}
					if (_.isFunction(success)) {

						success(model, response);
					} else if (method !== 'read') {
						model.trigger('sync', model, response, options);

					}
				}
				// ,error: Backbone.wrapError(error, model, options)
			});
			this.deferred = Backbone.sync.call(model, method, model, options);
			return this.deferred;
		}
	}, BaseTrait, ForbiddenTrait));
});