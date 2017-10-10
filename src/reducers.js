export default function (state = {}, action) {
    if(action.type == 'RECEIVE_USER_INFO'){
        state = Object.assign({}, state, {
            user: action.user
        });
    }
    if(action.type == 'RECEIVE_ONLINE_USERS'){
    	state = Object.assign({}, state, {
    		onlineUsers: action.onlineUsers
    	});
    }
    if(action.type == 'RECEIVE_MAIN_INFO'){
    	state = Object.assign({}, state, {
			spicedInfo: action.spicedInfo,
			spicedChat: action.spicedChat,
			myRoomInfo: action.myRoomInfo,
			myRoomChat: action.myRoomChat,
			privateUsers: action.privateUsers
    	});
    }
    if(action.type == 'RECEIVE_CHAT_MESSAGES'){
    	console.log('here')
    	if(action.room == 'spiced'){
			if(action.subroom == 'info'){
				state = Object.assign({}, state, {
					spicedInfo: action.messages,
					spicedInfoNew: {'background-color': 'rgb(255, 105, 0)'}
		    	});
			}else{
				state = Object.assign({}, state, {
					spicedChat: action.messages,
					spicedChatNew: {'background-color': 'rgb(255, 105, 0)'}
		    	});
			}
		}else{
			if(action.subroom == 'info'){
				state = Object.assign({}, state, {
					myRoomInfo: action.messages,
					myRoomInfoNew: {'background-color': 'rgb(255, 105, 0)'}
		    	});
			}else{
				state = Object.assign({}, state, {
					myRoomChat: action.messages,
					myRoomChatNew: {'background-color': 'rgb(255, 105, 0)'}
		    	});
			}
		}
    }
    if(action.type == 'NEW_MESSAGE'){
		state = Object.assign({}, state, {
			newMessage: action.sender
    	});
    }
    return state;
}



