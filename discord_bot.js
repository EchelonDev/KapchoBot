// <Logger> {
var log4js = require('log4js');
log4js.replaceConsole();
var logger = log4js.getLogger('cheese');
//}
// <Variables> {
var afkList         = {},
    alias           = {},
    version         = "1.1.9dev",
    banned          = {},
    ChangeBot       = {},
    Config          = {},
    developers      = {},
    gameList        = {},
    jsonFolder      = './json/',
    messagebox      = {},
    Permissions     = {},
    Rules           = {},
    WhoList         = {},
    prefix          = '!',
    osuNickNames    = {},
    faq             = {},
    osuTrChat       = '134666472864743424'
    osuTrServer     = false,
    playingGameList  = [],
    gameTrackList   = {};
//}
// <Requires> {
try {
	var Discord = require("discord.js");
} catch (e) {
	logger.debug("Please run npm install and ensure it passes with no errors!");
	process.exit();
}
try {
	var AuthDetails = require(jsonFolder + "auth.json");
} catch (e) {
	logger.debug("Please create an auth.json like auth.json.example with at least an email and password.");
	process.exit();
}
try{
	Config = require(jsonFolder + "config.json");
} catch(e){ //no config file, use defaults
	Config.debug = false;
	Config.respondToInvalid = false;
	Config.trackGames = true;
	Config.trackLogin = false;
	updateConfig();
}

var fs              = require('fs'),
    path            = require('path'),
    request         = require("request"),
    TwitchClient    = require("node-twitchtv"),
    Osu             = require('nodesu'),
    country         = require('countryjs'),
    exec            = require('child_process').exec;


//}
// <JSON> {
try {
    alias = require(jsonFolder + 'alias.json');
} catch(e) {}
try {
    banned = require(jsonFolder + 'banned.json');
} catch(e) {}
try {
    gameList = require(jsonFolder + "gameList.json");
} catch(e) {}
try {
    messagebox = require(jsonFolder + "messagebox.json");
} catch(e) {}
try {
    Permissions = require(jsonFolder + "permissions.json");
} catch(e) {}
try {
    Rules = require(jsonFolder + "Rules.json");
} catch(e) {}
try {
    ChangeBot = require(jsonFolder + "ChangeBot.json");
} catch(e) {}
try {
    WhoList = require(jsonFolder + "WhoList.json");
} catch(e) {}
try {
    afkList = require(jsonFolder + "afkList.json");
} catch(e) {}
try {
    developers = require(jsonFolder + "developers.json");
} catch(e) {}
try {
    osuNickNames = require(jsonFolder + "osuNickNames.json");
} catch(e) {}
try {
    faq = require(jsonFolder + "faq.json");
} catch(e) {}
try {
    gameTrackList = require(jsonFolder + "gameTrackList.json");
} catch(e) {}
//}
// <Required Variables> {
var account         = AuthDetails.ttv;
var bot             = new Discord.Client();
var ttvc            = new TwitchClient(account);
var osuApi          = new Osu.api({apiKey: '4d10da6e0779eada0ca9000f709b612f4643e7fe'});
var child_process   = require("child_process");
//}
// <UpdateFile> {
function updateJSON(fnjson, fjson) {
    require("fs").writeFile(jsonFolder + fnjson,JSON.stringify(fjson,null,2), null);
}
function updateAfkList(){updateJSON("afkList.json",afkList);}
function updatePermissions() {updateJSON("permissions.json",Permissions);}
function updateRules(){updateJSON("Rules.json",Rules);}
function updateChangeBot(){updateJSON("ChangeBot.json",ChangeBot);}
function updateWhoList(){updateJSON("WhoList.json",WhoList);}
function updateMessagebox(){updateJSON("messagebox.json",messagebox);}
function updateAlias(){updateJSON("alias.json",alias);}
function updateBanned(){updateJSON("banned.json",banned);}
function updateAuth(){updateJSON("auth.json",AuthDetails);}
function updateOsuNickNames(){updateJSON("osuNickNames.json",osuNickNames);}
function updateFaq(){updateJSON("faq.json",faq);}
function updateConfig(){updateJSON("config.json",Config);}
function updateGameTrackList(){updateJSON("gameTrackList.json",gameTrackList);}
//}
// <setInterval & setTimeout> {
setInterval(function() {
    var gtp = Math.floor(Math.random() * Object.keys(gameList).length) + 1;
    bot.setPlayingGame(gameList[gtp]);
}, 1000 * 60 * 5);
//}
// <Functions> {
var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
function ban(msg, user, h) {
    if(user.startsWith("<@")) {
        user = user.replace("<@","");
        user = user.replace(">","");
    }
    if(checkPermission(user, "dev") || checkPermission(user, "admin")) {
        bot.sendMessage(msg.channel, "**Bu kullanıcı engellenemez.**");
        return;
    }

    var perm = true;
    if(h) {
        perm = false;
    }

    banned[user] = {
        permanent: perm,
        time: Date(),
        hours: h
    };
    updateBanned();
    if(h) {
        bot.sendMessage(msg.channel, "**<@" + user + "> isimli kullanıcı bot komutlarını " + h + " saat kullanamayacaktır.**");
    } else {
        bot.sendMessage(msg.channel, "**<@" + user + "> isimli kullanıcı bot komutlarını süresiz kullanamayacaktır.**");
    }
}

function spliceSlice(str, index, count, add) {
  return str.slice(0, index) + (add || "") + str.slice(index + count);
}

function timeFormatString(hour, minute, second)
{
    var reply = "";
    if(hour) {
    	reply += " " + hour + " saat";
    }
    if(minute) {
    	reply+= " " + minute + " dakika";
    }
    if(second) {
    	reply+= " " + second + " saniye";
    }
    return reply;
}

Date.prototype.addHours = function(h) {
   this.setTime(this.getTime() + (h*60*60*1000));
   return this;
};

Date.prototype.addMinutes = function(m) {
   this.setTime(this.getTime() + (m*60*1000));
   return this;
};

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}
function timediff(date1, date2)
{
	var pDate1 = new Date(date1.toString());
	var pDate2 = new Date(date2.toString());

	/*if (pDate2 < pDate1) {
		pDate2.setDate(pDate2.getDate() + 1);
	}*/

	var diff = pDate2 - pDate1;

	var msec = diff;

	var as = msec / 1000;

	var hh = Math.floor(msec / 1000 / 60 / 60);
	msec -= hh * 1000 * 60 * 60;
	var mm = Math.floor(msec / 1000 / 60);
	msec -= mm * 1000 * 60;
	var ss = Math.floor(msec / 1000);
	msec -= ss * 1000;

	var TimeDiff = {
		"hours": hh,
		"minutes": mm,
		"seconds": ss,
		"mseconds": msec,

		"aseconds": as
	};

	return TimeDiff;
}

