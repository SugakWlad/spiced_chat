import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import { receiveUserInfo } from '../actions';

import { Message } from './Message';


class DefaultChat extends React.Component{
	constructor(props) {
		super(props);
		this.addMessage = this.addMessage.bind(this)
	}
	addMessage(e){
		if(e.keyCode === 13 && e.target.value.length > 0){
			var message = e.target.value;
			e.target.value = '';
			var obj = {
				message: message,
				room: this.props.routeParams.room,
				subroom: this.props.routeParams.subroom
			}
			axios.post('/addMessage', obj);
		}
	}
	componentDidUpdate(){
		this.elem.scrollTop = this.elem.scrollHeight;
	}
	render(){
		console.log(this.props)
		var infoArr;
		if(this.props.params.room == 'spiced'){
			if(this.props.params.subroom == 'info'){
				infoArr = this.props.spicedInfo
			}else{
				infoArr = this.props.spicedChat
			}
		}else{
			if(this.props.params.subroom == 'info'){
				infoArr = this.props.myRoomInfo
			}else{
				infoArr = this.props.myRoomChat
			}
		}
		var onlineUsers = this.props.onlineUsers;
		return (
			<div>
				<div className="chat-cont" ref={elem => this.elem = elem}>
					{!!infoArr && infoArr.map(message => <Message img={message.image} first={message.first} last={message.last} message={message.message} id={message.id} onlineUsers={onlineUsers} team={message.team_name} />)}
				</div>
				<div className="input-cont">
					<textarea className="chat-input" id="chat-input" rows="1" placeholder="New message..." name="newComment"  onKeyDown={e => this.addMessage(e)}></textarea>
				</div>
			</div>
		)
	}
}

function mapStateToProps(state){
	return {
		spicedInfo: state.spicedInfo,
		spicedChat: state.spicedChat,
		myRoomInfo: state.myRoomInfo,
		myRoomChat: state.myRoomChat,
		onlineUsers: state.onlineUsers
	}
}

export default connect(mapStateToProps)(DefaultChat)





