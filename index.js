const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const router = express.Router();

const bodyParser = require('body-parser');
const secrets = require('./secrets.json');
const spicedPg = require('spiced-pg');
const db = spicedPg(secrets.db);

const bcrypt = require('bcryptjs');
const compression = require('compression');
const session = require('express-session');
const Store = require('connect-redis')(session);
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const fs = require('fs');

const knox = require('knox');

app.use(session({
    store: new Store({
        ttl: 3600,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: secrets.secret
}));

app.use(bodyParser.json());
app.use(compression());
app.use("/static", express.static(__dirname + '/public'))

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'spicedling'
});

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
      uidSafe(24).then(function(uid) {
          callback(null, uid + path.extname(file.originalname));
      });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

if (process.env.NODE_ENV != 'production') {
    app.use(require('./build'));
}

var onlineUsers = [];

io.on('connection', function(socket) {
    socket.on('disconnect', function() {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
        getUsersByIdDb(onlineUsers.map(user => user.userId)).then(function(users){
        	console.log('disconnect', onlineUsers)
			io.sockets.emit('onlineUsers', users)
		}).catch(function(err){
			console.log('CONNECTED/SOCKETID', err.stack)
		})
    });
});

app.get('/connected/:socketId', function(req, res){
	if(req.session.user){
		const userId = req.session.user.id;
		const userCode = req.session.user.code;
		const socketId = req.params.socketId;
		const userIsOnline = onlineUsers.find(user => user.userId == userId);
		const socketIsOnline = onlineUsers.find(user => user.socketId == socketId);
		if(!socketIsOnline && io.sockets.sockets[socketId]){
			onlineUsers.push({
				socketId: socketId,
				userId: userId,
				userCode: userCode
			})
			console.log('connect', onlineUsers)
			getUsersByIdDb(onlineUsers.map(user => user.userId)).then(function(users){
				io.sockets.emit('onlineUsers', users)
			}).catch(function(err){
				console.log('CONNECTED/SOCKETID', err.stack)
			})
			Promise.all([
				getChatMessages('spiced', 'info'),
				getChatMessages('spiced', 'chat'),
				getChatMessages(userCode, 'info'),
				getChatMessages(userCode, 'chat'),
				getPrivateMessagesFriendsInfoDb(req.session.user.id)
			]).then(function(results){
				io.sockets.sockets[socketId].emit('loginInfo', results);
			}).catch(function(err){
				console.log('Promise.all', err.stack)
			})
		}
	}
})

app.get('/welcome', function(req, res){
	if(req.session.user){
		return res.redirect('/');
	}
	res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res){
	if(!req.session.user){
		return res.redirect('/welcome');
	}
	res.sendFile(__dirname + '/index.html');
});

app.post('/register', function(req, res){
	if(req.body.first == '' || req.body.last == '' || req.body.email == '' || req.body.password == '' || req.body.secret_code == ''){
		res.send({
			empty: true
		});
	}else{
		checkTeam(req.body.secret_code).then(function(result){
			if(!result){
				console.log('not result', result)
				res.send({
					success:false
				})
				return;
			}
			registration(req).then(function(user){
				req.session.user = {
					id: user.id,
					code: req.body.secret_code
				}
				res.send({
					success: true,
					url: req.body.secret_code
				})
			}).catch(function(err){
				console.log(err.stack);
				res.send({
					success: false
				})
			})
		})
	}
})

app.post('/login', function(req, res){
	if(req.body.email == '' || req.body.password == ''){
		res.send({
			empty: true
		});
	}else{
		login(req).then(function(result){
			if(result){
				res.send({
					success: true,
					url: result
				})
			}else{
				res.send({
					success: false
				})
			}
		}).catch(function(err){
			console.log(err)
			res.send({
				success: false
			})
		})
	}
})