function load_plugins(){
	var plugin_folders = getDirectories("./plugins");
	for (var i = 0; i < plugin_folders.length; i++) {
		var plugin;
		try{
			plugin = require("./plugins/" + plugin_folders[i]);
		} catch (err){
			logger.debug("Improper setup of the '" + plugin_folders[i] +"' plugin. : " + err);
		}
		if (plugin){
			if("commands" in plugin){
				for (var j = 0; j < plugin.commands.length; j++) {
					if (plugin.commands[j] in plugin){
						commands[plugin.commands[j]] = plugin[plugin.commands[j]];
					}
				}
			}
		}
	}
	logger.debug("Loaded " + Object.keys(commands).length + " chat commands.")
}
function puts(error, stdout, stderr) { logger.debug(stdout) }
function checkPermission(user,permission){
	try {

		var allowed = false;
		try{
			if(Permissions.global.hasOwnProperty(permission)){
				allowed = Permissions.global[permission] == true;
			}
		} catch(e){}
		try{

			if(Permissions.users[user].hasOwnProperty(permission)){
				allowed = Permissions.users[user][permission] == true;
			}
		} catch(e){}
		return allowed;
	} catch(e){}
	return false;
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function getBeatmapDetail(beatmap,chan,mode) {
    if(mode == "b")
    {
        osuApi.getBeatmaps(osuApi.beatmap.byMapID(parseInt(beatmap, 10)), osuApi.mode.all, function(err, response) {
        if (err) {
            bot.sendMessage(chan,"**Beatmap Bulunamadı !**");
            return false;
        }
        var rp = "**Name**: " + response[0].title +
        "\n**Artist**: " + response[0].artist +
        "\n**Mapped by**: " + response[0].creator +
        "\n[" + response[0].version + "] (" + response[0].bpm + "BPM" + ")\n**Star**: " +
        round(response[0].difficultyrating, 2) +
        "\n**AR**: " + response[0].diff_approach +
        " **CS**: " + response[0].diff_size +
        " **OD**: " + response[0].diff_overall +
        " **HP**: " + response[0].diff_drain;
        bot.sendMessage(chan,rp);
        return;
        });
    } else if (mode == "s")
    {
        osuApi.getBeatmaps(osuApi.beatmap.byMapset(parseInt(beatmap,10)), osuApi.mode.all, function(err, response) {
        if (err) {
            bot.sendMessage(chan,"**Beatmap Bulunamadı !**");
            return false;
        }
        var rp = "**Name**: " + response[0].title +
        "\n**Artist**: " + response[0].artist +
        "\n**Mapped by**: " + response[0].creator +
        "\n[" + response[0].version + "] (" + response[0].bpm + "BPM" + ")\n**Star**: " +
        round(response[0].difficultyrating, 2) +
        "\n**AR**: " + response[0].diff_approach +
        " **CS**: " + response[0].diff_size +
        " **OD**: " + response[0].diff_overall +
        " **HP**: " + response[0].diff_drain;
        bot.sendMessage(chan,rp);
        return;
        });
    }
}

function getUserDetails(username,chan) {
    osuApi.getUser(osuApi.user.byUsername(username), function(err, response) {
        if (err) {
            bot.sendMessage(chan,"**Kullanıcı bulunamadı !**");
            return false;
        }
        var rp = "**" + response.username + "** kullanıcısının osu! profili hakkında bilgiler\n" +

        "\n**Performans: **" + parseFloat(response.pp_raw).toFixed(2) + "pp (#" + Number(response.pp_rank).toLocaleString() + ")" +
        "\n**Ülke: **" + alpha2full(response.country) + " (#" + Number(response.pp_country_rank).toLocaleString() + ")" +
        "\n**Seviye: **" + parseFloat(response.level).toFixed(2) +
        "\n**Sıralama puanı: **" + Number(response.ranked_score).toLocaleString() + " puan" +
        "\n**Toplam puan: **" + Number(response.total_score).toLocaleString() + " puan" +
        "\n**İsabetlilik: **" + "%" + parseFloat(response.accuracy).toFixed(2) +
        "\n**Oynama sayısı: **" + Number(response.playcount).toLocaleString() +
        "\n**Toplam hit sayısı: **" + (parseInt(response.count300, 10) + parseInt(response.count100, 10) + parseInt(response.count50, 10)).toLocaleString() +
        "\n**SS: **" + Number(response.count_rank_ss).toLocaleString() +
        "** S: **" + Number(response.count_rank_s).toLocaleString() +
        "** A: **" + Number(response.count_rank_a).toLocaleString();
        //bot.sendMessage(chan,rp);

        osuApi.getUserBest(osuApi.user.byUsername(username), osuApi.mode.default, function(err, response) {
            if (err) {
                return console.log (err);
            }
            rp += "\n**En iyi skor:** " + Number(response[0].score).toLocaleString() + " puan / " +  Number(response[0].maxcombo).toLocaleString() + " kombo (" +  parseFloat(response[0].pp).toFixed(2) + "pp)";
            bot.sendMessage(chan,rp);
        });
    });
}


function alpha2full(ct) {
    return country.name(ct);
}

function strcon(str) {
    if(/^[a-zA-Z0-9-_\[\]]+([a-zA-Z0-9-_\[\]]+)*$/.test(str))
        return true;
    return false;
}

function culcon(str) {
    if(/^[a-zA-Z-_]+$/.test(str))
        return true;
    return false;
}

function numcon(str) {
    if(/^[0-9]+$/.test(str))
        return true;
    return false;
}

function numconf(str) {
    if(/^[0-9]+\.[0-9]+$/.test(str))
        return true;
    return false;
}

function isset(arg)
{
    return (typeof arg == 'undefined' ? false : true);
}

function writeRules() {
    var rulelist = Rules;
    var texttosend = "";
    for(var key in rulelist)
    {
        texttosend += "\n" + key + ". " + rulelist[key];
    }
    return texttosend;
}
function changelog() {
    return ChangeBot[Object.keys(ChangeBot).length.toString()] + "\n\n" + ChangeBot[(Object.keys(ChangeBot).length - 1).toString()];
}

function whois(username) {
    if(isset(WhoList[username.toLowerCase()]))
        return WhoList[username.toLowerCase()];
    return "**O kim bilmiyorum** :cry:";
}

function isTimeCode(suffix)
{
    var args = suffix.split(' ');
    var t = args.shift();

    var h = t.substring(0, t.indexOf('s'));
    var m = t.substring(0, t.indexOf('d'));
    if(h && m) m = t.substring(t.indexOf('s') + 1, t.indexOf('d'));

    return ((h && numcon(h)) || (m && numcon(m)));
}


function checklink(link) {
      if(/(https:\/\/osu.ppy.sh\/s\/)+(\d+\s)+/.test(link + " ") || /(http:\/\/osu.ppy.sh\/s\/)+(\d+\s)+/.test(link + " ") || /(https:\/\/osu.ppy.sh\/b\/)+(\d+\s)+/.test(link + " ") || /(http:\/\/osu.ppy.sh\/b\/)+(\d+\s)+/.test(link + " ") )
          return true;
      return false;
}

function checkRole(serverid, user, role) {
    var server = bot.servers.get("id", serverid);
    if(!server) {
        logger.debug("Error at checkRole: no server");
        return false;
    }
    var roles = server.rolesOfUser(user);
    for(var i=0;i<roles.length;i++) {
        if(roles[i].name == role)
            return true;
    }
    return false;
}

//}
// <Commands> {
var commands = {
  "git": {
		description: 'Botun github sayfasını atar',
    	process: function(bot,msg,suffix) {
        bot.sendMessage(msg.channel, msg.author + ", https://github.com/EchelonDev/kapchobot, http://echelondev.me");
      }
  },
  "gitpull": {
    hidden:"1",
		usage: "<command>",
		description: 'Executes arbitrary javascript in the bot process. User must have "eval" permission',
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id,"dev")){
				exec("git stash && git pull && pm2 restart all", puts);
			}
		}
	},
  "eval": {
    hidden:"1",
		usage: "<command>",
		description: 'Executes arbitrary javascript in the bot process. User must have "eval" permission',
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id,"dev")){
				bot.sendMessage(msg.channel, eval(suffix));
			} else {
				bot.sendMessage(msg.channel, msg.author + " doesn't have permission to execute eval!");
			}
		}
	},
    "ch": {
        disabled:1,
        usage:"<create/del><isim>",
        description:"Serverda bir text kanalı oluşturur veya siler. (Manage Channels yetkisi gerekir)",
        process: function(bot,msg,suffix) {
            try {
                var args = suffix.split(' ');
                var cmd = args.shift();
                var name = args.join(' ');
              if(cmd == "create" && name != null) {
                if(bot.memberHasRole(msg.sender,"manageChannels")) {
                    if(bot.memberHasRole(bot, "manageChannels")) {
                        bot.createChannel(msg.channel.server,name,"text").then(function(channel) {
                            bot.sendMessage(msg.channel,"`" + channel + " Oluşturuldu`");
                        }).catch(function(error){
                            bot.sendMessage(msg.channel,"kanal oluşturulamadı: `" + error + "`");
                        });
                    } else {
                      bot.sendMessage(msg.channel,"`Lütfen botta 'Manage Channels' yetkisi olduğundan emin olunuz.`");
                    }
                } else {
                  bot.sendMessage(msg.channel,"`Lütfen 'Manage Channels' yetkinizin olduğundan emin olunuz.`");
                }
              } else if(cmd == "del" && name != null) {
                if(bot.memberHasRole(msg.sender,"manageChannels")) {
                    if(bot.memberHasRole(bot, "manageChannels")) {
                      if(name.startsWith('<#')){
                          var channel = bot.channels.get("id",suffix.substr(2,suffix.length-3));
                          bot.deleteChannel(channel).then(function(channel){
                              bot.sendMessage(msg.channel,"`" + channel + " silindi`");
                          }).catch(function(error){
                              bot.sendMessage(msg.channel,"kanal silinemedi: `" + error + "`");
                          });
                      } else {
                        bot.sendMessage(msg.channel,"`Lütfen kanal ismini mention ediniz.`");
                      }
                    } else {
                      bot.sendMessage(msg.channel,"`Lütfen botta 'Manage Channels' yetkisi olduğundan emin olunuz.`");
                    }
                } else {
                  bot.sendMessage(msg.channel,"`Lütfen 'Manage Channels' yetkinizin olduğundan emin olunuz.`");
                }
              } else if(name == null) {
                bot.sendMessage(msg.channel,"`Lütfen kanal giriniz.`");
              } else {
                bot.sendMessage(msg.channel,"`Lütfen komutunuzu kontrol ediniz.`");
              }
            } catch (e) {
              logger.debug("Error !ch at " + msg.channel + " : " + e);
            }
        }
    },
    "kural": {
        description:"Kural listesi.",
        process: function(bot,msg,suffix) {
            try {
                 bot.sendMessage(msg.channel,"**Kurallar :**" + writeRules());

                logger.debug("Sending !kural to " + msg.channel);
            }
            catch (e){
                logger.debug("Error !kural at " + msg.channel + " : " + e);
            }
        }
    },
    "kuralsil":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "kural")) {
                    if(suffix)
                    {
                        logger.debug("Sending !kuralsil to " + msg.channel);
                        delete Rules[suffix.toLowerCase()];
                        updateRules();
                    } else {
                        logger.debug("Sending !kuralsil to " + msg.channel);
                        bot.sendMessage(msg.channel,"**Silinecek kural kaç ?**");
                    }
                } else {
                    bot.sendMessage(msg.channel,"**Sen benim babam değilsin !!!**");
                }
            }
            catch (e){
                logger.debug("Error !whois at " + msg.channel + " : " + e);
            }
        }
    },
    "kuralekle":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                var args = suffix.split(' ');
			    var user = args.shift();
			    var message = args.join(' ');
                if(checkPermission(msg.sender.id, "kural")) {
                    if(suffix)
                    {
                        logger.debug("Sending !kuralekle to " + msg.channel);
                        Rules[user.toLowerCase()] = message;
                        updateRules();
                    } else {
                        logger.debug("Sending !kuralekle to " + msg.channel);
                        bot.sendMessage(msg.channel,"**Kural eklemek için bir kural vermelisin !**");
                    }
                } else {
                    bot.sendMessage(msg.channel,"**Sen benim babam değilsin !!!**");
                }
            }
            catch (e){
                logger.debug("Error !whois at " + msg.channel + " : " + e);
            }
        }
    },
    "color":{
      hidden:"1",
        process: function(bot,msg,suffix){
            try {
                if(checkPermission(msg.sender.id,"dev") || checkRole(msg.channel.server.id,msg.sender.id,"demi-god") || checkRole(msg.channel.server.id,msg.sender.id,"god")) {
                    var args = suffix.split(' ');
                    var roleToChange = args.shift();
                    var colour = args.shift();
                    roleToChange = roleToChange.replace("_", " ");
                    if(colour.match(/^(#)?[A-Fa-f0-9]+$/)) {
                        if(msg.channel.server.roles.get("name",roleToChange) != null){
                            var role = msg.channel.server.roles.get("name",roleToChange);
                            //change hex to dec
                            colour = colour.replace("#","");
                            colour = parseInt(colour, 16);
                            var newData = {
                                color : colour
                            }
                            bot.updateRole(role,newData, function(error,role) {
                               if(error) {
                                   bot.sendMessage(msg.channel,"`Lütfen botun \"Manage Roles\" rolüne sahib olup olmadığını kontrol ediniz.`");
                               } else {
                                   bot.sendMessage(msg.channel,"`\"" + roleToChange + "\" rolünün rengi \"" + colour + "\"a değiştirildi.`");
                               }
                            });
                        } else {
                            bot.sendMessage(msg.channel,"`Lütfen rolü kontrol ediniz.`");
                        }
                    } else {
                        bot.sendMessage(msg.channel,"`Lütfen hexadecimal bir renk giriniz.`");
                    }
                } else {
                    bot.sendMessage(msg.channel,"`Bu komut için yeterli yetkiniz bulunmamaktadır.`");
                }
            } catch(e) {
                bot.sendMessage(msg.channel,"`Error !color at " + msg.channel + " : " + e + "`");
            }
        }
    },
    "yey": {
      hidden:"1",
      process: function(bot,msg,suffix){
          try {
              if(checkPermission(msg.sender.id,"dev")) {
                child_process.exec("hostname -f", function(err, stdout, stderr) {
                    if(err && stderr) throw new err;
                    var hostname = stdout.trim();
                    bot.sendMessage(msg.channel,hostname);
                });
          }
          } catch(e) {
              logger.debug("Error !yey at " + msg.channel + " : " + e);
          }
      }
    },
    "stats": {
        hidden:"1",
        description: "Prints the stats from the instance into the chat.",
        process: function(bot, msg, suffix) {
            if(checkPermission(msg.sender.id,"dev")) {
                var msgArray = [];
                msgArray.push("Uptime : " + (Math.round(bot.uptime/(1000*60*60))) + " hours, " + (Math.round(bot.uptime/(1000*60))%60) + " minutes, and " + (Math.round(bot.uptime/1000)%60) + " seconds.");
                msgArray.push("I am in **" + bot.servers.length + "** servers, and in **" + bot.channels.length + "** channels.");
                msgArray.push("Currently, I'm connected to **" + bot.users.length + "** different people");
                msgArray.push("My current username is **" + bot.user + "**, and right now, I am at v**" + version + "**");
                logger.debug(msg.sender + " requested the bot status.");
                bot.sendMessage(msg.channel, msgArray);
            }
        }
    },
    "info": {
        hidden:"1",
        desciption:"",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id,"dev")) {
                    if (msg.channel.server) {
                        var msgArray = [];
                        if(msg.sender.voiceChannel != null) {
                            msgArray.push("Voice Kanal: " + msg.sender.voiceChannel + " (ID: " +  msg.sender.voiceChannel.id + ")\n");
                        }
                            msgArray.push("Kanal: " + msg.channel + " (ID: " + msg.channel.id + ")\n");
                            msgArray.push("Server: **" + msg.channel.server.id + "** (ID: " + msg.channel.server.id + ") (Ülke: " + msg.channel.server.region + ")\n");
                            msgArray.push("Server sahibi: " + msg.channel.server.owner + " (ID: " + msg.channel.server.owner.id + ")\n");
                            if (msg.channel.topic) { msgArray.push("Kanal konusu: " + msg.channel.topic); }
                            bot.sendMessage(msg.channel, msgArray);

                    }
                    else{
                        bot.sendMessage(msg, "PM den çalışmıyor , pki tm tşk.");
                    }
                }
            } catch(e) {
                logger.debug("Error !info at " + msg.channel + " : " + e);
            }
        }
    },
    "ban":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "admin") || checkRole(msg.channel.server.id,msg.sender.id,"Babalar") || checkRole(msg.channel.server.id,msg.sender.id,"Dedeler")) {
                    if(suffix && suffix.startsWith('<@') && suffix.indexOf('>') > -1) {
                        var args = suffix.split(' ');
                        var user = args.shift();
                        if(user.startsWith("<@")) {
                            user = user.replace("<@","");
                            user = user.replace(">","");
                        }
                        var h = false;
                        if(args.length > 0) {
                            h = args.join(' ');
                        }
                        ban(msg, user, h);
                    } else {
                        bot.sendMessage(msg.channel, "**Kullanıcı bulunamadı**");
                    }
                }
            }
            catch (e){
                logger.debug("Error !ban at " + msg.channel + " : " + e);
            }
        }
    },
    "unban":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "admin") || checkRole(msg.channel.server.id,msg.sender.id,"Babalar") || checkRole(msg.channel.server.id,msg.sender.id,"Dedeler")) {
                    if(suffix && suffix.startsWith('<@') && suffix.indexOf('>') > -1) {
                        suffix = suffix.substring(suffix.indexOf('<@'), suffix.indexOf('>'));
                        suffix = suffix.replace("<@","");
                        suffix = suffix.replace(">","");
                        delete banned[suffix];
                        updateBanned();
                        bot.sendMessage(msg.channel, "**<@" + suffix + "> adlı kişinin bot komut engeli kaldırılmıştır.**");
                    } else {
                        bot.sendMessage(msg.channel, "**Kullanıcı bulunamadı.**");
                    }
                }
            }
            catch (e){
                logger.debug("Error !unban at " + msg.channel + " : " + e);
            }
        }
    },
    "talk":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(suffix && bot.users.get("id", "134987945827368960")) {
                    bot.sendMessage(bot.users.get("id", "134987945827368960"), msg.sender + " from " + msg.channel + ": " + suffix);
                }
            }
            catch (e){
                logger.debug("Error !say at " + msg.channel + " : " + e);
            }
        }
    },
    "alias":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                var args = suffix.split(' ');
                var cmd = args.shift();
                var alis = args.shift();
                var org =  args.join(' ');
                if(checkPermission(msg.sender.id, "dev")) {
                    if(cmd == "ekle") {
                        alias[alis] = org;
                        updateAlias();
                        bot.sendMessage(msg.channel, "**\"" + alis + " : " + org + "\" aliası eklendi.**");
                    } else if(cmd == "sil") {
                        if(alias.hasOwnProperty(alis)) {
                            delete alias[alis];
                            updateAlias();
                            bot.sendMessage(msg.channel, "**\"" + alis + "\" aliası silindi.**");
                        }
                    }
                }
            }
            catch (e){
                logger.debug("Error !alias at " + msg.channel + " : " + e);
            }
        }
    },
    "shutdown": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            if(checkPermission(msg.sender.id, "dev")) {
                bot.sendMessage(msg.channel, "**Bye!**", false, function() { exec("pm2 stop all", puts); process.exit(0); });
            }
        }
    },
    "restart": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            if(checkPermission(msg.sender.id, "dev")) {
                bot.sendMessage(msg.channel, "**Brb!**", false, function() { exec("pm2 restart all", puts); process.exit(0); });
            }
        }
    },
    "afk": {
        usage: "<bırakacağınız mesaj>",
		description: "Kişinin durumunu AFK yapar",
        delete: true,
		process: function(bot,msg,suffix) {
			if(afkList.hasOwnProperty(msg.sender.id)){
				if(afkList[msg.sender.id].status == "AFK" || afkList[msg.sender.id].status == "AFKT") {
					var date1 = afkList[msg.sender.id].time;
					var afkTime = timediff(date1, Date());
					delete afkList[msg.sender.id];
					updateAfkList();
					var reply = "**" + msg.sender + " artık AFK değil,";
					reply += timeFormatString(afkTime.hours, afkTime.minutes, afkTime.seconds);
					reply += " sonra";
					reply += " geri döndü.**";!
					bot.sendMessage(msg.channel, reply);
				}
			}
			else {
			    if(suffix) {
			        if(isTimeCode(suffix)) {
			            var args = suffix.split(' ');
    			        var t = args.shift();
    			        var afkMessage = args.join(' ');

			            var h = false;
			            if(numcon(t.substring(0, t.indexOf('s'))))
			                h = t.substring(0, t.indexOf('s'));
			            var m = false;
			            if(numcon(t.substring(0, t.indexOf('d'))))
			                m = t.substring(0, t.indexOf('d'));
			            if(h && numcon(t.substring(t.indexOf('s') + 1, t.indexOf('d'))))
			                m = t.substring(t.indexOf('s') + 1, t.indexOf('d'));

                  if(m > 60) {
                    if(!h) h = 0;
                    h += parseInt(m / 60, 10);
                    m %= 60;
                  }

			            if(h || m) {
				            afkList[msg.sender.id] = {
				                status: "AFKT",
				                time: Date(),
				                channel: msg.channel.id,
				                message: afkMessage,
				                afkTime: {
				                    hours: h,
				                    minutes: m
				                }
				            };
				            updateAfkList();
				            if(h && m) {
				                if(h > 8760 || m > 8760*60) {
				                    bot.sendMessage(msg.channel, "**" + msg.sender + " öldü.**");
				                } else {
				                    bot.sendMessage(msg.channel, "**" + msg.sender + " " + h + " saat " + m + " dakika boyunca AFK.**");
				                }

				            }
				            else if(h) {
				                if(h > 8760) {
				                    bot.sendMessage(msg.channel, "**" + msg.sender + " öldü.**");
				                } else {
				                    bot.sendMessage(msg.channel, "**" + msg.sender + " " + h + " saat boyunca AFK.**");
				                }
				            }
				            else if(m) {
				                if(m > 8760) {
				                    bot.sendMessage(msg.channel, "**" + msg.sender + " öldü.**");
				                } else {
				                    bot.sendMessage(msg.channel, "**" + msg.sender + " " +  m + " dakika boyunca AFK.**");
				                }
				            }
				            else bot.sendMessage(msg.channel, "**" + msg.sender + " artık AFK.** (<@134987945827368960> mümkün olmayan kod)");
			            }
			            else {
			                afkList[msg.sender.id] = {
				                status: "AFK",
				                time: Date(),
				                channel: msg.channel.id,
				                message: suffix,
				                afkTime: false
				            };
				            updateAfkList();
				            bot.sendMessage(msg.channel, "**" + msg.sender + " artık AFK.**");
			            }
			        }
			        else {
				        afkList[msg.sender.id] = {
				            status: "AFK",
				            time: Date(),
				            channel: msg.channel.id,
				            message: suffix,
				            afkTime: false
				        };
				        updateAfkList();
				        bot.sendMessage(msg.channel, "**" + msg.sender + " artık AFK.**");
			        }
			    }
			    else {
			        afkList[msg.sender.id] = {
				        status: "AFK",
				        time: Date(),
				        channel: msg.channel.id,
				        message: false,
				        afkTime: false
				    };
				    updateAfkList();
				    bot.sendMessage(msg.channel, "**" + msg.sender + " artık AFK.**");
			    }
			}
		}
	},
    "avatar":{
        hidden:"1",
        description:"Kişinin avatarını gösterir !",
        process: function(bot,msg,suffix) {
            try {
                if(suffix && suffix.indexOf("<@") == 0)
                {
                    suffix = suffix.substring(suffix.indexOf('<@'), suffix.indexOf('>'));
                    suffix = suffix.replace('<@', '');
                    suffix = suffix.replace('>', '');
                    var user = bot.users.get("id", suffix);
                    bot.sendMessage(msg.channel, user.avatarURL);
                } else {
                    bot.sendMessage(msg.channel, msg.sender.avatarURL);
                }
            }
            catch (e){
                logger.debug("Error !avatar at " + msg.channel + " : " + e);
            }
        }
    },
    "changelog":{
        description:"Changelog gösterir !",
        process: function(bot,msg,suffix) {
            try {
                //ChangeBot = require("./ChangeBot.json"); //wait why the fuck we have this
                bot.sendMessage(msg.channel,"**ChangeLog : \n\n" + changelog() + "**");
                logger.debug("Sending !changelog to " + msg.channel);
            }
            catch (e){
                logger.debug("Error !changelog at " + msg.channel + " : " + e);
            }
        }
    },
    "deconstruction": {
        hidden: "1",
        description:"Biliyorsun neye yaradğını :3",
        process: function(bot,msg,suffix) {
            try {
                bot.sendMessage(msg.channel,"**KIRA KIRA**");
                logger.debug("Sending deconstruction to " + msg.channel);
            }
            catch (e){
                logger.debug("Error !deconstruction at " + msg.channel + " : " + e);
            }
        }
    },
    "defenders": {
        hidden: "1",
        description:"Biliyorsun neye yaradğını :3",
        process: function(bot,msg,suffix) {
            try {
                bot.sendMessage(msg.channel,"**ＨＯＬＤ ＯＮ ＳＴＡＹ ＳＴＲＯＮＧ**");
                logger.debug("Sending !brainpower to " + msg.channel);
            }
            catch (e){
                logger.debug("Error !brainpower at " + msg.channel + " : " + e);
            }
        }
    },
    "brainpower": {
        hidden: "1",
        description:"Biliyorsun neye yaradğını :3",
        process: function(bot,msg,suffix) {
            try {
                bot.sendMessage(msg.channel,"**O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A-JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA**");
                logger.debug("Sending !brainpower to " + msg.channel);
            }
            catch (e){
                logger.debug("Error !brainpower at " + msg.channel + " : " + e);
            }
        }
    },
    "dada": {
        hidden: "1",
        description:"Biliyorsun neye yaradğını :3",
        process: function(bot,msg,suffix) {
            try {
                bot.sendMessage(msg.channel,"**Dadadadadadadadadadadadadadadadadadadadadadadadadadadada**");
                logger.debug("Sending !dada to " + msg.channel);
            }
            catch (e){
                logger.debug("Error !dada at " + msg.channel + " : " + e);
            }
        }
    },
    "who": {
        usage:"<isim>",
        description:"Botun kişiler hakkındaki düşüncelerini getirir.",
        process: function(bot,msg,suffix) {
            try {
                logger.debug("Sending !who to " + msg.channel);
                if(suffix.startsWith("add ")) {
                    if(checkPermission(msg.sender.id, "who") || checkRole(msg.channel.server.id,msg.sender.id,"Babalar") || checkRole(msg.channel.server.id,msg.sender.id,"Dedeler")) {
                        var args = suffix.split(' ');
                        args.shift();
			            var user = args.shift();
			            var message = args.join(' ');
                        WhoList[user.toLowerCase()] = message;
                        updateWhoList();
                        bot.sendMessage(msg.channel, "**Who listesine \"" + user + "\" eklendi.**");
                    } else {
                    bot.sendMessage(msg.channel,"**Sen benim babam değilsin !!!**");
                    }
                } else if(suffix.startsWith("delete ")) {
                    if(checkPermission(msg.sender.id, "who") || checkRole(msg.channel.server.id,msg.sender.id,"Babalar") || checkRole(msg.channel.server.id,msg.sender.id,"Dedeler")) {
                        var args = suffix.split(' ');
                        args.shift();
			            var user = args.shift();
                        if(WhoList.hasOwnProperty(user)) {
                            logger.debug("Sending !who to " + msg.channel);
                            delete WhoList[user.toLowerCase()];
                            updateWhoList();
                            bot.sendMessage(msg.channel, "**Who listesinden \"" + user + "\" silindi.**");
                        } else {
                            bot.sendMessage(msg.channel, "**\"" + user + "\" who listesinde mevcut değil.**");
                        }
                    } else {
                    bot.sendMessage(msg.channel,"**Sen benim babam değilsin !!!**");
                    }
                } else if(suffix) {
                    bot.sendMessage(msg.channel,whois(suffix));
                } else {
                    bot.sendMessage(msg.channel,"**Kimden bahsediyorsun ?**");
                }
            }
            catch (e) {
                logger.debug("Error !who at " + msg.channel + " : " + e);
            }
        }
    },
    "osu": {
        usage:"[mod:opsiyonel] <isim>",
        description:"Kişinin osu! bilgilerini getirir.",
        process: function(bot,msg,suffix){
            try {
                if(suffix && (suffix.indexOf("<@") == -1 && suffix.indexOf(">") == -1) && suffix.length >= 3 && suffix != "std" && suffix != "taiko" && suffix != "ctb" && suffix != "mania") {
                    var args = suffix.split(' ');
                    if(args.length == 1) {
                        var user = args.shift();
                    } else if(args.length > 1) {
                        if(args[0] == "std" || args[0] == "taiko" || args[0] == "ctb" || args[0] == "mania") {
                            var mod = args.shift();
                            var user = args.join(" ");
                        } else if(args[args.length-1] == "std" || args[args.length-1] == "taiko" || args[args.length-1] == "ctb" || args[args.length-1] == "mania"){
                            var mod = args.pop();
                            var user = args.join(" ");
                        } else {
                            var user = args.join(" ");
                        }
                    }
                } else if(suffix && suffix.indexOf("<") > -1) {
                    var args = suffix.split(' ');
                    if(args.length == 1) {
                        var user = args.shift();
                        user = user.substring(2, user.indexOf(">"));
                        if(osuNickNames.hasOwnProperty(user)) {
                            user = osuNickNames[user];
                        }
                    } else if(args.length == 2) {
                        var mod = args.shift();
                        if(mod == "std" || mod == "taiko" || mod == "ctb" || mod == "mania") {
                            var user = args.shift();
                        } else {
                            var user = mod;
                            var mod = args.shift();
                        }
                        user = user.substring(2, user.indexOf(">"));
                        if(osuNickNames.hasOwnProperty(user)) {
                            user = osuNickNames[user];
                        }
                    }
				} else if(osuNickNames.hasOwnProperty(msg.sender.id)) {
                    var user = osuNickNames[msg.sender.id];
                    if(suffix) {
                        var mod = suffix;
                    }
                }
                while(user.indexOf(' ') > -1) {
                    user = user.replace(' ', '_');
                }
                if(user && user.length >= 3 && strcon(user) && (mod == null || mod == "" || mod == "std")){
                    getUserDetails(user, msg.channel);
                } else if(user && user.length >= 3 && strcon(user) && mod == "taiko") {
                    bot.sendMessage(msg.channel, "**Henüz sadece standart mod istatistiklerini görebiliyoruz, söri.**")
                } else if(user && user.length >= 3 && strcon(user) && mod == "ctb") {
                    bot.sendMessage(msg.channel, "**Henüz sadece standart mod istatistiklerini görebiliyoruz, söri.**")
                } else if(user && user.length >= 3 && strcon(user) && mod == "mania") {
                    bot.sendMessage(msg.channel, "**Henüz sadece standart mod istatistiklerini görebiliyoruz, söri.**")
                } else {
                    logger.debug("parameter problem in !osu at " + msg.channel);

                    bot.sendMessage(msg.channel, "Lütfen düzgün bir isim giriniz, \"!osu peppy \" gibi. / ");
                }
            }
            catch(e) {
                 logger.debug("Error !osu at " + msg.channel + " : " + e);
            }
        }
    },
    "osusig": {
        usage:"[mod:opsiyonel] <isim>",
        description:"Kişinin osu! imzasını getirir. (İmzanın kendi sitesi için http://lemmmy.pw/osusig)",
        process: function(bot,msg,suffix){
            try {
                var req = "";
                if(suffix && (suffix.indexOf("<@") == -1 && suffix.indexOf(">") == -1) && suffix.length >= 3 && suffix != "std" && suffix != "taiko" && suffix != "ctb" && suffix != "mania") {
                    var args = suffix.split(' ');
                    if(args.length == 1) {
                        var user = args.shift();
                    } else if(args.length > 1) {
                        if(args[0] == "std" || args[0] == "taiko" || args[0] == "ctb" || args[0] == "mania") {
                            var mod = args.shift();
                            var user = args.join(" ");
                        } else if(args[args.length-1] == "std" || args[args.length-1] == "taiko" || args[args.length-1] == "ctb" || args[args.length-1] == "mania"){
                            var mod = args.pop();
                            var user = args.join(" ");
                        } else {
                            var user = args.join(" ");
                        }
                    }
                } else if(suffix && suffix.indexOf("<") > -1) {
                    var args = suffix.split(' ');
                    if(args.length == 1) {
                        var user = args.shift();
                        user = user.substring(2, user.indexOf(">"));
                        if(osuNickNames.hasOwnProperty(user)) {
                            user = osuNickNames[user];
                        }
                    } else if(args.length == 2) {
                        var mod = args.shift();
                        if(mod == "std" || mod == "taiko" || mod == "ctb" || mod == "mania") {
                            var user = args.shift();
                        } else {
                            var user = mod;
                            var mod = args.shift();
                        }
                        user = user.substring(2, user.indexOf(">"));
                        if(osuNickNames.hasOwnProperty(user)) {
                            user = osuNickNames[user];
                        }
                    }
				} else if(osuNickNames.hasOwnProperty(msg.sender.id)) {
                    var user = osuNickNames[msg.sender.id];
                    if(suffix) {
                        var mod = suffix;
                    }
                }
                while(user.indexOf(' ') > -1) {
                    user = user.replace(' ', '_');
                }
                if(user && user.length >= 3 && strcon(user) && (mod == null || mod == "" || mod == "std")){
                    req = "http://lemmmy.pw/osusig/sig.php?colour=hex" + Math.floor(Math.random()*16777215).toString(16) + "&uname="+ encodeURIComponent(user) +"&pp=2&countryrank&flagshadow&darktriangles&avatarrounding=4&rankedscore&xpbar&xpbarhex";
                } else if(user && user.length >= 3 && strcon(user) && mod == "taiko") {
                    req = "http://lemmmy.pw/osusig/sig.php?colour=hex" + Math.floor(Math.random()*16777215).toString(16) + "&uname="+ encodeURIComponent(user) +"&mode=1&pp=2&countryrank&flagshadow&darktriangles&avatarrounding=4&rankedscore&xpbar&xpbarhex";
                } else if(user && user.length >= 3 && strcon(user) && mod == "ctb") {
                    req = "http://lemmmy.pw/osusig/sig.php?colour=hex" + Math.floor(Math.random()*16777215).toString(16) + "&uname="+ encodeURIComponent(user) +"&mode=2&pp=2&countryrank&flagshadow&darktriangles&avatarrounding=4&rankedscore&xpbar&xpbarhex";
                } else if(user && user.length >= 3 && strcon(user) && mod == "mania") {
                    req = "http://lemmmy.pw/osusig/sig.php?colour=hex" + Math.floor(Math.random()*16777215).toString(16) + "&uname="+ encodeURIComponent(user) +"&mode=3&pp=2&countryrank&flagshadow&darktriangles&avatarrounding=4&rankedscore&xpbar&xpbarhex";
                } else {
                    logger.debug("parameter problem in !osu at " + msg.channel);
                    bot.sendMessage(msg.channel, "Lütfen düzgün bir isim giriniz, \"!osusig peppy \" veya \"!osusig mania peppy\" gibi. ");
                }
                download(req,"caps/osu.png",function() {
                   bot.sendFile(msg.channel,"caps/osu.png");
                });
            }
            catch(e) {
                 logger.debug("Error !osusig at " + msg.channel + " : " + e);
            }
        }
    },
    "setosu": {
        usage:"<osu kullanıcı adı>",
        description:"Kişinin osu kullanıcı adını kaydeder.",
        process: function(bot,msg,suffix){
            try {
                osuNickNames[msg.sender.id] = suffix;
                updateOsuNickNames();
                bot.sendMessage(msg.channel,"**" + msg.sender + ", osu! kullanıcı adınız \"" + suffix + "\" olarak kaydedilmiştir.**");
            } catch(e) {
                 logger.debug("Error !osu at " + msg.channel + " : " + e);
            }
        }
    },
    "download": {
        description:"Discord indirme link atar (Windows, Android, iOS, Mac OS X) (Varsayılan: Windows)",
        process: function(bot,msg,suffix) {
            try {
                suffix = suffix.toLowerCase();
                if(suffix == "android") {
                    logger.debug("Sending !download android to " + msg.channel);
                    bot.sendMessage(msg.channel, "Discord Android download linki : <https://play.google.com/store/apps/details?id=com.discord>");
                }
                else if(suffix == "ios" || suffix == "iphone") {
                    logger.debug("Sending !download ios to " + msg.channel);
                    bot.sendMessage(msg.channel, "Discord iOS download linki : <https://itunes.apple.com/us/app/discord-chat-for-games/id985746746>");
                }
                else if(suffix == "macosx" || suffix == "mac") {
                    logger.debug("Sending !download macosx to " + msg.channel);
                    bot.sendMessage(msg.channel, "Discord Mac OS X download linki : <https://discordapp.com/api/download?platform=osx>");
                }
                else if(!suffix || suffix == "windows" || suffix == "win" || suffix == "pc"){
                    logger.debug("Sending !download pc[or anything] to " + msg.channel);
                    bot.sendMessage(msg.channel, "Discord Windows download linki : <https://discordapp.com/api/download?platform=win>");
                } else {
                    bot.sendMessage(msg.channel, "Platform bulunamadı.");
                }
            } catch(e) {
                logger.debug("Error !download at " + msg.channel + " : " + e);
            }
        }
    },
    "ping": {
        hidden:"1",
        description: "pong! cevabını verir, bot açıkmı kontrol etmek için birebir.",
        process: function(bot, msg, suffix) {
            try {
                logger.debug("Sending !ping to " + msg.channel);
                bot.sendMessage(msg.channel, msg.sender+" pong!");
            } catch(e) {
                logger.debug("Error !ping at " + msg.channel + " : " + e);
            }
        }
    },
    "marco": {
        hidden:"1",
        description: "polo! cevabını verir, bot açıkmı kontrol etmek için birebir.",
        process: function(bot, msg, suffix) {
            try {
                bot.sendMessage(msg.channel, msg.sender+" polo!");
            } catch(e) {
                logger.debug("Error !marco at " + msg.channel + " : " + e);
            }
        }
    },
    "bye": {
        description: "bye bye",
        process: function(bot, msg, suffix) {
            try {
                if(suffix)
                {
                    bot.sendMessage(msg.channel,"Güle güle " + suffix);
                } else {
                     bot.sendMessage(msg.channel,"Güle güle "+ msg.sender);
                }
                logger.debug("Sending !bye to " + msg.channel);
            } catch(e) {
                logger.debug("Error !bye at " + msg.channel + " : " + e);
            }
        }
    },
    "join-server": {
        hidden: "1",
        usage: "<invite kod>",
        description: "invite kodu ile servere bağlan",
        process: function(bot,msg,suffix) {
            if(checkPermission(msg.sender.id,"dev")) {
                logger.debug(bot.joinServer(suffix,function(error,server) {
                    logger.debug("callback: " + arguments);
                    if(error){
                     bot.sendMessage(msg.channel,"Katılamadım : " + error);
                    } else {
                        logger.debug("Joined server " + server);
                        bot.sendMessage(msg.channel,"Başarıyla katıldım! " + server);
                    }
                }));
            }
        }
    },
	"zar": {
		usage: "[üst değer]",
		description: "1 ile üst değer arasında rastgele sayı üretir. Verilmezse üst değer 10 alınır.",
		process: function(bot,msg,suffix) {
             try {
                 if(!culcon(suffix))
                 {
                     var max = 6;
			         if(suffix) max = suffix;
			             var val = Math.floor(Math.random() * max) + 1;
			         bot.sendMessage(msg.channel,msg.author + " " + val + " zarladı !");
                     logger.debug("send !zar at " + msg.channel);
                 }
                 else {
                     logger.debug("param problem in !zar at " + msg.channel);
                     bot.sendMessage(msg.channel, "!zar sadece sayı alıyor cnm .s .s");
                 }
             } catch(e){
                logger.debug("Error !zar at " + msg.channel + " : " + e);
             }
		}
	},
	"msg": {
		usage: "<kişi> <mesaj>",
		description: "Kişiye bir sonraki online oluşunda görmesi için mesaj bırakır.",
        delete: true,
		process: function(bot,msg,suffix) {
			var args = suffix.split(' ');
			var user = args.shift();
			var message = args.join(' ');
			if(user.startsWith('<@')){
				user = user.substr(2,user.length-3);
			}
			var target = msg.channel.server.members.get("id",user);
			if(!target){
				target = msg.channel.server.members.get("username",user);
			}
			messagebox[target.id] = {
				channel: msg.channel.id,
				content: target + ", " + msg.author.name + " diyorki: " + message
			};
			updateMessagebox();
			bot.sendMessage(msg.channel, "**" + msg.sender.name + "**'in **" + target.name + "**'e mesajı kaydedildi.");
		}
	},
    "ttv":{
        usage:"<twitch>",
        description:"Kanalın yayında olup olmadığını görün.",
        process : function(bot,msg,suffix) {
            try {
                suffix = suffix.replace(' ', '');
                ttvc.streams({ channel: suffix }, function(err, response) {
                    if(err) throw new Error (err);
                    if(response.stream == null) {
                        bot.sendMessage(msg.channel, "Aradığınız yayın kapalı.");
                    } else {
                        var rt = "**Başlık:** " + response.stream.channel.status + "\n";
                            rt += "**Oyun:** " + response.stream.game + "\n";
                            rt += "**İzleyici:** " + response.stream.viewers + "\n";
                            rt += "**Link:** <" + response.stream.channel.url + ">\n";
                            bot.sendMessage(msg.channel, rt);
                    }
                });
            } catch(e) {
                logger.debug("Error !ttv at " + msg.channel + " : " + e);
            }
        }
    },
    "saat": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                var date = new Date();
                date.addHours(2);
                bot.sendMessage(msg.channel, date.getHours() + ":" + date.getMinutes());
            } catch (e) {
                logger.debug("Error !saat at " + msg.channel + " : " + e);
            }
        }
    },
    "nosue": {
        usage:"<isim>",
        description:"Kişinin Nosue! statlarini getirir.",
        process: function(bot,msg,suffix) {
            try {
                if(suffix && suffix.length >= 3 && strcon(suffix)){
                var rurl = "http://nosue.me/api/getUserStats.php?username="+ suffix +"&u=KapKeyk&p=25f9e794323b453885f5181f1b624d0b";
                var response = request({url: rurl,json: true }, function (error, response, body) {
                                var rbody = response.body;
                                if(rbody.success) {
                                    var text = "**Std:** " + " #" + rbody["rankSTD"].toLocaleString() + " ( " + rbody["accuracySTD"].toLocaleString() + "% )" + "\n";
                                    text += "**Taiko:** " + " #" + rbody["rankTaiko"].toLocaleString() + " ( " + rbody["accuracyTaiko"].toLocaleString() + "% )" + "\n";
                                    text += "**Ctb:** " + " #" + rbody["rankCTB"].toLocaleString() + " ( " + rbody["accuracyCTB"].toLocaleString() + "% )" + "\n";
                                    text += "**Mania:** " + " #" + rbody["rankMania"].toLocaleString() + " ( " + rbody["accuracyMania"].toLocaleString() + "% )" + "\n";
                                    bot.sendMessage(msg.channel,text);
                                } else {
                                    var text = "**Kişi bulunamadı**";
                                    bot.sendMessage(msg.channel,text);
                                }
                            });
                } else {
                    bot.sendMessage(msg.channel, "!nosue komutuna en az 3 harflik bir parametre vermeniz gerekiyor. \"!nosue KapKeyk\" gibi. ");
                }
            } catch (e) {
                logger.debug("Error !nosue at " + msg.channel + " : " + e);
            }
        }
    },
    "google": {
        usage:"<aranacak şey>",
        description:"google'da arama yapar.",
        process: function(bot,msg,suffix) {
            if(suffix) {
                //suffix = suffix.replace(" ", "%20");
                bot.sendMessage(msg.channel, "<http://www.google.com/search?q=" + encodeURIComponent(suffix) + ">");
            }
        }
    },
    "beatmap": {
        usage:"<aranacak şey>",
        description:"osu beatmap araması yapar.",
        process: function(bot,msg,suffix) {
            if(suffix) {
                //suffix = suffix.replace(" ", "%20");
                bot.sendMessage(msg.channel, "<http://osu.ppy.sh/p/beatmaplist?q=" + encodeURIComponent(suffix) + ">");
            }
        }
    },
    "base": {
        hidden:"1",
        description:"BlackStar'ın işleri", //copipaste xdxd
        process: function(bot,msg,suffix) {
            bot.sendMessage(msg.channel, "**All your base are belong to us.**");
        }
    },
    "sence": {
        hidden:"1",
        description:"BlackStar'ın işleri", //copipaste xdxd
        process: function(bot,msg,suffix) {
            if(suffix) {
                if(Math.random() >= 0.5)
                    bot.sendMessage(msg.channel, "**Evet**");
                else
                     bot.sendMessage(msg.channel, "**Hayır**");
            }
        }
    },
    "faq": {
        usage:":<soru>",
        description:"Sıkça sorulan sorular.",
        process: function(bot,msg,suffix) {
            try {
                if(suffix.startsWith("ekle ")) {
                    if(checkPermission(msg.sender.id, "admin")) {
                        var args = suffix.split(' ');
                        args.shift();
			            var soru = args.shift();
			            var cevap = args.join(' ');
                        faq[soru.toLowerCase()] = cevap;
                        updateFaq();
                        bot.sendMessage(msg.channel, "**Faq listesine \"" + soru + "\" eklendi.**");
                    } else {
                    bot.sendMessage(msg.channel,"**Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
                    }
                } else if(suffix.startsWith("sil ")) {
                    if(checkPermission(msg.sender.id, "admin")) {
                        var args = suffix.split(' ');
                        args.shift();
			            var soru = args.shift();
                        if(faq.hasOwnProperty(soru)) {
                            delete faq[soru.toLowerCase()];
                            updateFaq();
                            bot.sendMessage(msg.channel, "**Faq listesinden \"" + soru + "\" silindi.**");
                        } else {
                            bot.sendMessage(msg.channel, "**\"" + soru + "\" faq listesinde mevcut değil.**");
                        }
                    } else {
                    bot.sendMessage(msg.channel,"**Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
                    }
                } else if(suffix) {
                    var soru = suffix;
                    var mention = false;
                    if(suffix.endsWith(">")) {
                        var args = suffix.split(" ");
                        soru = args.shift();
                        mention = args.join("");
                    }
                    if(faq.hasOwnProperty(soru)) {
                        if(!mention) {
                            bot.sendMessage(msg.channel, "**" + faq[soru] + "**");
                        } else {
                            bot.sendMessage(msg.channel, "**" + mention + ", " + faq[soru] + "**");
                        }
                    } else {
                        bot.sendMessage(msg.channel, "**" + msg.sender + ", \"" + soru + "\" faq listesinde mevcut değil.**");
                    }
                }
            }
            catch (e) {
                logger.debug("Error !faq at " + msg.channel + " : " + e);
            }
        }
    },
    "mesajsil": {
	    hidden: "1",
        usage:"<sayı> <@kişi>",
	    description:"Chate yazılan mesajları siler.",
	    process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "dev")) {
                    if(suffix) {
                        var args = suffix.split(" ");
                        var amount = args.shift();
                        var all = false;
                        var error = false;
                        if(amount.startsWith("<")) {
                            var userid = amount.substring(2, amount.length-1);
                        } else if(args.length > 0) {
                            var userid = args.shift();
                            if(userid.startsWith("<")) {
                                userid = userid.replace("<@", "");
                                userid = userid.replace(">", "");
                            } else {
                                bot.sendMessage(msg.channel, "**Lütfen geçerli bir kişi giriniz.** Kullanım : \"!mesajsil <sayı> <kişi>\"");
                                error = true;
                            }
                        } else {
                            var userid = false;
                        }
                        if(amount == "hepsi") {
                            all = true;
                        } else if(!numcon(amount)) {
                            bot.sendMessage(msg.channel, "**Lütfen geçerli bir sayı giriniz.** Kullanım : \"!mesajsil <sayı> <kişi>\"");
                            error = true;
                        }
                        if(!error) {
                            bot.deleteMessage(msg);
        	                var msjlar = msg.channel.messages;
                            var count = 0;
        	                for(var i = msjlar.length - 1; i > -1; i--) {
                                if(count >= amount) {
                                    break;
                                }
                                if(userid) {
                                    if(msjlar[i].sender.id == userid) {
            	                        bot.deleteMessage(msjlar[i]);
                                        if(!all) {
                                            count++;
                                        }
            	                    }
                                } else {
                                    bot.deleteMessage(msjlar[i]);
                                    if(!all) {
                                        count++;
                                    }
                                }
        	                }
                        }
                    } else {
                        bot.sendMessage(msg.channel, "**\"!mesajsil\" komutunun kullanımında bir hata olmuşa benziyor, lütfen girdiğiniz komutu tekrar gözden geçiriniz.** Kullanım : \"!mesajsil <sayı> <kişi>\" ya da \"!mesajsil <kişi>\"");
                    }
	            }
	        } catch(e) {
	            logger.debug("Error !mesajsil at " + msg.channel + " : " + e);
	        }
	    }
	},
	"toggle": {
	    hidden: "1",
	    process: function(bot,msg,suffix) {
	        try {
	            if(checkPermission(msg.sender.id, "admin")) {
	                if(suffix == "osu!") {
	                    if(Config.trackGames) {
	                        Config.trackGames = false;
	                        bot.sendMessage(msg.channel, "**osu!** oyununu takip etme bırakıldı.");
                            playingGameList = [];
                            updateConfig();
	                    } else {
	                        Config.trackGames = true;
	                        bot.sendMessage(msg.channel, "**osu!** oyunu takip ediliyor.");
                            updateConfig();
	                    }
	                    updateConfig();
	                } else if(suffix == "login") {
	                    if(Config.trackLogin) {
	                        Config.trackLogin = false;
	                        bot.sendMessage(msg.channel, "Kullanıcı giriş çıkışlarını takip etme bırakıldı.");
                            updateConfig();
	                    } else {
	                        Config.trackGames = true;
	                        bot.sendMessage(msg.channel, "Kullanıcı giriş çıkışları takip ediliyor.");
                            updateConfig();
	                    }
	                    updateConfig();
	                }
	            } else {
	                bot.sendMessage(msg.channel, "**" + msg.sender + ", bu komutu kullanmaya yetkiniz bulunmamaktadır.**");
	            }
	        } catch(e) {
	            logger.debug("Error !toggle at " + msg.channel + " : " + e);
	        }
	    }
	}
};

