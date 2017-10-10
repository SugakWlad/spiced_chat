import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';


export class TalkToSpiced extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			curentRecipient: 'Shilpa'
		}
		this.newRecipient = this.newRecipient.bind(this);
	}
	newRecipient(recipient){
		if(recipient == 'toShilpa'){
			this.setState({
				curentRecipient: 'Shilpa'
			})
		}else if(recipient == 'toStudents'){
			this.setState({
				curentRecipient: 'students'
			})
		}
	}
	render(){
		var shilpaStyle = {'background-color': 'gray'};
		var studentsStyle = {'background-color': 'gray'};
		if(this.state.curentRecipient == 'Shilpa'){
			shilpaStyle = {'background-color': 'green'};
		}else if(this.state.curentRecipient == 'students'){
			studentsStyle ={'background-color': 'green'}
		}
		return (
			<div>
				<h3>Here you can ask any questions to Shilpa Melissa Rodrigues (Director of Programs & Community) or our students</h3>
				<div>
					<p style={shilpaStyle} onClick={() => this.newRecipient('toShilpa')}>Shilpa</p>
					<p style={studentsStyle} onClick={() => this.newRecipient('toStudents')}>Students</p>
				</div>
				<div>
				
				</div>
			</div>
		)
	}
}