app.get('/userinfo', function(req, res){
	getUserInfoDb(req.session.user.id).then(function(user){
		getUserTeam(user.secret_code).then(function(team){
			getTeamUsers(team.secret_code).then(function(users){
				if(user.image){
			        var imageUrl = user.image;
		    	}else{
		    		var imageUrl = null;
		    	}
		        res.send({
		            success: true,
		            first: user.first,
		            last: user.last,
		            image: imageUrl,
		            email: user.email,
		            code: user.secret_code,
		            team: team.team_name,
		            team_img: team.image,
		            team_users: users,
		            team_code: user.secret_code
		        });
			})
		})
    }).catch(function(err){
        console.log('/userInfo', err.stack);
        res.send({
            success: false
        })
	})
})

app.post('/addMessage', function(req, res){
	setChatMessage(req.session.user.id, req.body.room, req.body.subroom, req.body.message).then(function(){
		getChatMessages(req.body.room, req.body.subroom).then(function(messages){
			if(req.body.room == 'spiced'){
				io.sockets.emit('newChatMessages', {messages: messages, room:req.body.room, subroom: req.body.subroom});
				return;
			}else{
				onlineUsers.forEach(function(user){
					if(user.userCode == req.session.user.code){
						io.sockets.sockets[user.socketId].emit('newChatMessages', {messages: messages, room: req.body.room, subroom: req.body.subroom})
					}
				})
			}
		}).catch(function(err){
			console.log('/setMessage', err.stack);
		})
	})	
})

app.post('/search', function(req, res){
	Promise.all([
		getSearchUsers(req.body.data),
		getSearchTeams(req.body.data)
	]).then(function(data){
		res.send({
			success: true,
			data: data
		})
	})
})

app.get('/logout', function(req, res){
	req.session.destroy(function(err){
		if(err){
			console.log('logout', err);
		}
		res.redirect('/registration');
		res.send({
			success: true
		})
	})
})

app.post('/uploadProfileImg', uploader.single('file'), setToAWS, function(req, res){
    setUserImageDb(req.session.user.id, req.file.filename).then(function(result){
        res.send({
            success: true
        })
    })
})

app.post('/profileUpdate', function(req, res){
	profileUpdate(req.body.first, req.body.last, req.body.email, req.body.secret_code, req.session.user.id).then(function(){
		res.send({
			success: true
		})
	}).catch(function(err){
			console.log('/profileUpdate', err.stack);
	})
})

app.get('/messagesWithUser/:id', function(req, res){
	getPrivateMessagesWithUser(req.params.id, req.session.user.id).then(function(messages){
		res.json({
			success: true,
			userMessages: messages
		})
	}).catch(function(err){
		console.log('getPrivateMessagesWithUser', err.stack);
	})
})

app.post('/addPrivateMessage', function(req, res){
	setPrivateMessagesWithUser(req.session.user.id, req.body.recipient, req.body.message).then(function(){
		getPrivateMessagesWithUser(req.body.recipient, req.session.user.id).then(function(result){
			var socketId;
			onlineUsers.forEach(elem => {
				if(elem.userId == req.body.recipient){
					socketId = elem.socketId
				}
			})
			if(socketId){
				var sender = {
					sender: req.session.user.id
				}
				io.sockets.sockets[socketId].emit('newMessage', sender);
			}
			res.json({
				success: true,
				userMessages: result
			})
		})
	}).catch(function(err){
		console.log('addPrivateMessage', err.stack);
	})
})

app.get('/roomName/:room', function(req, res){
	checkTeam(req.params.room).then(function(result){
		res.send({
			room: result.team_name
		})
	}).catch(function(err){
		console.log('roomName', err.stack);
	})
})

app.get('/userInfo/:id', function(req, res){
	getOtherUserInfo(req.params.id).then(function(user){
		res.send({
			user: user
		})
	}).catch(function(err){
		console.log('userInfo/user', err.stack);
	})
})