var caps = {
    "mekanik": "mekanik.png",
    "brainpower2": "brainpower2.png",
    "dabbe": "dabbe.jpg",
    "termos": "termos.jpg",
    "bayrak": "bayrak.jpg",
    "rp": "rareparrot.gif",
    "kont": "kont.jpg",
    "shululu": "shululu.png",
    "kappa": "kappa.png",
    "ayar": "ayar.png",
    "adeyisd": "adeyisd.jpg",
    "dickbutt": "dickbutt.jpg",
    "bangif": "ban.gif",
    "bravo": {
        path: "nonfic/",
        name: "bravo.jpg"
    },
    "like": {
        path: "nonfic/",
        name: "like.png"
    },
    "bach": {
        path: "nonfic/",
        name: "bach.jpg"
    },
    "doge": {
        path: "nonfic/",
        name:"doge.jpg"
    },
    "banaparaver": {
        path: "nonfic/",
        name: "bpv.gif"
    },
    "justdoit": {
        path: "nonfic/",
        name: "justdoit.gif"
    },
    "scream": {
        path: "nonfic/",
        name: "scream.gif"
    },
    "rio": {
        path: "nonfic/",
        name: "rio.jpg"
    },
    "rip": {
        path: "nonfic/",
        name: "rip.png"
    },
    "cahil": {
        process: function() { return ("./caps/cahil/" + (Math.floor(Math.random() * 21)).toString() + ".jpg"); }
    },
    "b8": {
        process: function() { return ("./caps/bait/ " + (Math.floor(Math.random() * 139) + 1).toString() + ".png"); }
    }
};

