const { Model } = require('objection')

class Chat extends Model {

	static get tableName() {
		return 'chat';
	}

	static get idColumn() {
		return 'id';
	}

	static get relationMappings() {
		const User = require('./User')
		const Message = require('./Message')
		return {
			users: {
				relation: Model.HasOneThroughRelation,
				modelClass: User,
				join: {
					from: 'chat.id',
					through: {
						from: 'chats_list.chat_id',
						to: 'chats_list.user_id'
					},
					to: 'user.id'
				}
			},
			messages: {
				relation: Model.HasManyRelation,
				modelClass: Message,
				join: {
					from: 'chat.id',
					to: 'message.chat_id'
				}
			}
		}
	}
}

module.exports = Chat