app.get('*', function(req, res) {
    if(!req.session.user){
        return res.redirect('/welcome');
    }
    res.sendFile(__dirname + '/index.html');  
});

server.listen(8080, function() {
    console.log("I'm listening.")
});

function checkTeam(code){
	return db.query('SELECT team_name FROM teams WHERE secret_code = $1', [code]).then(function(result){
		console.log(result.rows[0])
		return result.rows[0];
	})
}

function registration(req){
	console.log('in registration')
	return hashPassword(req.body.password).then(function(password){
		var dataArr = [toCapitalLetter(req.body.first), toCapitalLetter(req.body.last), req.body.email, password, req.body.secret_code];
		return registrationDb(dataArr);
	}).catch(function(err){
		console.log('registration', err.stack);
	})
}

function login(req){
	return loginDb(req.body.email).then(function(user){
		return checkPassword(req.body.password, user.password).then(function(doesMatch){
			if(doesMatch){
				req.session.user = {
					id: user.id,
					code: user.secret_code
				}
				return user.secret_code;
			}else{
				return false;
			}
        }).catch(function(err){
            console.log('login', err.stack);
            return false;
        })
    })
}

function registrationDb(arr){
    return db.query('INSERT INTO users (first, last, email, password, secret_code) VALUES ($1, $2, $3, $4, $5) RETURNING (id)', arr).then(function(results){
        return results.rows[0];
    }).catch(function(err){
		console.log('registrationDb', err.stack);
	})
}

function loginDb(email){
    return db.query('SELECT id, password, secret_code FROM users WHERE email = $1', [email]).then(function(results){
        return results.rows[0];
    }).catch(function(err){
		console.log('loginDb', err.stack);
		return false;
	})
}

function getUserInfoDb(id){
	return db.query('SELECT id, first, last, image, email, secret_code FROM users WHERE id = $1', [id]).then(function(user){
		user.rows[0].image = mkUrl(user.rows[0].image);
		return user.rows[0];
	}).catch(function(err){
		console.log('getUserInfoDb', err.stack);
	})
}

function getUsersByIdDb(ids){
	return db.query('SELECT id FROM users WHERE id = ANY($1)', [ids]).then(function(result){
		return result.rows;
	}).catch(function(err){
		console.log('GETUSERBYIDDB', err.stack)
	})
}

function getUserTeam(code){
	return db.query('SELECT team_name, image, secret_code FROM teams WHERE secret_code = $1', [code]).then(function(team){
		team.rows[0].image = mkUrl(team.rows[0].image);
		return team.rows[0];
	}).catch(function(err){
		console.log('getUserTeam', err.stack);
	})
}

function getTeamUsers(code){
	return db.query('SELECT first, last, image FROM users WHERE secret_code = $1', [code]).then(function(users){
		users.rows.map(function(obj){
			obj.image = mkUrl(obj.image)
		})
		return users.rows;
	}).catch(function(err){
		console.log('getTeamUsers', err.stack);
	})
}

function setChatMessage(id, room, subroom, message){
	return db.query('INSERT INTO messages (user_id, room, subroom, message) VALUES ($1, $2, $3, $4)', [id, room, subroom, message]).catch(function(err){
		console.log('setChatMessage', err.stack);
	})
}

function getChatMessages(room, subroom){
	return db.query(`SELECT users.first, users.last, users.image, users.id, messages.message, messages.message_time, teams.team_name
					 FROM messages
					 JOIN users
					 ON messages.user_id = users.id
					 JOIN teams
					 ON users.secret_code = teams.secret_code
					 WHERE messages.room = $1 AND messages.subroom = $2 ORDER BY messages.message_time ASC`, [room, subroom]).then(function(chatMessages){
		chatMessages.rows.map(function(obj){
			obj.image = mkUrl(obj.image)
		})
	 	return chatMessages.rows;
	}).catch(function(err){
		console.log('getChatMessages', err.stack);
	})
}

