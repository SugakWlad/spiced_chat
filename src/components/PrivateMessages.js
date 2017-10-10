import React from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Message } from './Message';


export class PrivateMessages extends React.Component{
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentDidMount() {
		axios.get(`/messagesWithUser/${this.props.routeParams.id}`).then(resp => {
			this.setState({
				messages: resp.data.userMessages
			})
		})
	}
	componentDidUpdate(){
		this.elem.scrollTop = this.elem.scrollHeight;
	}
	addMessage(e){
		if(e.keyCode === 13 && e.target.value.length > 0){
			var message = e.target.value;
			e.target.value = '';
			axios.post('/addPrivateMessage', {message: message, recipient: this.props.routeParams.id}).then(resp => {
				this.setState({
					messages: resp.data.userMessages
				})
			})
		}
	}
	render(){
		if(this.props.routeParams.id !== this.state.MessagesUserId){
			axios.get(`/messagesWithUser/${this.props.routeParams.id}`).then(resp => {
				this.setState({
					messages: resp.data.userMessages
				})
			})
			this.setState({
				MessagesUserId: this.props.routeParams.id
			})
		}
		if(this.props.newMessage){
			if(this.props.newMessage == this.props.routeParams.id){
				axios.get(`/messagesWithUser/${this.props.routeParams.id}`).then(resp => {
					this.setState({
						messages: resp.data.userMessages
					})
				})
			}
		}
		var onlineUsers = this.props.onlineUsers;
		var messages;
		if(this.state.messages){
			messages = this.state.messages;
		}
		return (
			<div>
				<div className="chat-cont" ref={elem => this.elem = elem}>
					{!!messages && messages.length == 0 && <h3 className="empty-messages">You haven't talk with this user yet.</h3>}
					{!!messages && !!onlineUsers && messages.map(message => <Message img={message.image} first={message.first} last={message.last} team={message.team_name} onlineUsers={onlineUsers} place='chat' id={message.id} message={message.message} />)}
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
		onlineUsers: state.onlineUsers,
		newMessage: state.newMessage
	}
}

export default connect(mapStateToProps)(PrivateMessages)








