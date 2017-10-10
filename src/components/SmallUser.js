import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';

export function SmallUser({ id, img, first, last, team, onlineUsers, place }){
	if(!img){
		img = '/static/images/default_user.png'
	}
	var isOnline = {'background-color': 'red'}
	onlineUsers.forEach(function(elem){
		if(elem.id == id){
			isOnline = {'background-color': 'green'}
		}
	})
	var userText;
	var userCont;
	var userImg;
	if(place == 'chat'){
		userCont = 'chat-user-cont';
		userText = 'chat-user-text';
		userImg = 'chat-user-img';
	}
	if(place == 'search'){
		userCont = 'search-user-cont';
		userText = 'search-user-text';
		userImg = 'search-user-img';
	}
	if(place == 'messages'){
		userCont = 'chat-user-cont';
		userText = 'messages-user-text';
		userImg = 'chat-user-img';
	}
	return (
		<div className={userCont}>
			<div>
				<img className={userImg} src={img} />
			</div>
			<div className={userText}>
				<h3>{first} {last}</h3>
				<p>{team}</p>
			</div>
			<div className="is-online" style={isOnline}></div>
		</div>
	)	
}