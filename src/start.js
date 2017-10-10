import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import reduxPromise from 'redux-promise';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import reducer from './reducers';

import getSocket from './socket';

import { Welcome, Registration, Login } from './components/WelcomePage';
import { TalkToSpiced } from './components/TalkToSpiced';
import App from './components/App';
import DefaultChat from './components/DefaultChat';
import PrivateMessages from './components/PrivateMessages';


export const store = createStore(reducer, applyMiddleware(reduxPromise));

getSocket();


const logOutRouter = (
    <Router history={hashHistory}>
        <Route path="/" component={Welcome}>
            <IndexRoute component={Registration} />
            <Route path="/login" component={Login} />
            <Route path="/registration" component={Registration} />
	  		<Route path="/talktospiced" component={TalkToSpiced} />
  		</Route>
    </Router>
);

const logInRouter = (
	<Provider store = {store}>
	    <Router history={browserHistory}>
	        <Route path="/" component={App}>
	        	<Route path="room/:room/:subroom" component={DefaultChat} />
	        	<Route path="user/:id" component={PrivateMessages} />
	  		</Route>
	    </Router>
	</Provider>
);

var router;
if(location.pathname == '/welcome'){
	router = logOutRouter;
}else{
	router = logInRouter;
}

ReactDOM.render(
    router,
    document.querySelector('main')
);






