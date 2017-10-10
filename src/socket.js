import * as io from 'socket.io-client'
import axios from 'axios'
import { store } from './start'
import { receiveOnlineUsers, receiveChatMessages, loginInfo, newPrivateMessage } from './actions'

let socket;
export default function getSocket(){
	if(!socket){
		socket = io.connect();
		socket.on('connect', function(){
			axios.get(`/connected/${socket.id}`);
		});
		socket.on('onlineUsers', function(onlineUsers){
			store.dispatch(receiveOnlineUsers(onlineUsers))
		})
		socket.on('newChatMessages', function(newChatMessages){
			store.dispatch(receiveChatMessages(newChatMessages));
		})
		socket.on('loginInfo', function(info){
			store.dispatch(loginInfo(info))
		})
		socket.on('newMessage', function(newMessage){
			store.dispatch(newPrivateMessage(newMessage));
		})
	}
	return socket;
}