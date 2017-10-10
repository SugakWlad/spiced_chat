import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';

export class Welcome extends React.Component{
	constructor(props) {
		super(props);
	}
	render(){
		return (
			<div id="not-login-cont">
				<img id="welcome-img" src="/static/images/welcome.jpg" />
				<div className="welcome-header">
					<div>
						<Link to="https://www.spiced-academy.com/"><img className="welcome-img" src="/static/images/logo.png" /></Link>
					</div>
					<div className="welcome-links-cont">
						<Link to="/somewhere" className="welcome-links">Programs</Link>
						<Link to="/somewhere" className="welcome-links">About us</Link>
						<Link to="/somewhere" className="welcome-links">Alumni</Link>
						<Link to="/somewhere" className="welcome-links">Outcomes</Link>
						<Link to="/somewhere" className="welcome-links">FAQ</Link>
						<Link to="/somewhere" className="welcome-links">Blog</Link>
						<Link to="/talktospiced" className="welcome-links">Chat</Link>
					</div>
				</div>
				{this.props.children}
			</div>
		)
	}
}

class AuthForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			first: '',
			last: '',
			email: '',
			password: '',
			secret_code: ''
		};
		this.input = this.input.bind(this);
	}
	input(e){
		this.setState({
			[e.target.name]: e.target.value
		})
	}
	submit(){
		axios.post(this.props.url, {
			first: this.state.first,
			last: this.state.last,
			email: this.state.email,
			secret_code: this.state.secret_code,
			password: this.state.password
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
				location.replace(`/room/${resp.data.url}/info`);
			}
		})
	}
	render(){
		const Component = this.props.component;
		return <Component empty={this.state.empty} input={e => this.input(e)} submit={e => this.submit()} />;
	}
}

function RegistrationForm({ input, submit, empty, error }){
	return (
    	<div className="log-reg-form">
    		<h1>If you're a spicy enough, join us!</h1>
    		{error && <div className="error">Something is wrong, try again.</div>}
    		{empty && <div className="empty">Please fill all field in.</div>}
        	<input name="first" placeholder="First Name" className="welcome-input" onChange={input} />
        	<input name="last" placeholder="Last Name" className="welcome-input" onChange={input} />
        	<input name="email" placeholder="Email" className="welcome-input" onChange={input} />
        	<input name="secret_code" placeholder="Cohorts code" className="welcome-input" onChange={input} />
        	<input name="password" placeholder="Password" type="password" className="welcome-input" onChange={input} />
        	<button onClick={e => submit()} className="welcome-button">SUBMIT</button>
        	<p>Already a member? <Link to="/login" className="reg-log-link">Log in</Link></p>
        </div>						
    );
}

function LoginForm({ input, submit, empty, error }){
	return (
    	<div className="log-reg-form" id="login-form1">
    		<h1>We already know your spiciness...</h1>
    		{error && <div className="error">Something is wrong, try again.</div>}
    		{empty && <div className="empty">Please fill all field in.</div>}
        	<input name="email" placeholder="Email" className="welcome-input" id="login-form2" onChange={input} />
        	<input name="password" placeholder="Password" type="password" className="welcome-input" onChange={input} />
        	<button onClick={e => submit()} className="welcome-button">LOGIN</button>
        	<p>Do not have an account? <Link to="/registration" className="reg-log-link">Register now!</Link></p>
        </div>						
    );
}

export function Registration() {
    return <AuthForm component={RegistrationForm} url="/register" />;
}

export function Login() {
    return <AuthForm component={LoginForm} url="/login" />;
}