import React from 'react';
import axios from 'axios';
import { Link } from 'react-router';

import { SmallUser } from './SmallUser'

export class Message extends React.Component{
	constructor(props) {
		super(props);
	}
	render(){
		var img;
		if(this.props.img){
			img = this.props.img
		}else{
			img = '/static/images/default_user.png'
		}
		return (
			<Link to={`/user/${this.props.id}`} className="message-link">
				<div className="single-message-cont">
					<SmallUser img={img} first={this.props.first} last={this.props.last} team={this.props.team} onlineUsers={this.props.onlineUsers} place='chat' id={this.props.id} />
					<pre>{this.props.message}</pre>
				</div>
			</Link>
		)
	}
}