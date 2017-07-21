			var express = require('express');
			var mysql=require('mysql');
			var md5 = require('md5');	
			var app  = express();
			
			app.set('view engine', 'ejs');

			var upload=require('express-fileupload');
			var nodemailer=require('nodemailer');
			var http=require('http').Server(app);
			var io=require('socket.io')(http);
			app.use(upload()); //for file upload -- html form file upload imp
			app.use('/public', express.static('vendors'));  // for static js ,css, image file path --use public/
			http.listen(3000);

			app.get('/',function(req,res){
				res.render('index');
			});

			app.post('/start_newgame',function(req,res){

				var name=req.body.username;
				var color=req.body.color;
				res.render('chess',{user:name,color:color});
			});
			
			app.post('/join_game',function(req,res){
				var name=req.body.username;
				var room=req.body.room;
				res.render('chess',{user:name,existroom:room});
			});

	
			io.on('connection', function(socket){
				console.log('socket started');
				
				
				socket.on('newuser', function(username,room,color){
							socket.join(room);
							socket.username=username;
							socket.myroom=room;
							socket.mycolor=color;

							var num=io.sockets.adapter.rooms[socket.myroom].length;
							//console.log(num);	
							if((num>2))
							 {
							 		io.to(socket.myroom).emit('leave_this_user',username);
							 }
							 else
							 {

								console.log(io.sockets.adapter.rooms);

								io.to(socket.myroom).emit('showmsg',socket.username);
							}
							
				});
					socket.on('joinuser', function(username,room){
							socket.join(room);
							socket.username=username;
							socket.myroom=room;
							var num=io.sockets.adapter.rooms[room].length;
							//console.log(num);	
							if((num==1)||(num>2))
							 {
							 		io.to(socket.myroom).emit('leave_this_user',username);
							 }
							 else
							 {
								
								// i am 2nd player
								console.log(io.sockets.adapter.rooms[socket.myroom]);
								//console.log('num:'+io.sockets.adapter.rooms[socket.myroom].length);
								
								io.to(socket.myroom).emit('showmsg',socket.username);
							}
							
				});
				// Called when the client calls socket.emit('move')
				socket.on('move', function(username,room,msg) {
					console.log('move:'+msg);
					console.log('move user:'+socket.username);
				    io.to(socket.myroom).emit('move',socket.username,msg);
				});
				socket.on('disconnect', function(){
		 	 		console.log(' disconnected');
		 		 });
			});