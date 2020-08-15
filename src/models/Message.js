const { Model } = require('objection')

class Message extends Model {
	static get tableName() {
		return 'message';
	}
	
	static get idColumn() {
		return 'id';
    }
      
    static get relationMappings() {
        const User = require('./User')
        const Chat = require('./Chat')
		return {
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'message.user_id',
					to: 'user.id'
				}
            },
            chat: {
				relation: Model.BelongsToOneRelation,
				modelClass: Chat,
				join: {
					from: 'message.chat_id',
					to: 'chat.id'
				}
			}
		}
	}
}

module.exports = Message