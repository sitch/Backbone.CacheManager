define(function (require) {
	'use strict';

	var _ = require('underscore');
	var Backbone = require('backbone');
	var BaseTrait = require('./Trait.Base');
	var ForbiddenTrait = require('./Trait.Forbidden');
	var InvalidationTrait = require('./Trait.Invalidation');

	return Backbone.Collection.extend(_.extend({
		// CREATE
		serverCreate: function (model, options) {
			var config = {
				url: this.urlCreate,
				toJSON: this.toJSONCreate
			}
			var opts = this._injectInvalidation('create', options, config);

			return this.deferred = Backbone.Collection.prototype.create.call(this, null, model, opts);
		},
		// READ
		serverRead: function (options) {
			var config = {
				url: this.urlRead,
				toJSON: this.toJSONRead
			}
			var opts = this._injectInvalidation('read', options, config);

			return this.deferred = Backbone.Collection.prototype.fetch.call(this, null, opts);
		}
	}, BaseTrait, InvalidationTrait, ForbiddenTrait));
});