define(function (require) {
	'use strict';

	var _ = require('underscore');
	var Backbone = require('backbone');
	var BaseTrait = require('./Trait.Base');
	var ForbiddenTrait = require('./Trait.Forbidden');
	var InvalidationTrait = require('./Trait.Invalidation');

	return Backbone.Model.extend(_.extend({
		_isNotNew: function () {
			return false;
		},
		_isNew: function () {
			return true;
		},
		// CREATE
		serverCreate: function (options) {
			var config = {
				url: this.urlCreate,
				isNew: this._isNew,
				toJSON: this.toJSONCreate
			}
			var opts = this._injectInvalidation('create', options, config);

			return this.deferred = Backbone.Model.prototype.save.call(this, null, opts);
		},
		// READ
		serverRead: function (options) {
			var config = {
				url: this.urlRead,
				toJSON: this.toJSONRead
			}
			var opts = this._injectInvalidation('read', options, config);

			return this.deferred = Backbone.Model.prototype.fetch.call(this, null, opts);
		},
		// UPDATE
		serverUpdate: function (options) {
			var config = {
				url: this.urlUpdate,
				isNew: this._isNotNew,
				toJSON: this.toJSONUpdate
			}
			var opts = this._injectInvalidation('update', options, config);

			return this.deferred = Backbone.Model.prototype.save.call(this, null, opts);
		},
		// DELETE
		serverDelete: function (options) {
			var config = {
				url: this.urlDelete,
				isNew: this._isNotNew,
				toJSON: this.toJSONDelete
			}
			var opts = this._injectInvalidation('delete', options, config);

			return this.deferred = Backbone.Model.prototype.destroy.call(this, null, opts);
		}
	}, BaseTrait, InvalidationTrait, ForbiddenTrait));
});