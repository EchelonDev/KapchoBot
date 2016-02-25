exports.commands = [
	"kick"
]

var votekicks = {};

function usersOnline(server){
	var online = 0;
	for(var i = 0; i < server.members.length; i++){
		if(server.members[i].status != 'offline') online += 1;
	}
	return online;
}

function resolveUser(msgContext,usertxt){
	var userid = usertxt;
	if(usertxt.startsWith('<@')){
		userid = usertxt.substr(2,usertxt.length-3);
	}
	var user = msg.channel.server.members.get("id",userid);
	if(!user){
		var users = msg.channel.server.members.getAll("username",usertxt);
		if(users.length == 1){
			user = users[0];
		}
	}
	return user;
}

exports.myid = {
	description: "Gönderen kişinin id'sini verir.",
	process: function(bot,msg){bot.sendMessage(msg.channel,msg.author.id);}
}

exports.perm = {
	usage: "[user]",
	description: "Kişinin kanaldaki perm derecesini verir.",
	process: function(bot,msg,suffix) {
		var user = resolveUser(msg,suffix);
		if(!user){
			user = msg.author;
		}
		bot.sendMessage(msg.channel,"permissions of " + user + ':\n' + JSON.stringify(msg.channel.permissionsOf(user).serialize(),null,2));
	}
}

exports.votekick = {
	usage: "<user|user id>",
	description: "Kişiyi kickleme oylaması. Çoğunluk oya ihtiyaç duyar, ve en az 2 kişiye ihtiyaç vardır.",
	process: function(bot,msg,suffix) {
		if(suffix){
			//first check if the bot can kick
			if(!msg.channel.permissionsOf(bot.user).hasPermission("kickMembers")){
				bot.sendMessage(msg.channel, "Ama , ama ben kimseyi kickleyemem ki!");
				return;
			}
			var vote = function(user){
				if(votekicks.hasOwnProperty(user.id)){
					var votes = votekicks[user.id];
					votes.count += 1;
					if(votes.voters.indexOf(msg.author.id) > -1){
						bot.sendMessage(msg.channel,msg.author + " sadece bir kere oy verebilirsiniz.");
						return;
					}
					votes.voters.push(msg.author.id);
					if(votes.count > usersOnline(msg.channel.server)/2){
						bot.sendMessage(msg.channel,"Oylama Başarılı!\n" + user + " adlı kullanıcı " + msg.channel.server + " kanalından kicklendi!",
							function() {
								bot.kickMember(users[0],msg.channel.server);
						});
					}
				} else {
					votekicks[user.id] = { count:1, voters:[msg.author.id]};
					bot.sendMessage(msg.channel,user + " kişisi için kick oylaması başladı!");
				}
			};
			if(suffix.startsWith("<@")){
				suffix = suffix.substr(2,suffix.length-3);
			}
			var user = msg.channel.server.members.get("id",suffix);
			if(user){
				vote(user);
				return;
			}
			var users = msg.channel.server.members.getAll("username",suffix);
			if(users.length > 1){
				bot.sendMessage(msg.channel,"Birden fazla kişi bulundu " + suffix + "!")
			} else if(users.length == 1){
				vote(users[0]);
			} else {
				bot.sendMessage(msg.channel,"Kişiyi bulamadım " + suffix);
			}
		} else {
			bot.sendMessage(msg.channel,"Kimi kickleyecez onu da söyleyeydin ?");
		}
	}
}

exports.kick = {
	usage: "<user>",
	description: "Birini kickleyin. (Hem bota hemde kullanıcıya yetki gerektirir)",
	process: function(bot,msg,suffix) {
		if(suffix){
			//first check if the bot can kick
			if(!msg.channel.permissionsOf(bot.user).hasPermission("kickMembers")){
				bot.sendMessage(msg.channel, "Ama , ama ben kimseyi kickleyemem ki!");
				return;
			}
			//now check if the user can kick
			if(!msg.channel.permissionsOf(msg.author).hasPermission("kickMembers")){
				bot.sendMessage(msg.channel, "Adminlik alda gel!");
				return;
			}
			var users = msg.channel.server.members.getAll("username",suffix);
			if(users.length > 1){
				bot.sendMessage(msg.channel,"Birden fazla kişi bulundu " + suffix + "!")
			} else if(users.length == 1){
				bot.sendMessage(msg.channel, users[0] + " adlı kişi " + msg.channel.server + " den kicklendi!",
				function() {
					bot.kickMember(users[0],msg.channel.server);
				});
			} else {
				bot.sendMessage(msg.channel,"Kişiyi bulamadım " + suffix);
			}
		} else {
			bot.sendMessage(msg.channel,"Kimi kickleyecez onu da söyleyeydin ?");
		}
	}
}

exports.bans = {
	description: "Serverden banlanmış kişi listesini getirir.",
	process: function(bot,msg,suffix){
		bot.getBans(msg.channel.server,function(error,users){
			if(users.length == 0){
				bot.sendMessage(msg.channel,"Olley be, daha kimse banlanmamış !");
			} else {
				var response = "Banlı kişiler:";
				for(var user in users){
					response += "\n" + user.username;
				}
				bot.sendMessage(msg.channel,response);
			}
		});
	}
}

exports.ban = {
	usage: "<kişi> [x günlük mesajlarını sil]",
	description: "kişiyi banlar, son x günlük mesajlarınıda silebilir.",
	process: function(bot,msg,suffix){
		var args = suffix.split(' ');
		var usertxt = args.shift();
		var days = args.shift();
		var user = resolveUser(msg,usertxt);
		if(user){
			bot.banMember(user,msg.server,days,function(){
				bot.sendMessage(msg.channel, user + " banlandı id:" + user.id);
			});
		} else {
			bot.sendMessage(msg.channel,"bir sorun oluştu " + usertxt);
		}
	}
}

exports.unban = {
	usage: "<kişi>",
	description: "kişinin banını kaldırır.",
	process: function(bot,msg,suffix){
		var args = suffix.split(' ');
		var usertxt = args.shift();
		var days = args.shift();
		var user = resolveUser(msg,usertxt);
		if(user){
			bot.unbanMember(user,msg.server);
		} else {
			bot.sendMessage("bir sorun oluştu " + usertxt);
		}
	}
}
