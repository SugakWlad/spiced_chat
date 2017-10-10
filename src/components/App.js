import React from 'react';
import axios from 'axios';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { receiveUserInfo } from '../actions';

import { Search } from './Search';
import Profile from './Profile';
import { SmallUser } from './SmallUser';


class App extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			img: '/static/images/default_user.png',
			roomName: this.props.params.room,
			showResults: false,
			showUserBox: false,
			showProfile: false,
			menuMoved: false,
			transition: {'transform': 'translateX(0)'},
			curentUrl:''
		}
		this.toShowResults = this.toShowResults.bind(this);
		this.showUserBox = this.showUserBox.bind(this);
		this.logOut = this.logOut.bind(this);
		this.showProfile = this.showProfile.bind(this);
		this.moveLeftMenu = this.moveLeftMenu.bind(this);
	}
	componentDidMount() {
		axios.get('/userinfo').then(resp => {
			this.props.dispatch(receiveUserInfo(resp.data));
			axios.get(`/roomName/${this.props.user.code}`).then(resp => {
				var str = resp.data.room
				this.setState({
					roomName: str.charAt(0).toUpperCase() + str.substr(1),
				})
			})
		})
	}
	toShowResults(variant){
		if(variant){
			this.setState({
				showResults: true
			})
		}else{
			this.setState({
				showResults: false
			})
		}
	}
	showUserBox(){
		if(!this.state.showUserBox){
			this.setState({
				showUserBox: true
			})
		}else{
			this.setState({
				showUserBox: false
			})
		}
	}
	showProfile(){
		if(!this.state.showProfile){
			this.setState({
				showProfile: true,
				showUserBox: false
			})
		}else{
			this.setState({
				showProfile: false
			})
		}
	}
	logOut(){
		axios.get('/logout');
	}
	moveLeftMenu(){
		if(!this.state.menuMoved){
			this.setState({
				menuMoved: true,
				transition: {'transform': 'translateX(-251px)'}
			})
		}
		if(this.state.menuMoved){
			this.setState({
				menuMoved: false,
				transition: {'transform': 'translateX(0)'}
			})
		}
	}
	render(){
		if(this.state.curentUrl !== this.props.location.pathname){
			this.setState({
				curentUrl: this.props.location.pathname
			})
			if(this.props.params.room && this.state.otherUser){
				this.setState({
					otherUser: null
				})
			}
			if(this.props.params.id){
				axios.get(`/userInfo/${this.props.params.id}`).then(resp => {
					this.setState({
						otherUser: resp.data.user
					})
				})
			}
		}
		// if(this.props.params.room == 'spiced'){
		// 	if(this.props.params.subroom && this.props.params.subroom == 'info'){
		// 		this.setState({spicedInfoNew: {'background-color': 'white'}})
		// 	}else{
		// 		this.setState({spicedChatNew: {'background-color': 'white'}})
		// 	}
		// }
		// if(this.props.params.room && this.props.params.room !== 'spiced'){
		// 	if(this.props.params.subroom && this.props.params.subroom == 'info'){
		// 		this.setState({myRoomInfoNew: {'background-color': 'white'}})
		// 	}else{
		// 		this.setState({myRoomChatNew: {'background-color': 'white'}})
		// 	}
		// }
		var userInfo;
		var room = 'Spiced';
		if(this.props.params.room !== 'spiced'){
			room = this.state.roomName;
		}
		var userInfo;
		if(this.props.params.room){
			userInfo = <div className="helper-chat-name"><h3>{room}: {this.props.params.subroom}</h3></div>
		}
		var team = '';
		var userImg = this.state.img;
		if(this.props.user){
			if(this.props.user.img){
				userImg = this.props.user.img;
			}
			if(this.props.user.team){
				team = this.props.user.team.charAt(0).toUpperCase() + this.props.user.team.substr(1)
			}
		}
		const children = React.cloneElement(this.props.children, {});
		var otherUser = this.state.otherUser;
		console.log(this.props.privateUsers)
		return (
			<div className="app">
				<div className="app-left">
					<div className="helper">
						{userInfo}
						{!!otherUser && this.props.onlineUsers && <div style={{'padding-top': '10px'}}><SmallUser id={otherUser.id} img={otherUser.image} first={otherUser.first} last={otherUser.last} team={otherUser.team_name} onlineUsers={this.props.onlineUsers} place='search' /></div>}
					</div>
					<div className="chats" style={this.state.transition}>
						<div>
							<h3 onClick={this.moveLeftMenu} className="chats-messages">Private messages</h3>
						</div>
						<div className="room">
							<h3>Spiced</h3>
							<Link to="/room/spiced/info" className="white-links"><div style={this.props.spicedInfoNew}> - info</div></Link>
							<Link to="/room/spiced/chat" className="white-links"><div style={this.props.spicedChatNew}> - chat</div></Link>
						</div>
						<div className="room">
							<h3>{team}</h3>
							{!!this.props.user && <Link to={`/room/${this.props.user.team_code}/info`} className="white-links"><div style={this.props.myRoomInfoNew}> - info</div></Link>}
							{!!this.props.user && <Link to={`/room/${this.props.user.team_code}/chat`} className="white-links"><div style={this.props.myRoomChatNew}> - chat</div></Link>}
						</div>
					</div>
					<div className="messages" style={this.state.transition}>
						<h3 onClick={this.moveLeftMenu} className="chats-messages">Return to Chats</h3>
						<div>
							{!!this.props.privateUsers && this.props.privateUsers.map(user => <Link to={`/user/${user.id}`} className="search-link"><SmallUser img={user.image} first={user.first} last={user.last} team={user.message} onlineUsers={this.props.onlineUsers} place='messages' id={user.id} /></Link>)}
						</div>
					</div>
				</div>
				<div className="app-cont">
					<div className="header">
						<div></div>
						<div>
							<img className="header-img" src="/static/images/logo.png" />
						</div>
						<div className="header-search">
							<div className="search">
								<Search onlineUsers={this.props.onlineUsers} toShowResults={(variant) => this.toShowResults(variant)} showResults={this.state.showResults}/>
							</div>
							<div>
								<img className="header-user-img" src={userImg} onClick={this.showUserBox} />
							</div>
						</div>
					</div>
					<div className="app-chat-cont">
						{children}
					</div>
				</div>
				{!!this.state.showUserBox && <div className="user-box">
					<p className="user-box-p" onClick={this.showProfile}>Profile</p>
					<p onClick={this.logOut}>Logout</p>
				</div>}
				{!!this.state.showProfile && <Profile user={this.props.user} showProfile={(e) => this.showProfile(e)} />}
			</div>
		)
	}
}





function mapStateToProps(state){
	return {
		user: state.user,
		onlineUsers: state.onlineUsers,
		privateUsers: state.privateUsers,
		spicedInfoNew: state.spicedInfoNew,
		spicedChatNew: state.spicedChatNew,
		myRoomInfoNew: state.myRoomInfoNew,
		myRoomChatNew: state.myRoomChatNew
	}
}

export default connect(mapStateToProps)(App)



