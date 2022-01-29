const chatsController = require('./socket-io/ChatsController')
const usersController = require('./socket-io/UsersController')
const messagesController = require('./socket-io/MessagesController')
const roomController = require('./socket-io/RoomsController')
const jwtMiddleware = require('./middlewares/JwtMiddlewareSocketIO')

module.exports = (http) => {
    const io = require('socket.io')(http)
    io.use(jwtMiddleware);
    io.on('connect', (socket) => {
        socket.on('join', roomController.join(socket))
        socket.on('chats', chatsController.chats(socket))
        socket.on('chats/create', chatsController.chatsCreate(socket))
        socket.on('chats/title', chatsController.chatsTitle(socket))
        socket.on('chats/users', chatsController.chatsUsers(socket))
        socket.on('chats/users/search', chatsController.chatsUsersSearch(socket))
        socket.on('chats/users/add', chatsController.chatsUsersAdd(socket))
        socket.on('chats/users/delete', chatsController.chatsUsersDelete)
        socket.on('chats/messages/before', chatsController.chatsMessagesBefore(socket))
        socket.on('chats/messages/last', chatsController.chatsMessagesLast(socket))
        socket.on('users', usersController.users)
        socket.on('users/update', usersController.usersUpdate(socket))
        socket.on('users/search', usersController.usersSearch(socket))
        socket.on('users/images', usersController.usersImages(socket))
        socket.on('users/images/delete', usersController.usersImagesDelete(socket))
        socket.on('messages', messagesController.messages(socket))
        socket.on('messages/edit', messagesController.messagesEdit)
        socket.on('messages/delete', messagesController.messagesDelete)
        socket.on('messages/last', messagesController.messagesLast)
    })
    return io;
}