//}
// <Events> {
bot.on("ready", function () {
	logger.debug("Ready to begin! " + bot.channels.length + " channels are active.");
	load_plugins();
	var gtp = Math.floor(Math.random() * Object.keys(gameList).length) + 1;
	bot.setPlayingGame(gameList[gtp]);
    if(!osuTrServer) {
        osuTrServer = bot.servers.get("id", osuTrChat);
    }
});

bot.on("disconnected", function () {
    logger.debug("Disconnected!");
    //exec("pm2 restart all", puts);
});

bot.on("message", function (msg) {
    if(msg.author.id != bot.user.id && checklink(msg.content)) {
        var txt = msg.content;
        var mode = txt.substr(txt.indexOf("sh/") + 3, 1);
        if(txt.indexOf("&") > -1 || txt.indexOf("?") > -1)
            txt = txt.substr(0, txt.length-4);
        var numb = txt.match(/\d/g);
        var id = numb.join("");
        getBeatmapDetail(id,msg.channel,mode);

    }
	if(msg.author.id != bot.user.id && (msg.content[0] === prefix || msg.content.indexOf(bot.user.mention()) == 0)) {
	    if(banned.hasOwnProperty(msg.sender.id)) {
            if(banned[msg.sender.id].permanent) {
                bot.sendMessage(msg.channel, "**" + msg.sender + ", bot komutlarını kullanmanız süresiz yasaklanmıştır.**");
                return;
            } else {
                var date1 = new Date(banned[msg.sender.id].time);
                date1.addHours(parseInt(banned[msg.sender.id].hours, 10));
                var banTime = timediff(Date(), date1);
                if(banTime.aseconds < 0) {
                    delete banned[msg.sender.id];
                    updateBanned();
                } else {
                    bot.sendMessage(msg.channel, "**" + msg.sender + ", bot komutlarını kullanmanız" + timeFormatString(banTime.hours, banTime.minutes, banTime.seconds) + " boyunca yasaktır.**");
                    return;
                }
            }
	    }
        logger.debug("treating " + msg.content + " from " + msg.author + " as command at " + msg.channel);
		var cmdTxt = msg.content.split(" ")[0].substring(1);
		cmdTxt = cmdTxt.toLowerCase();
        var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space
        if(msg.content.indexOf(bot.user.mention()) == 0){
			try {
				cmdTxt = msg.content.split(" ")[1];
				cmdTxt = cmdTxt.toLowerCase();
				suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+2);
			} catch(e){ //no command
				//bot.sendMessage(msg.channel,"Efendim ?");
				return;
			}
        }
        if(alias[cmdTxt])
		    cmdTxt = alias[cmdTxt];
		var cmd = commands[cmdTxt];
        if(cmdTxt === "help") {
            //help is special since it iterates over the other commands
            bot.deleteMessage(msg);
            var texttosend = "\n***Kullanılabilir Komutlar:***\n";
			for(var c in commands) {
				var info = "**!" + c;
				var usage = commands[c].usage;
                var hidden = commands[c].hidden;
                var disabled = commands[c].disabled;
                if(hidden || disabled) {
                    continue;
                }
				if(usage){
					info += " " + usage;
				}
				info += "**";
				var description = commands[c].description;
				if(description){
					info += " - " + description;
				}
				texttosend += info + "\r\n";
			}
            bot.sendMessage(msg.author,texttosend);
            return;
        } else if(cmdTxt === "faq" && suffix === "liste") {
            var keys = [];
            var reply = "```Faq Komutları:\n\n";
            for(var k in faq) reply+= k + "\n";
            reply += "```";
            bot.sendMessage(msg.channel, reply);
            return;
        } else if(cmdTxt === "faq" && suffix === "liste detay") {
            bot.sendMessage(msg.channel, "```JSON\n" + JSON.stringify(faq, null, 2) + "```");
            return;
        } else if(cmd) {
			try{
			    if(!cmd.disabled) {
                    if(cmd.delete) {
                        bot.deleteMessage(msg);
                    }
				    cmd.process(bot,msg,suffix);
                }

			} catch(e){
				if(Config.debug){
					bot.sendMessage(msg.channel, "komut " + cmdTxt + " başarısız :(\n" + e.stack);
				}
			}
		} else if(caps.hasOwnProperty(cmdTxt)) {
		    try {
		        var cap = caps[cmdTxt];
		        if(cap.hasOwnProperty("process")) {
		                var path = cap.process();
		                var pic = path.substr(path.lastIndexOf('/')+1);
		                bot.sendFile(msg.channel, path, pic);
		        } else if(cap.hasOwnProperty("path") && cap.hasOwnProperty("name")) {
		                bot.sendFile(msg.channel, "./caps/" + cap.path + cap.name, cap.name);
		        } else {
		            bot.sendFile(msg.channel, "./caps/" + cap, cap);
		        }
		    } catch(e) {
		        logger.debug("Error sending file: " + e);
		    }
		} else {
			if(Config.respondToInvalid){
				bot.sendMessage(msg.channel, "Bilinmeyen Komut " + cmdTxt);
			}
		}
	} else {
		//message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return;
        }

        if(msg.mentions.length > 0 && msg.sender.id !== bot.user.id && msg.content.indexOf(bot.user.mention()) === -1) {
		    var users = msg.mentions;
		    var length = msg.mentions.length;
		    for(var i = 0; i < length; i++) {
		        if(msg.sender.id !== users[i].id) {
			        if(afkList.hasOwnProperty(users[i].id)) {
			            if(afkList[users[i].id].status == "AFK") {
		                    if(afkList[users[i].id].message) {
		                        bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK ve şu mesajı bırakmış: \"" +     afkList[users[i].id].message + "\"**");
		                    } else {
			                    bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK ve muhtemelen sizin @mention'unuza cevap veremez.**");
		                    }
			            } else if(afkList[users[i].id].status == "AFKT") {
			                var h = parseInt(afkList[users[i].id].afkTime.hours, 10);
			                var m = parseInt(afkList[users[i].id].afkTime.minutes, 10) + 1;
			                var date1 = new Date(afkList[users[i].id].time);
			                if(h)
			                    date1.addHours(h);
			                if(m)
			                    date1.addMinutes(m);
					        var afkTime = timediff(Date(), date1);
					        date1.addHours(2);
					        h = parseInt(afkTime.hours, 10);
					        m = parseInt(afkTime.minutes, 10);
			                if(afkList[users[i].id].message) {
			                    if(h && m && h > 0 && m > 0) bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK ve muhtemelen " + h + " saat " + m + " dakika sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek. Ayrıca, bu mesajı bırakmış: \"" + afkList[users[i].id].message + "\"**");
		                        else if(h && h > 0) bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK ve muhtemelen " + h + " saat sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek. Ayrıca, bu mesajı bırakmış: \"" + afkList[users[i].id].message + "\"**");
		                        else if(m && m > 0 && h >= 0) bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK ve muhtemelen " + m + " dakika sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek. Ayrıca, bu mesajı bırakmış: \"" + afkList[users[i].id].message + "\"**");
		                        else bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK fakat şimdiye kadar dönmüş olması lazımdı. (" + date1.getHours() + ":" + date1.getMinutes() + ") Kullanıcı bu mesajı bırakmış: \"" + afkList[users[i].id].message + "\"**");/*ve muhtemelen " + h + " saat " + m + " dakika sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek. Ayrıca, bu mesajı bırakmış: \"" + afkList[users[i].id].message + "\"** (<@134987945827368960> mümkün olmayan kod)");*/
		                    } else {
		                        if(h && m && h > 0 && m > 0) bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK ve muhtemelen " + h + " saat " + m + " dakika sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek.**");
		                        else if(h && h > 0) bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK ve muhtemelen " + h + " saat sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek.**");
		                        else if(m && m > 0 && h >= 0) bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK ve muhtemelen " + m + " dakika sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek.**");
		                        else bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullanıcısı AFK fakat şimdiye kadar dönmüş olması lazımdı. (" + date1.getHours() + ":" + date1.getMinutes() + ")**");/*ve muhtemelen " + h + " saat " + m + " dakika sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek.** (<@134987945827368960> mümkün olmayan kod)");*/
		                    }
			            }
	                }
		        }
		    }
	    }
        if(banned.hasOwnProperty(msg.sender.id)) {
            if(banned[msg.sender.id].permanent) {
                return;
            } else {
                var date1 = new Date(banned[msg.sender.id].time);
                date1.addHours(parseInt(banned[msg.sender.id].hours, 10));
                var banTime = timediff(Date(), date1);
                if(banTime.aseconds < 0) {
                    delete banned[msg.sender.id];
                    updateBanned();
                } else {
                    return;
                }
            }
        }

        if(msg.content.toLowerCase() == "sa" || msg.content.toLowerCase() == "s.a." || msg.content.toLowerCase() == "selamun aleyküm" || msg.content.toLowerCase() == "selamün aleyküm") {
            bot.sendMessage(msg.channel,"Aleyküm Selam " + msg.sender + " Hoşgeldin !");
        }
        //if(msg.content.indexOf("kappa") >= 0 && !msg.content.startsWith('!') && msg.sender.id != "134987945827368960") {
        //    bot.sendFile(msg.channel, './caps/kappa.png', 'kappa.png');
        //}
        //if(msg.content.indexOf("lennyface") > -1 && !msg.content.startsWith('!') && msg.sender.id != bot.user.id) {
        //    bot.deleteMessage(msg);
        //    var nw = msg.content;
        //    while(nw.indexOf("lennyface") > -1)
        //        nw = nw.replace("lennyface","( ͡° ͜ʖ ͡°)");
        //    bot.sendMessage(msg.channel, msg.sender + ": " + nw);
        //}
        /*if (msg.author != bot.user && msg.isMentioned(bot.user)) {
                bot.sendMessage(msg.channel,msg.author + ", sen mi seslendin?");
        }*/
    }
});

