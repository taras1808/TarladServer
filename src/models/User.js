const { Model } = require('objection')

class User extends Model {

	static get tableName() {
		return 'user';
	}

	static get idColumn() {
		return 'id';
	}

	static get relationMappings() {
		const Token = require('./Token')
		const Chat = require('./Chat')
		const Message = require('./Message')
		return {
			tokens: {
				relation: Model.HasManyRelation,
				modelClass: Token,
				join: {
					from: 'user.id',
					to: 'token.user_id'
				}
			},
			chats: {
				relation: Model.HasOneThroughRelation,
				modelClass: Chat,
				join: {
					from: 'user.id',
					through: {
						from: 'chats_list.user_id',
						to: 'chats_list.chat_id'
					},
					to: 'chat.id'
				}
			},
			messages: {
				relation: Model.HasManyRelation,
				modelClass: Message,
				join: {
					from: 'user.id',
					to: 'message.user_id'
				}
			}
		}
	}
}

module.exports = User
