import React from 'react';
import axios from 'axios';
import { Link } from 'react-router';

import { SmallUser } from './SmallUser'

export class Search extends React.Component{
	constructor(props) {
		super(props);
		this.state = {}
		this.search = this.search.bind(this);
	}
	search(e){
		var str = e.target.value.trim()
		if(str == ''){
			this.props.toShowResults(false);
		}else{
			this.props.toShowResults(true);
		}
		if(str !== ''){
			axios.post('/search', {data: str}).then(resp => this.setState({
					searchResults: resp.data.data
				})
			)
		}else{
			this.setState({
				searchResults: null
			})
		}
	}
	render(){
		return (
			<div>
				<div>
					<input className="search-input" placeholder="Search" onChange={(e) => this.search(e)} ></input>
				</div>
				{this.props.showResults && <div className="right-search">
					<div className="search-results-users">
						<p className="search-results-header">Users:</p>
						{!!this.state.searchResults && this.state.searchResults !== null && this.state.searchResults[0].map(user => <Link to={`/user/${user.id}`} className="search-link"><SmallUser img={user.image} first={user.first} last={user.last} team={user.team_name} place={'search'} onlineUsers={this.props.onlineUsers} id={user.id} /></Link>)}
					</div>
					<div className="search-results-teams">
						<p className="search-results-header">Teams:</p>
						{!!this.state.searchResults && this.state.searchResults !== null && this.state.searchResults[1].map(user => <Link to={`/user/${user.id}`} className="search-link"><SmallUser img={user.image} first={user.first} last={user.last} team={user.team_name} place={'search'} onlineUsers={this.props.onlineUsers} id={user.id} /></Link>)}
					</div>
				</div>}
			</div>
		)
	}
}