bot.on("presence", function(oldUser, newUser) {
	try{
	    if(oldUser.status != "online" && newUser.status == 'online') {
            if(Config.trackLogin) {
                if(osuTrChat && osuTrServer) {
                    if(osuTrServer.members.has(newUser)) {
                        logger.debug(newUser.name + " logged in!");
                        bot.sendMessage(osuTrChat, "**" + newUser.name + "** giriş yaptı!");
                    }
                }
            }
	    	if(messagebox.hasOwnProperty(newUser.id)) {
	    		logger.debug("found message for " + newUser.id);
	    		var message = messagebox[newUser.id];
	    		var channel = bot.channels.get("id",message.channel);
	    		delete messagebox[newUser.id];
	    		updateMessagebox();
	    		bot.sendMessage(channel,message.content);
	    	}
	    }
	    else if(oldUser.status != "offline" && newUser.status == 'offline') {
	    	if(afkList.hasOwnProperty(newUser.id)) {
	    		var channel = bot.channels.get("id", afkList[newUser.id].channel);
	    		bot.sendMessage(channel,"**"+ newUser + " AFK iken Discord'dan çıktı.**");
	    		delete afkList[newUser.id];
	    		updateAfkList();
	    	} else {
	    	    if(Config.trackLogin) {
                    if(osuTrChat && osuTrServer) {
                        if(osuTrServer.members.has(newUser)) {
                            logger.debug(newUser.name + " logged out!");
                            bot.sendMessage(osuTrChat, "**" + newUser.name + "** çıkış yaptı!");
                        }
                    }
	    	    }
            }
	    }
	    if(Config.trackGames && oldUser.game != newUser.game && newUser.game.name == "osu!") {
	        if(osuTrChat && osuTrServer) {
                if(osuTrServer.members.has(newUser) && playingGameList.indexOf(newUser.id) == -1) {
                    playingGameList.push(newUser.id);
                    if(playingGameList.length > 5) {
                        playingGameList.shift();
                    }
                    bot.sendMessage(osuTrChat, "**" + newUser.name + "** \"" + newUser.game.name + "\" oynamaya başladı!");
                }
            }
	    }
	} catch(e) {}
});

bot.on("serverNewMember", function(server, user) {
    if(server.id == osuTrChat) {
        bot.sendMessage(osuTrChatvarm, "**" + user.name + "** aramıza katıldı! Hoş geldin " + user + "!");
    }
});

if(isset(AuthDetails.logtoken)) {
    bot.loginWithToken(AuthDetails.logtoken, function(err,token) {if(err) {logger.debug(err);}});
} else {
    bot.login(AuthDetails.email, AuthDetails.password, function(error,token) {
        try {
            if(isset(token)) {
                AuthDetails["logtoken"] = token;
                updateAuth();
            }
        } catch(e) {

        }
    });
}
//}