function getSearchUsers(str){
	str = '%' + str + '%';
	return db.query(`SELECT users.image, users.first, users.last, users.id, teams.team_name 
					 FROM users 
					 JOIN teams 
					 ON users.secret_code = teams.secret_code 
					 WHERE (users.first LIKE $1) OR (users.last LIKE $1)`, [str]).then(function(result){
		result.rows.map(function(obj){
			obj.image = mkUrl(obj.image)
		})
	 	return result.rows;
	}).catch(function(err){
		console.log('getSearchUsers', err.stack);
	})
}

function getSearchTeams(str){
	str = '%' + str + '%';
	return db.query(`SELECT users.image, users.first, users.last, users.id, teams.team_name 
					 FROM users 
					 JOIN teams 
					 ON users.secret_code = teams.secret_code 
					 WHERE teams.team_name LIKE $1`, [str]).then(function(result){
		result.rows.map(function(obj){
			obj.image = mkUrl(obj.image)
		})
	 	return result.rows;
	}).catch(function(err){
		console.log('getSearchTeams', err.stack);
	})
}

function setUserImageDb(id, file){
    return db.query('UPDATE users SET image = $2 WHERE id = $1', [id, file]);
}

function profileUpdate(first, last, email, code, id){
	return db.query('UPDATE users SET first = $1, last = $2, email = $3, secret_code = $4 WHERE id = $5', [first, last, email, code, id]);
}

function getPrivateMessagesFriendsInfoDb(id){
	return db.query(`SELECT users.id, users.first, users.last, users.image, private_messages.message
					 FROM private_messages 
					 JOIN users 
					 ON (private_messages.sender_id = $1 AND users.id = private_messages.recipient_id) 
					 OR (private_messages.recipient_id = $1 AND users.id = private_messages.sender_id)
					 ORDER BY message_time DESC`, [id]).then(function(result){
		var array = result.rows;
		var newArray = [];
		for(var i = 0; i < array.length; i++){
			if(!newArray.find(elem => elem.id == array[i].id)){
				array[i].image = mkUrl(array[i].image);
				newArray.push(array[i]);
			}
		}
		return newArray;
	})
}

function setPrivateMessagesWithUser(sender, recipient, message){
	return db.query('INSERT INTO private_messages (sender_id, recipient_id, message) VALUES ($1, $2, $3)', [sender, recipient, message]);
}

function getPrivateMessagesWithUser(first, second){
	return db.query(`SELECT users.id, users.first, users.last, users.image, private_messages.message, private_messages.sender_id, private_messages.recipient_id, teams.team_name
					 FROM private_messages 
					 JOIN users 
					 ON (private_messages.sender_id = $1 AND private_messages.recipient_id = $2 AND users.id = private_messages.sender_id) 
					 OR (private_messages.recipient_id = $1 AND private_messages.sender_id = $2 AND users.id = private_messages.sender_id)
					 JOIN teams
					 ON (users.secret_code = teams.secret_code)
					 ORDER BY message_time DESC`, [first, second]).then(function(result){
	 	var arr = [];
	 	result.rows.forEach(function(message){
			message.image = mkUrl(message.image)
			arr.unshift(message);
		})
		return arr;
	})
}

function getOtherUserInfo(id){
	return db.query(`SELECT users.id, users.first, users.last, users.image, teams.team_name
					 FROM users
					 JOIN teams
					 ON users.secret_code = teams.secret_code
					 WHERE users.id = $1`, [id]).then(function(user){
		user.rows[0].image = mkUrl(user.rows[0].image);
		return user.rows[0];
	})
}











function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
}

function toCapitalLetter(str){
	return str.charAt(0).toUpperCase() + str.substr(1);
}

function mkUrl(data){
	if(data){
	    return data = secrets.s3Url + data;
	}else{
		return null;
	}
}

function setToAWS(req, res, next){
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        if(wasSuccessful){
            next();
        }
    });
}







