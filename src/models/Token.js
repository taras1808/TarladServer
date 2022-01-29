const { Model } = require('objection');

class Token extends Model {
	static get tableName() {
		return 'token';
	}

	static get relationMappings() {
		const User = require('./User')
		return {
			writer: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'token.user_id',
					to: 'user.id'
				}
			}
		}
	}
}

module.exports = Token
