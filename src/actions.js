import axios from 'axios';

export function receiveUserInfo(info){
	return {
        type: 'RECEIVE_USER_INFO',
        user: {
        	first: info.first,
        	last: info.last,
        	img: info.image,
        	team: info.team,
        	email: info.email,
        	code: info.code,
        	team_img: info.team_img,
        	team_users: info.team_users,
        	team_code: info.team_code
        }
    }
}

export function receiveOnlineUsers(onlineUsers){
	return {
		type: 'RECEIVE_ONLINE_USERS',
		onlineUsers: onlineUsers
	}
}

export function loginInfo(info){
	console.log('info', info)
	return {
		type: 'RECEIVE_MAIN_INFO',
		spicedInfo: info[0],
		spicedChat: info[1],
		myRoomInfo: info[2],
		myRoomChat: info[3],
		privateUsers: info[4]
	}
}

export function receiveChatMessages(newChatMessages){
	console.log(newChatMessages)
	return {
		type: 'RECEIVE_CHAT_MESSAGES',
		messages: newChatMessages.messages,
		room: newChatMessages.room,
		subroom: newChatMessages.subroom
	}
}

export function newPrivateMessage(newMessage){
	return {
		type: 'NEW_MESSAGE',
		sender: newMessage.sender
	}
}








