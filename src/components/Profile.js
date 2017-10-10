import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import { receiveUserInfo } from '../actions';


class Profile extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			first: this.props.user.first,
			last: this.props.user.last,
			email: this.props.user.email,
			secret_code: this.props.user.code
		}
		this.input = this.input.bind(this);
		this.submit = this.submit.bind(this);
		this.upload = this.upload.bind(this);
		this.click = this.click.bind(this);
	}
	input(e){
		this.setState({
			[e.target.name]: e.target.value
		})
	}
	submit(){
		axios.post('/profileUpdate', {
			first: this.state.first,
			last: this.state.last,
			email: this.state.email,
			secret_code: this.state.secret_code
		}).then(resp => {
			console.log(resp.data)
			if(!resp.data.success){
				this.setState({
					error: true
				})
			}else if(resp.data.empty){
				this.setState({
					empty: true
				})
			}else{
				axios.get('/userinfo').then(resp => this.props.dispatch(receiveUserInfo(resp.data)));
				this.props.showProfile();
			}
		})
	}
	upload(e){
		var formData = new FormData();
		formData.append("file", document.querySelector('input[type="file"]').files[0]);
		axios.post('/uploadProfileImg', formData).then(resp => {
			if(resp.data.success){
				axios.get('/userinfo').then(resp => this.props.dispatch(receiveUserInfo(resp.data)))
			}
		})
	}
	click(e){
		e.stopPropagation();
	}
	render(){
		console.log(this.state)
		var img = this.props.user.img;
		if(!img){
			img = '/static/images/default_user.png';
		}
		return (
			<div className="profile-shadow" onClick={this.props.showProfile}>
				<div className="profile-cont" onClick={(e) => this.click(e)}>
					<label htmlFor="uploadFile"><img className="profile-img" src={img} /></label>
					<input className="profile-input" name="first" placeholder="First Name" value={this.state.first} onChange={this.input} />
					<input className="profile-input" name="last" placeholder="Last Name" value={this.state.last} onChange={this.input} />
					<input className="profile-input" name="email" placeholder="Email" value={this.state.email} onChange={this.input} />
					<input className="profile-input" name="secret_code" placeholder="Cohort Code" value={this.state.secret_code} type="password" onChange={this.input} />
					<button className="profile-btn" onClick={e => this.submit()}>CHANGE PROFILE</button>
					<input type="file" id="uploadFile" onChange={e => this.upload(e)} />
				</div>

			</div>
		)
	}
}

function mapStateToProps(state){
	return {
		user: state.user
	}
}

export default connect(mapStateToProps)(Profile)
