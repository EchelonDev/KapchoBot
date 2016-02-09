// <Logger> {
var log4js = require('log4js');
log4js.replaceConsole();
var logger = log4js.getLogger('cheese');
//}
// <Variables> {
var afkList         = {},
    alias           = {},
    version         = "1.0.0dev",
    banned          = {},
    blackList       = {},
    ChangeBot       = {},
    Config          = {},
    developers      = {},
    Economy         = {},
    gameList        = {},
    osuTRserver     = false,
    osuTRgeneralChannel  = false,
    isDeving        = false,
    jsonFolder      = './json/',
    maastime        = 300,
    maasPara        = 3000,
    colorPara       = 1000000,
    messagebox      = {},
    musicFree       = true,
    nowPlaying      = {},
    Permissions     = {},
    pTimeout        = null,
    Rules           = {},
    selfMention     = false,
    Slot            = {
        "0": ":hearts:",
        "1": ":candy:",
        "2": ":hamburger:",
        "3": ":pizza:",
        "4": ":books:",
        "5": ":pencil2:"
    },
    slotCooldown    = 30,
    slotDeving      = false,
    slotPool        = {},
    songBanned      = {},
    songList        = {},
    trivia          = {},
    triviaIndex     = -1,
    triviaLength    = 0,
    triviaTimeout   = null,
    WhoList         = {};
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
}

var fs              = require('fs'),
    path            = require('path'),
    request         = require("request"),
    TwitchClient    = require("node-twitchtv"),
    ytdl            = require("ytdl-core"),
    Osu             = require('nodesu'),
    country         = require('countryjs');
//}
// <JSON> {
try {
    alias = require(jsonFolder + 'alias.json');
} catch(e) {}
try {
    blackList = require(jsonFolder + 'blackList.json');
} catch(e) {}
try {
    blackList = require(jsonFolder + 'banned.json');
} catch(e) {}
try {
    gameList = require(jsonFolder + "gameList.json");
} catch(e) {}
try {
    messagebox = require(jsonFolder + "messagebox.json");
} catch(e) {}
try {
    songBanned = require(jsonFolder + 'songBanned.json');
} catch(e) {}
try {
    songList = require(jsonFolder + 'songList.json');
} catch(e) {}
try {
    slotPool = require(jsonFolder + "slotPool.json");
} catch(e) {}
try {
    Permissions = require(jsonFolder + "permissions.json");
} catch(e) {}
try {
    Economy = require(jsonFolder + "economy.json");
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
    nowPlaying = require(jsonFolder + "nowPlaying.json");
} catch(e) {}
try {
    trivia = require(jsonFolder + "trivia.json");
} catch(e) {}
//}
// <Required Variables> {
var account         = AuthDetails.ttv;
var bot             = new Discord.Client();
var ttvc            = new TwitchClient(account);
var osuApi          = new Osu.api({apiKey: '4d10da6e0779eada0ca9000f709b612f4643e7fe'});
//}
// <UpdateFile> {
function updateJSON(fnjson, fjson) {
    require("fs").writeFile(jsonFolder + fnjson,JSON.stringify(fjson,null,2), null);
}
function updateSongList(){updateJSON("songList.json", songList);}
function updateAfkList(){updateJSON("afkList.json",afkList);}
function updateSlotPool(){updateJSON("slotPool.json",slotPool);}
function updatePermissions() {updateJSON("permissions.json",Permissions);}
function updateEconomy(){updateJSON("economy.json",Economy);}
function updateRules(){updateJSON("Rules.json",Rules);}
function updateChangeBot(){updateJSON("ChangeBot.json",ChangeBot);}
function updateWhoList(){updateJSON("WhoList.json",WhoList);}
function updateMessagebox(){updateJSON("messagebox.json",messagebox);}
function updateNowPlaying(){updateJSON("nowPlaying.json",nowPlaying);}
function updateAlias(){updateJSON("alias.json",alias);}
function updateSongBanned(){updateJSON("songBanned.json",songBanned);}
function updateBanned(){updateJSON("banned.json",banned);}
function updateAuth(){updateJSON("auth.json",AuthDetails);}
function updateTrivia(){updateJSON("trivia.json",trivia);}
//}
// <setInterval & setTimeout> {
setInterval(function() {
    var gtp = Math.floor(Math.random() * Object.keys(gameList).length) + 1;
    bot.setPlayingGame(gameList[gtp]);
}, 1000 * 60 * 5);
//}
// <Functions> {
function changeTriviaIndex() {
    if(!triviaLength) {
        triviaLength = Object.keys(trivia).length;
    }
    if(triviaTimeout) {
        clearTimeout(triviaTimeout);
    }
    var dakika = 10;
    triviaIndex = Math.floor(Math.random() * triviaLength);
    triviaTimeout = setTimeout(function() {changeTriviaIndex();}, dakika * 60 * 1000);
    var time = new Date();
    time.addMinutes(dakika);
    time.addHours(2);
    if(triviaIndex > -1) {
        bot.sendMessage(osuTRgeneralChannel, "**Trivia sorusu: " + trivia[triviaIndex].soru + " (Cevaplamak için \"!cevap <cevap>\")(Sıradaki soru " + time.getHours() + ":" + time.getMinutes() + "'da sorulacaktır.**");
    }
}
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
        bot.sendMessage(msg.channel, "**<@" + user + "> adlı kullanıcı bot komutlarını " + h + " saat kullanamayacaktır.**");
    } else {
        bot.sendMessage(msg.channel, "**<@" + user + "> adlı kullanıcı bot komutlarını süresiz kullanamayacaktır.**");
    }
}

function blackListed(title)
{
    title = title.toLowerCase();
    if(blackList) {
        for(var i=0;i<Object.keys(blackList).length;i++) {
            if(title.indexOf(blackList[i]) > -1) {
                return true;
            }
        }
    }
    return false;
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

function slotPoolChecker(msg, suffix)
{
    if(suffix == "toplam") {
        bot.sendMessage(msg.channel, "**Slot oyununda toplamda " + parseInt(slotPool["toplam"], 10).toLocaleString() + " ₺ para kaybedilmiş.**");
    }
    else if(slotPool.hasOwnProperty(suffix)){
        if(parseInt(slotPool[suffix], 10) === 0)
            bot.sendMessage(msg.channel, "**<@" + suffix + "> slot oyununda hiç para kaybetmemiş!**");
        else
            bot.sendMessage(msg.channel, "**<@" + suffix + "> slot oyununda " + parseInt(slotPool[suffix], 10).toLocaleString() + " ₺ kaybetmiş ve bu toplam paranın %" + parseInt(parseFloat(100 / (parseFloat(slotPool["toplam"]) / parseFloat(slotPool[suffix]))), 10).toLocaleString() + " kadarı.**");
    }
    else {
        bot.sendMessage(msg.channel, "**<@" + suffix + "> daha hiç slot oynamamış.**");
    }
}

function playSlot(msg, suffix, all, maas)
{
    var lost = false;
    if(suffix) {
        suffix = parseInt(suffix, 10);
    }
    if(suffix && suffix >= 5 && suffix <= 100000000000) {
        if(Economy.hasOwnProperty(msg.sender.id)){
            if(Economy[msg.sender.id].money >= suffix) {
                var stime = slotCooldown;
                var texttosend = "";
                var dateoflast = Economy[msg.sender.id].slotTime;
                var diff = timediff(dateoflast, Date());

                if(diff.aseconds >= stime || (slotDeving && developers.hasOwnProperty(msg.sender.id))) {
                    var bet = parseInt(suffix, 10);
                    var prize = 0;
                    var win = 0;
                    var val1 = Math.floor(Math.random() * 6);
                    var val2 = Math.floor(Math.random() * 6);
                    var val3 = Math.floor(Math.random() * 6);
                    texttosend += " " + msg.sender;
                    texttosend += "\n> " + Slot[val1] + " " + Slot[val2] + " " + Slot[val3];
                    switch (slotChecker(val1,val2,val3)) {
                        case 1: texttosend += "  [5x]"; prize = 5 * bet; win = 1; break;
                        case 2: texttosend += "  [1.5x]"; prize = 1.5 * bet; win = 1; break;
                        case 3: texttosend += "  [0x]"; break;
                    }
                    if(all) {
                        texttosend += "\n" + parseInt(Economy[msg.sender.id].money, 10).toLocaleString() + " ₺ paranızın hepsini bahis oynadınız. ";
                    } else if(maas){
                        texttosend += "\n" + maasPara.toLocaleString() + " ₺ maaşınızın hepsini bahis oynadınız. ";
                    } else {
                        texttosend += "\n" + parseInt(Economy[msg.sender.id].money, 10).toLocaleString() + " ₺ paranızdan " + bet.toLocaleString() + " ₺ bahis oynadınız.";
                    }
                    Economy[msg.sender.id].money -= bet;
                    if(win) {
                        if(!slotPool.hasOwnProperty(msg.sender.id))
                            slotPool[msg.sender.id] = 0;
                        if(!slotPool.hasOwnProperty("toplam"))
                            slotPool["toplam"] = 0;
                        updateSlotPool();
                        texttosend += "\n" + parseInt(prize - bet, 10).toLocaleString() + " ₺ kazandınız ve şu anki paranız " + parseInt(Economy[msg.sender.id].money + prize, 10).toLocaleString() + " ₺";
                    }
                    else {
                        texttosend += "\nKazanamadınız ve şu anki paranız " + parseInt(Economy[msg.sender.id].money, 10).toLocaleString() + " ₺";
                        lost = true;
                        if(slotPool.hasOwnProperty(msg.sender.id))
                            slotPool[msg.sender.id] += parseInt(bet, 10);
                        else
                            slotPool[msg.sender.id] = parseInt(bet, 10);
                        if(slotPool.hasOwnProperty("toplam"))
                            slotPool["toplam"] += bet;
                        else
                            slotPool["toplam"] = bet;
                        updateSlotPool();
                    }
                    Economy[msg.sender.id].money += prize;
                    Economy[msg.sender.id].slotTime = Date();
                    updateEconomy();
                    if(all && lost) {
                        bot.sendFile(msg.channel, './caps/nonfic/rip.png', 'rip.png');
                    }
                    bot.sendMessage(msg.channel, texttosend);
                }
                else if(diff.aseconds < stime) {
                    bot.sendMessage(msg.channel, "**<@" + msg.sender.id + ">, bir sonraki slotunuz için "+ (stime - diff.aseconds) +" saniye beklemeniz gerekmektedir.**");
                }
            } else {
                bot.sendMessage(msg.channel, "**<@" + msg.sender.id + ">, yeterli paraya sahip değilsiniz.**");
            }
        } else {
            bot.sendMessage(msg.channel, "**<@" + msg.sender.id + "> bir hesaba sahip değil.**");
        }
    } else {
        bot.sendMessage(msg.channel,msg.sender + ", bahisiniz 5 ile " + parseInt(100000000000, 10).toLocaleString() + " arasında olmalıdır.");
    }
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

function slotChecker(a,b,c) {
    if(a==b && b==c){
        return 1;
    }
    else if(a == b || b == c || a == c){
        return 2;
    }
    else {
        return 3;
    }
}

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
        "\n[" + response[0].version + "] (" + response[0].bpm + "BPM" + ") " +
        round(response[0].difficultyrating, 2) + "���" +
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
        "\n[" + response[0].version + "] (" + response[0].bpm + "BPM" + ") " +
        round(response[0].difficultyrating, 2) + "★" +
        "\n**AR**: " + response[0].diff_approach +
        " **CS**: " + response[0].diff_size +
        " **OD**: " + response[0].diff_overall +
        " **HP**: " + response[0].diff_drain;
        bot.sendMessage(chan,rp);
        return;
        });
    }
}

function alpha2full(ct) {
    return country.name(ct);
}

function osustat(userName,chan) { // add mod support
    /*var rmod = 0;
    switch (mod)
    {
        case "osu": rmod = 0; break;
        case "taiko": rmod = 1; break;
        case "ctb": rmod = 2; break;
        case "mania": rmod = 3; break;
    }  */
    osuApi.getUser(osuApi.user.byUsername(userName), function(err, response) {
       if (err || response == null) {
           return false;
       }
       var rp =
       "\nhttps://a.ppy.sh/"+ response.user_id +
       "\n" + response.username + "\n**PP**: " +
       (Math.round(response.pp_raw * 100)/100).toFixed(0) +
       " (**#**" + parseFloat(response.pp_rank).toLocaleString() +
       ")\n**Level**: " + (Math.round(response.level * 100)/100).toFixed(0) +
       " (" + parseFloat(response.playcount).toLocaleString() +
       ")\n**Accuracy**: " + (Math.round(response.accuracy * 100)/100).toFixed(2) +
       "\n**Country**: " + alpha2full(response.country) + "\nhttps://osu.ppy.sh/u/" + response.user_id;
       bot.sendMessage(chan,rp);
    });
}

function strcon(str) {
    if(/^[a-zA-Z0-9-_]+( [a-zA-Z0-9-_]+)*$/.test(str))
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
    return "O kim bilmiyorum :cry:";
}

function getSongInfoFromID(msg,id) {
    ytdl.getInfo("https://www.youtube.com/watch?v=" + id, function(err, info) {
        if(err) {
            return err;
        }
        var name = info["title"];
        bot.sendMessage(msg.channel, "**Çalıyor : **" + name);
    });
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

function paraTop5(bot, msg)
{
    var obj = Economy;
    var result = [];

	for(var k in obj) {
	    if(obj[k].played) {
		    result.push([k, obj[k]]);
	    }
	}

	result = result.sort(function(a, b) {
		if (a[1].money > b[1].money) return -1;
		if (a[1].money < b[1].money) return 1;
		return 0;
	});
	
	var length = result.length;
	if(length > 5) length = 5;
	var reply = "**";
	for(var  i=0;i<length;i++) {
	    var userid = result[i][0];
	    var para = parseInt(result[i][1].money, 10);
	    var user = bot.users.get("id", userid);
	    var self = false;
	    if(user == msg.sender)
	        self = true;
	    var paraStr = parseInt(para, 10).toLocaleString();
	    
	    if(self) {
	        reply += (i+1) + ".) " + user + " kullanıcısının " + paraStr + "₺ parası var.\r\n";
	    }
	    else {
		    reply += (i+1) + ".) " + user.name + " kullanıcısının " + paraStr + "₺ parası var.\r\n";
	    }
	}
	reply+= "**";
	bot.sendMessage(msg.channel, reply);
}

function slotPoolTop5(bot, msg)
{
    var obj = slotPool;
    var result = [];

	for(var k in obj)
		result.push([k, obj[k]]);

	result = result.sort(function(a, b) {
		if (a[1] > b[1]) return -1;
		if (a[1] < b[1]) return 1;
		return 0;
	});
	var toplam = result[0][1];
	var length = result.length;
	if(length > 5) length = 5;

	var reply = "**";
	for(var  i=1;i<=length;i++) {
	    var user = "";
	    var userid = result[i][0];
	    var para = parseInt(result[i][1], 10);
	    user = bot.users.get("id", userid);
	    var self = false;
	    if(user == msg.sender)
	        self = true;

	    var paraStr = parseInt(para, 10).toLocaleString();
	    if(self) {
	        reply += i + ".) " + user + " kullanıcısı " + paraStr + "₺ para kaybetmiş. (%" + parseFloat(100 / (parseFloat(toplam) / parseFloat(para))).toFixed(2) + ")\n";
	    }
	    else {
		    reply += i + ".) " + user.username + " kullanıcısı " + paraStr + "₺ para kaybetmiş. (%" + parseFloat(100 / (parseFloat(toplam) / parseFloat(para))).toFixed(2) + ")\n";
	    }
	}
	reply+= "**";
	bot.sendMessage(msg.channel, reply);
}

function checklink(link) {
      if(/(https:\/\/osu.ppy.sh\/s\/)+(\d+\s)+/.test(link + " ") || /(http:\/\/osu.ppy.sh\/s\/)+(\d+\s)+/.test(link + " ") || /(https:\/\/osu.ppy.sh\/b\/)+(\d+\s)+/.test(link + " ") || /(http:\/\/osu.ppy.sh\/b\/)+(\d+\s)+/.test(link + " ") )
          return true;
      return false;
}

function stopPlaying() {
    if(bot.voiceConnection)
        bot.voiceConnection.stopPlaying(); // this is how we stop the sound yay!
    clearTimeout(pTimeout);
    pTimeout = null;
    nowPlaying = {
        startTime: false,
        songName: false,
        songID: false,
        songLength: false,
        submitterName: false,
        submitterID: false
    };
    updateNowPlaying();
}

function playFromList(msg) {
    if(songList) {
        var songs = Object.keys(songList).map(function(k) {return songList[k];});
        if(songs.length > 0) {
            var next = songs.shift();
            songList = {};
            for(var i = 0; i < songs.length; i++)
                songList[i] = songs[i];
            updateSongList();
            playFromID(msg, next.songID, next);
        } else {
            bot.sendMessage(osuTRgeneralChannel, "**Listede çalınacak şarkı yok!**");
        }
    } else {
        bot.sendMessage(osuTRgeneralChannel, "**Hata : Şarkı listesi bulunamadı! Lütfen bir programcı ile görüşün.**");
    }
}

function playFromID(msg, suffix, pInfo) {
    if(pTimeout) { // eğer şarkının bitişi için bir timeout atanmışsa
        stopPlaying();
    }
    if(!isset(pInfo))
        pInfo = false;
    if(bot.voiceConnection) {
        ytdl.getInfo("https://www.youtube.com/watch?v=" + suffix, function(err, info) {
            if(err) {
                logger.debug("Error ytdl.getInfo: " + err);
            }
            if(isset(info)) {
                if(pInfo) {
                    bot.sendMessage(osuTRgeneralChannel, "**Şu an çalıyor : " + info["title"] + " / Ekleyen: " + pInfo.submitterName + "**");
                } else {
                    bot.sendMessage(osuTRgeneralChannel, "**Şu an çalıyor : " + info["title"] + " / Ekleyen: " + msg.sender.name + "**");
                }
                var yturl = "https://request-kapkeyk.c9users.io:8081/?data=" + suffix;
                var stream = request(yturl);
                bot.voiceConnection.playRawStream(stream,{Volume : 0.2});
                pTimeout = setTimeout(
                    function() {
                        bot.sendMessage(osuTRgeneralChannel, "**Çalan şarkı bitti.**");
                        stopPlaying();
                        playFromList(msg);
                    },
                    (parseInt(info["length_seconds"],10) + 2) * 1000
                );
                if(pInfo) {
                    nowPlaying = {
                        startTime: Date(),
                        songName: info["title"],
                        songID: suffix,
                        songLength: info["length_seconds"],
                        submitterName: pInfo.submitterName,
                        submitterID: pInfo.submitterID
                    };
                } else {
                    nowPlaying = {
                        startTime: Date(),
                        songName: info["title"],
                        songID: suffix,
                        songLength: info["length_seconds"],
                        submitterName: msg.sender.name,
                        submitterID: msg.sender.id
                    };
                }
                updateNowPlaying();
            } else {
                bot.sendMessage(osuTRgeneralChannel, "**Şarkı bulunamadı. Çalınan şarkı Amerika'da yasaklı olabilir.**");
            }
        });
    } else {
        var discoch = bot.channels.get("id", "134677180113354753");
        if(discoch)
            bot.joinVoiceChannel(discoch, function(err, connection) {
                if(err) {
                    logger.debug("Error playFromID: " + err);
                }
                if (connection) playFromID(msg, suffix, pInfo);
            });
    }
}

function getYoutubeIDFromLink(link)
{
    if(/^http:\/\/(?:www.)?youtube.com\/watch?(?=.*v=\w+)(?:\S+)?$/.test(link) || /^https:\/\/(?:www.)?youtube.com\/watch?(?=.*v=\w+)(?:\S+)?$/.test(link)) {
        return true;
    }
    return false;
}

function checkRole(servername, user, role) {
    var server = bot.servers.get("name", servername);
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
    "trivia": {
        hidden:"1",
        disabled:1,
        description: "Şu anki trivia sorusunu gösterir.",
        process: function(bot, msg, suffix) {
            try {
                if(checkPermission(msg.sender.id,"dev") && msg.channel.server.name == osuTRserver) {
                    if(triviaIndex > -1 && !triviaTimeout) {
                        //bot.sendMessage(osuTRgeneralChannel, "**Trivia sorusu: " + trivia[triviaIndex].soru + " (Cevaplamak için \"!cevap <cevap>\")**");
                        changeTriviaIndex();
                    }
                }
            } catch(e) {
                 logger.debug("Error !trivia at " + msg.channel + " : " + e);
            }
        }
    },
    "cevap": {
        hidden:"1",
        disabled:1,
        description: "Şu anki trivia sorusunu cevaplar.",
        process: function(bot, msg, suffix) {
            if(checkPermission(msg.sender.id,"dev") && msg.channel.server.name == osuTRserver) {
                if(triviaIndex > -1) {
                    if(suffix == trivia[triviaIndex].cevap) {
                        bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + " trivia sorusunu bildi! (Ödül, vs vs, tamamlanmamış...) Yeni bir soru seçiliyor...**", false, function() {changeTriviaIndex();});
                    //ödül verme, vs vs, tamamlanmamış
                    }
                }
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
                console.log(msg.sender + " requested the bot status.");
                bot.sendMessage(msg, msgArray);
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
                        msgArray.push("Kanal: " + msg.channel + " (ID: " + msg.channel.id + ")\n");
                        msgArray.push("Server: **" + msg.channel.server.name + "** (ID: " + msg.channel.server.id + ") (Ülke: " + msg.channel.server.region + ")\n");
                        msgArray.push("Server sahibi: " + msg.channel.server.owner + " (ID: " + msg.channel.server.owner.id + ")\n");
                        if (msg.channel.topic) { msgArray.push("Kanal konusu: " + msg.channel.topic); }
                        bot.sendMessage(msg, msgArray);
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
                if(checkPermission(msg.sender.id, "admin")) {
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
                if(checkPermission(msg.sender.id, "admin")) {
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
    "müzikban":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "admin") && msg.channel.server.name == osuTRserver) {
                    if(suffix) {
                        var args = suffix.split(' ');
                        var user = args.shift();
                        if(user.startsWith("<@")) {
                            user = user.replace("<@","");
                            user = user.replace(">","");
                        }
                        var h = false;
                        var perm = true;
                        if(args.length > 0) {
                            h = args.join(' ');
                            perm = false;
                        }
                        songBanned[user] = {
                            permanent: perm,
                            time: Date(),
                            hours: h
                        };
                        updateSongBanned();
                        if(h) {
                            bot.sendMessage(osuTRgeneralChannel, "**<@" + user + "> kullanıcısının çalma listesine müzik eklemesi " + h + " saat yasaklanmıştır.**");
                        }
                        else {
                            bot.sendMessage(osuTRgeneralChannel, "**<@" + user + "> kullanıcısının çalma listesine müzik eklemesi süresiz yasaklanmıştır.**");
                        }
                    }
                }
            }
            catch (e){
                logger.debug("Error !müzikban at " + msg.channel + " : " + e);
            }
        }
    },
    "müziksınır":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "admin") && msg.channel.server.name == osuTRserver) {
                    musicFree = !musicFree;
                    if(musicFree) {
                        bot.sendMessage(osuTRgeneralChannel, "**Çalma listesine şarkı ekleme şu an sadece \"Regular Users\" ve üzeri kullanıcılara açıktır.**");
                    } else {
                        bot.sendMessage(osuTRgeneralChannel, "**Çalma listesine şarkı ekleme şu an herkese açıktır.**");
                    }
                }
            }
            catch (e){
                logger.debug("Error !müziksınır at " + msg.channel + " : " + e);
            }
        }
    },
    "müzikunban":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "admin") && msg.channel.server.name == osuTRserver) {
                    if(suffix) {
                        var args = suffix.split(' ');
                        var user = args.shift();
                        if(user.startsWith("<@")) {
                            user = user.replace("<@","");
                            user = user.replace(">","");
                        }
                        delete songBanned[user];
                        updateSongBanned();
                        bot.sendMessage(osuTRgeneralChannel, "**<@" + user + "> kullanıcısının çalma liste yasağı kaldırılmıştır.**");
                    }
                }
            }
            catch (e){
                logger.debug("Error !müzikunban at " + msg.channel + " : " + e);
            }
        }
    },
    "say":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(suffix && checkPermission(msg.sender.id, "dev")) {
                    bot.sendMessage(osuTRgeneralChannel, "**" + suffix + "**");
                }
            }
            catch (e){
                logger.debug("Error !say at " + msg.channel + " : " + e);
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
                        bot.sendMessage(msg.sender, "**\"" + alis + " : " + org + "\" eklenmiştir.**");
                    } else if(cmd == "sil") {
                        if(alias.hasOwnProperty(alis)) {
                            delete alias[alis];
                            updateAlias();
                            bot.sendMessage(msg.sender, "**\"" + alis + "\" silinmiştir.**");
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
                bot.sendMessage(msg.channel, "**Bye!**", false, function() { process.exit(0); });
            }
        }
    },
    "afk": {
        usage: "<bırakacağınız mesaj>",
		description: "Kişinin durumunu AFK yapar",
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
				            if(h && m) bot.sendMessage(msg.channel, "**" + msg.sender + " " + h + " saat " + m + " dakika boyunca AFK.**");
				            else if(h) bot.sendMessage(msg.channel, "**" + msg.sender + " " + h + " saat boyunca AFK.**");
				            else if(m) bot.sendMessage(msg.channel, "**" + msg.sender + " " + m + " dakika boyunca AFK.**");
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
	"afkzaman": {
	    disabled:1,
        usage:"<AFK kalacağınız süre> <bırakacağınız mesaj>",
		description: "Kişinin durumunu belirli bir süre sonra dönmek üzere ayarlar.",
		process: function(bot,msg,suffix) {
			if(afkList.hasOwnProperty(msg.sender.id)){
				if(afkList[msg.sender.id].status == "AFK" || afkList[msg.sender.id].status == "AFKT") {
					var date1 = afkList[msg.sender.id].time;
					var afkTime = timediff(date1, Date());
					delete afkList[msg.sender.id];
					updateAfkList();
					var reply = "**" + msg.sender + " artık AFK değil,";

					var isAfter = 0;

					if(afkTime.hours) {
						if(!isAfter) {
							isAfter = 1;
						}
						reply += " " + afkTime.hours + " saat";
					}
					if(afkTime.minutes) {
						if(!isAfter) {
							isAfter = 1;
						}
						reply+= " " + afkTime.minutes + " dakika";
					}
					if(afkTime.seconds) {
						if(!isAfter) {
							isAfter = 1;
						}
						reply+= " " + afkTime.seconds + " saniye";
					}
					if(isAfter)
					    reply+= " sonra";
					reply += " geri döndü.**";!
					bot.sendMessage(msg.channel, reply);
				}
			}
			else {
			    if(suffix) {
			        var args = suffix.split(' ');
    			    var t = args.shift();
    			    var afkMessage = args.join(' ');

			        var h = t.substring(0, t.indexOf('s'));
			        var m = t.substring(0, t.indexOf('d'));
			        if(h && m) m = t.substring(t.indexOf('s') + 1, t.indexOf('d'));

			        var accepted = false;
			        if(h || m) {
			            if(h && m && numcon(h) && numcon(m)) accepted = true;
			            if(!m && h && numcon(h)) accepted = true;
			            if(!h && m && numcon(m)) accepted = true;
			            if(accepted) {
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
			                if(h && m) bot.sendMessage(msg.channel, "**" + msg.sender + " " + h + " saat " + m + " dakika boyunca AFK.**");
				            else if(h) bot.sendMessage(msg.channel, "**" + msg.sender + " " + h + " saat boyunca AFK.**");
				            else if(m) bot.sendMessage(msg.channel, "**" + msg.sender + " " + m + " dakika boyunca AFK.**");
				            else bot.sendMessage(msg.channel, "**" + msg.sender + " artık AFK.** (<@134987945827368960> mümkün olmayan kod)");
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
			                bot.sendMessage(msg.channel, "**" + msg.sender + " artık AFK. (Zaman kabul edilmedi)**");
			            }
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
    "slothavuz": {
        hidden:"1",
        usage:"<kişi/top>",
        description:"Kişinin (ya da top 5'in) slot makinesinde ne kadar para kaybettiğini gösterir.",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(suffix == "toplam") {
                      slotPoolChecker(msg, "toplam");
                    }
                    else if (suffix == "top") {
                        slotPoolTop5(bot, msg);
                    }
                    else if(suffix && suffix.startsWith('<@')) {
                        suffix = suffix.replace("<@","");
                        suffix = suffix.replace(">","");
                        slotPoolChecker(msg, suffix);
                        }
                    else if(suffix) {
                        bot.sendMessage(msg.channel, "** O kim ? **");
                    }
                    else {
                        slotPoolChecker(msg, msg.sender.id);
                    }
            }
            } catch(e){
                logger.debug("Error !slothavuz at " + msg.channel + " : " + e);
            }
      }
    },
    "slot": {
        hidden:"1",
        usage:"<miktar>",
        description:"Slot oynayın !",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(suffix == "all") {
                        if(Economy.hasOwnProperty(msg.sender.id)) {
                            playSlot(msg, Economy[msg.sender.id].money, true, false);
                        }
                    } else if(suffix == "maaş" || suffix == "maas") {
                        var dateoflast = Economy[msg.sender.id].time;
                        var dateoflasts = Economy[msg.sender.id].slotTime;
                        var diff = timediff(dateoflast, Date());
                        var diff2 = timediff(dateoflasts, Date());
                        if(diff.aseconds < maastime) {
                             bot.sendMessage(msg.channel, "**<@" + msg.sender.id + ">, bir sonraki maaşınız için "+ (maastime - diff.aseconds) +" saniye beklemeniz gerekmektedir.**");
                        } else if(diff2.aseconds < slotCooldown)  {
                            bot.sendMessage(msg.channel, "**<@" + msg.sender.id + ">, bir sonraki slotunuz için "+ (slotCooldown - diff.aseconds) +" saniye beklemeniz gerekmektedir.**");
                        } else if(diff.aseconds >= maastime) {
                            var curMoney = parseInt(Economy[msg.sender.id].money, 10);
                            Economy[msg.sender.id].money = curMoney + maasPara;
                            Economy[msg.sender.id].time = Date();
                            updateEconomy();
                            playSlot(msg, maasPara, false, true);
                        }
                    }
                    else {
                        playSlot(msg, suffix, false, false);
                    }
                }
            } catch(e) {
                logger.debug("Error !slot at " + msg.channel + " : " + e);
            }
        }
    },
    "slot3kazanım": {
        disabled:1,
        hidden:"1",
        description:"Slot 3 kazanım durumları ve ödülleri.",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                bot.sendMessage(msg.channel, "\
3'lü tutturma = [5x] > :four:-:four:-:four:\r\n\
2'li tutturma = [1.5x] > :four:-:four:-:two:\r\n\
                ");
                 }
            } catch(e) {
                logger.debug("Error !slot3kazanma at " + msg.channel + " : " + e);
            }
        }
    },
    "ekonomi": {
        hidden:"1",
        description:"Ekonomi yardım ve komutları !",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    var textowrite = "**Ekonomi:**\
                    \nUyeliğinizi aldıktan sonra paranız bankada saklanır.\
                    \nParanızla slot oynayabilir veya başkasına aktarabilirsiniz.\
                    \nLütfen oyununuzu <#144816900591976448> odasında oynayın.\
                    \n**Komutlar:**\n!maaş : Maaşınızı alın. (300 saniye cooldown)\
                    \n!para : Kişinin hesabında kaç parası olduğunu gösterir.\
                    \n!paraver @isim miktar : birine para gönderin.\
                    \n!register : Bankaya kaydolun.";
                    bot.sendMessage(msg.channel,textowrite);
                    logger.debug("Sending !ekonomi to " + msg.channel);
                }
            }
            catch (e){
                logger.debug("Error !ekonomi at " + msg.channel + " : " + e);
            }
        }
    },
    "maaş": {
        hidden: "1",
        desciption:"Maaşınızı alın. (600 saniye cooldown)",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(Economy.hasOwnProperty(msg.sender.id)){
                        var dateoflast = Economy[msg.sender.id].time;
                        var diff = timediff(dateoflast, Date());
                        if(diff.aseconds < maastime) {
                             bot.sendMessage(msg.channel, "**<@" + msg.sender.id + ">, bir sonraki maaşınız için "+ (maastime - diff.aseconds) +" saniye beklemeniz gerekmektedir.**");
                        } else if(diff.aseconds >= maastime) {
                            var curMoney = parseInt(Economy[msg.sender.id].money, 10);
                            Economy[msg.sender.id].money = curMoney + maasPara;
                            Economy[msg.sender.id].time = Date();
                            updateEconomy();
                            bot.sendMessage(msg.channel, "**<@" + msg.sender.id + ">, maaşınız yatırıldı ! (+" + maasPara + " ₺).**");
                        }
                    } else {
                        bot.sendMessage(msg.channel, "**<@" + msg.sender.id + "> bir hesaba sahip değil.**");
                    }
                }
            } catch(e){
                logger.debug("Error !maaş at " + msg.channel + " : " + e);
            }
        }
    },
    "paraver": {
        hidden:"1",
        desciption:"Kişiye para gönderir!",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    var args = suffix.split(' ');
			        var user = args.shift();
			        var message = args.join(' ');
			        if(message == "all")
			            message = parseInt(Economy[msg.sender.id].money);
                    if(numcon(message) || numconf(message)) {
                            if(user && user.startsWith('<@')) {
                                if(user == msg.sender) {
                                    bot.sendMessage(msg.channel, msg.sender + " kendi kendine mi para göndermeye çalışıyorsun?");
                                    return;
                                }
                                user = user.replace("<@","");
                                user = user.replace(">","");
                                if(Economy.hasOwnProperty(user) && Economy.hasOwnProperty(msg.sender.id)){
                                    var msgcurMoney = Economy[msg.sender.id].money;
                                    var moneytosend = parseInt(message);
                                    if(msgcurMoney < moneytosend) {
                                        bot.sendMessage(msg.channel, msg.sender + ", yeterli paranız yok.");
                                    } else {
                                        Economy[user].money += moneytosend;
                                        Economy[msg.sender.id].money -= moneytosend;
                                        bot.sendMessage(msg.channel, msg.sender + " <@" + user + "> adlı kullanıcıya " + moneytosend.toLocaleString() + " ₺ para gönderdi.");
                                        updateEconomy();
                                    }
                                } else{
                                    bot.sendMessage(msg.channel, "**<@" + msg.sender.id + "> yada <@"+ user +"> bir hesaba sahip değil.**");
                                }
                            } else {
                                bot.sendMessage(msg.channel, "** O kim ? **");
                            }
                    } else {
                        bot.sendMessage(msg.channel, "**Bir numara giriniz.**");
                    }
                }
            } catch(e){
                logger.debug("Error !para at " + msg.channel + " : " + e);
            }
        }
    },
    "give": {
        hidden:"1",
        desciption:"Kişiye para ekler!",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    var args = suffix.split(' ');
			        var user = args.shift();
			        var message = args.join(' ');
                    if(numcon(message) || numconf(message)) {
                        if(checkPermission(msg.sender.id, "ekonomi")) {
                            if(user && user.startsWith('<@')) {
                                user = user.replace("<@","");
                                user = user.replace(">","");
                                if(Economy.hasOwnProperty(user)){
                                    Economy[user].money += parseInt(message, 10);
                                    updateEconomy();
                                } else {
                                    bot.sendMessage(msg.channel, "**<@" + user + "> bir hesaba sahip değil.**");
                                }
                            } else {
                                if(Economy.hasOwnProperty(msg.sender.id)){
                                    //say kaç para
                                } else {
                                    bot.sendMessage(msg.channel, "**<@" + msg.sender.id + "> bir hesaba sahip değil.**");
                                }
                            }
                        } else {
                            bot.sendMessage(msg.channel, "**Bu komudu kullanabilmek için yetkiye sahip değilsiniz.**");
                        }
                    } else {
                        bot.sendMessage(msg.channel, "**Bir numara giriniz.**");
                    }
                }
            } catch(e){
                logger.debug("Error !para at " + msg.channel + " : " + e);
            }
        }
    },
    "take": {
        hidden:"1",
        desciption:"Kişiden para siler!",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    var all = false;
                    if(suffix.indexOf("all") > 0)
                        all = true;
                    var args = suffix.split(' ');
			        var user = args.shift();
			        var message = args.join(' ');
                    if(numcon(message) || numconf(message) || all) {
                        if(checkPermission(msg.sender.id, "ekonomi")) {
                            if(user && user.startsWith('<@')) {
                                user = user.replace("<@","");
                                user = user.replace(">","");
                                if(Economy.hasOwnProperty(user)){
                                    if(all) {
                                        Economy[user].money = 0;
                                    }
                                    var curMoney = Economy[user].money;
                                    if(curMoney - parseInt(message, 10) >= 0)
                                        Economy[user].money -= parseInt(message, 10);
                                    else
                                        Economy[user].money = 0;
                                    updateEconomy();
                                } else {
                                    bot.sendMessage(msg.channel, "**<@" + user + "> bir hesaba sahip değil.**");
                                }
                            } else {
                                if(Economy.hasOwnProperty(msg.sender.id)){
                                    //say kaç para
                                } else {
                                    bot.sendMessage(msg.channel, "**<@" + msg.sender.id + "> bir hesaba sahip değil.**");
                                }
                            }
                        } else {
                            bot.sendMessage(msg.channel, "**Bu komudu kullanabilmek için yetkiye sahip değilsiniz.**");
                        }
                    } else {
                        bot.sendMessage(msg.channel, "**Bir numara giriniz.**");
                    }
                }
            } catch(e){
                logger.debug("Error !para at " + msg.channel + " : " + e);
            }
        }
    },
    "para": {
        hidden:"1",
        desciption:"Kişinin hesabında kaç parası olduğunu gösterir !",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(suffix == "top") {
                        paraTop5(bot, msg);
                    } else if(suffix && suffix.startsWith('<@') && suffix.indexOf('>') > -1) {
                        suffix = suffix.substring(suffix.indexOf('<@'), suffix.indexOf('>'));
                        suffix = suffix.replace("<@","");
                        suffix = suffix.replace(">","");
                        if(Economy.hasOwnProperty(suffix)){
                            bot.sendMessage(msg.channel, "**<@" + suffix + "> " + parseInt(Economy[suffix].money, 10).toLocaleString() + " ₺ paraya sahip!" +"**");
                        } else {
                            bot.sendMessage(msg.channel, "**<@" + suffix + "> bir hesaba sahip değil.**");
                        }
                    } else {
                        if(Economy.hasOwnProperty(msg.sender.id)){
                             bot.sendMessage(msg.channel, "**<@" + msg.sender.id + "> " + parseInt(Economy[msg.sender.id].money, 10).toLocaleString() + " ₺ paraya sahip!" +"**");
                        } else {
                            bot.sendMessage(msg.channel, "**<@" + msg.sender.id + "> bir hesaba sahip değil.**");
                        }
                    }
                }
            } catch(e){
                logger.debug("Error !para at " + msg.channel + " : " + e);
            }
        }
    },
    "register": {
        hidden:"1",
        desciption:"Bankaya kaydolun ve eğlence başlasın !",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(!Economy.hasOwnProperty(msg.sender.id)){
                        Economy[msg.sender.id] = {
                            money: 2000,
                            played: false,
                            time: Date(),
                            slotTime: Date()
                        };
                        updateEconomy();
                        bot.sendMessage(msg.channel, "**" + msg.sender + ", artık bir hesaba sahipsiniz.**");
                    } else {
                        bot.sendMessage(msg.channel, "**" + msg.sender + ", zaten bir hesabınız bulunmakta.**");
                    }
                }
            } catch(e){
                logger.debug("Error !register at " + msg.channel + " : " + e);
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
    "whodelete":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "who")) {
                    if(suffix)
                    {
                        logger.debug("Sending !who to " + msg.channel);
                        delete WhoList[suffix.toLowerCase()];
                        updateWhoList();
                    } else {
                        logger.debug("Sending !who to " + msg.channel);
                        bot.sendMessage(msg.channel,"**Kimden bahsediyorsun ?**");
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
    "whoadd":{
        hidden:"1",
        description:"",
        process: function(bot,msg,suffix) {
            try {
                var args = suffix.split(' ');
			    var user = args.shift();
			    var message = args.join(' ');
                if(checkPermission(msg.sender.id, "who")) {
                    if(suffix)
                    {
                        logger.debug("Sending !who to " + msg.channel);
                        WhoList[user.toLowerCase()] = message;
                        updateWhoList();
                    } else {
                        logger.debug("Sending !who to " + msg.channel);
                        bot.sendMessage(msg.channel,"**Kimden bahsediyorsun ?**");
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
    "who":{
        usage:"<isim>",
        description:"Botun kişiler hakkındaki düşüncelerini getirir.",
        process: function(bot,msg,suffix) {
            try {
                if(suffix)
                {
                    /*if(suffix == "nonfic") {
                        bot.sendFile(msg.channel, './caps/nonfic/bugra.png', 'bugra.png');
                        return;
                    } else {*/
                        logger.debug("Sending !who to " + msg.channel);
                        bot.sendMessage(msg.channel,whois(suffix));
                    //}
                } else {
                    logger.debug("Sending !who to " + msg.channel);
                    bot.sendMessage(msg.channel,"**Kimden bahsediyorsun ?**");
                }
            }
            catch (e){
                logger.debug("Error !whois at " + msg.channel + " : " + e);
            }
        }
    },
    "kuralsil":{
        disabled:1,
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
    }, //make kural server based, json is ready
    "kuralekle":{
        disabled:1,
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
    }, //make kural server based, json is ready
    "kural": {
        disabled:1,
        hidden:"1",
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
    }, //make kural server based, json is ready
    "osu": {
        usage:"<isim>",
        description:"Kişinin Osu statlarını getirir. (Şimdilik sadece standart))",
        process: function(bot,msg,suffix){
            try {
                if(suffix && suffix.length >= 3 && strcon(suffix)){
                    logger.debug("Sending !osu to " + msg.channel);
                    osustat(suffix,msg.channel);
                    logger.debug("succesfully send !osu to " + msg.channel);
                }
                else {
                    logger.debug("parameter problem in !osu at " + msg.channel);
                    bot.sendMessage(msg.channel, "!osu komutuna en az 3 harflik bir parametre vermeniz gerekiyor. \"!osu iLikeCupCakes\" gibi. ");
                }
            }
            catch(e) {
                 logger.debug("Error !osu at " + msg.channel + " : " + e);
            }
        }
    },
    "download": {
        description:"Discord indirme link atar (pc,android,ios,macosx  varsayılan : pc)",
        process: function(bot,msg,suffix) {
            try {
                if(suffix == "android") {
                    logger.debug("Sending !download android to " + msg.channel);
                    bot.sendMessage(msg.channel, "Discord Android download linki : https://play.google.com/store/apps/details?id=com.discord");
                }
                else if(suffix == "ios") {
                    logger.debug("Sending !download ios to " + msg.channel);
                    bot.sendMessage(msg.channel, "Discord ios download linki : https://itunes.apple.com/us/app/discord-chat-for-games/id985746746");
                }
                else if(suffix == "macosx") {
                    logger.debug("Sending !download macosx to " + msg.channel);
                    bot.sendMessage(msg.channel, "Discord macosx download linki : https://discordapp.com/api/download?platform=osx");
                }
                else {
                    logger.debug("Sending !download pc[or anything] to " + msg.channel);
                    bot.sendMessage(msg.channel, "Discord PC download linki : https://discordapp.com/api/download?platform=win");
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
                 if(suffix == "INT_MAX") {
                     bot.sendMessage(msg.channel,msg.author + " 2147483647 zarladı !");
                     logger.debug("send !zar at " + msg.channel);
                 }
                 else if(!culcon(suffix))
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
				content: target + ", " + msg.author + " diyorki: " + message
			};
			updateMessagebox();
			bot.sendMessage(msg.channel,"mesaj kaydedildi.");
		}
	},
	"invite": {
	    hidden:"1",
	    description: "Odaya sınırsız invite linkini atar.",
	    process: function(bot,msg,suffix) {
	        if(msg.channel.server.name == osuTRserver) {
	            bot.sendMessage(msg.channel, "https://discord.gg/0kdWj94TzvIXLKnu");
	        }
	    }
	},
	"adeyisd": {
	    hidden:"1",
	    usage:"",
        description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/adeyisd.jpg', 'adeyisd.jpg');
	    }
	},
	"müzik": {
        hidden:"1",
        usage:"<youtube video id>",
        desciption: "ID'si verilen Youtube şarkısını çalma listesine ekler.",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(msg.channel.isPrivate) {
                        bot.sendMessage(msg.sender, "**PM den şarkı kabul etmiyoruz, söri.**");
                        return;
                    }
                    if (songBanned.hasOwnProperty(msg.sender.id)) {
                        if(songBanned[msg.sender.id].permanent) {
                            bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", çalma listesine şarkı eklemeniz süresiz yasaklanmıştır.**");
                            return;
                        } else {
                            var date1 = new Date(songBanned[msg.sender.id].time);
                            date1.addHours(parseInt(songBanned[msg.sender.id].hours, 10));
                            var banTime = timediff(Date(), date1);
                            if(banTime.aseconds < 0) {
                                delete songBanned[msg.sender.id];
                                updateSongBanned();
                            } else {
                                bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", çalma listesine şarkı eklemeniz" + timeFormatString(banTime.hours, banTime.minutes, banTime.seconds) + " boyunca yasaktır.**");
                                return;
                            }
                        }
                    }
                    if(musicFree || checkPermission(msg.sender.id, "dev") || checkRole("osu!Türkiye", msg.sender, "Regular Users") || checkRole("osu!Türkiye", msg.sender, "Admin")) {
                        if(suffix) {
                            if(getYoutubeIDFromLink(suffix)) {
	                               suffix = suffix.substr(suffix.indexOf('v=')+2, 11);
	                           }
                            ytdl.getInfo("https://www.youtube.com/watch?v=" + suffix, function(err, info) {
                                if(err) {
                                    logger.debug("Error ytdl.getInfo: " + err);
                                }
                                if(isset(info)) {
                                    var title = info["title"];
                                    if(blackListed(title)) {
                                        bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", eklemek istediğiniz şarkı kara listede bulunduğundan eklenememiştir.**");
                                        return;
                                    }
                                    var songs = Object.keys(songList).map(function(k) {return songList[k];});
                                    if(songs.length < 10) {
                                        if(nowPlaying.songID != suffix) {
                                            var exists = false;
                                            for(var i = 0; i < songs.length; i++) {
                                                if(songs[i].songID == suffix) {
                                                    exists = true;
                                                    break;
                                                }
                                            }
                                            if(!exists) {
                                                songs[songs.length] = {
                                                    songName: title,
                                                    songID: suffix,
                                                    submitterName: msg.sender.name,
                                                    submitterID: msg.sender.id
                                                };
                                                songList = {};
                                                for(var i = 0; i < songs.length; i++)
                                                    songList[i] = songs[i];
                                                updateSongList();
                                                bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", \"" + title + "\" adlı şarkınız çalma listesine eklendi!**");
                                                if(Object.keys(songList).length == 1 && pTimeout == null)
                                                    playFromList(msg);
                                            } else {
                                                bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", eklemeye çalıştığınız şarkı zaten çalma listesinde var.**");
                                            }
                                        }
                                        else {
                                            bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", eklemeye çalıştığınız şarkı zaten şu an çalıyor.**");
                                        }
                                    } else {
                                        bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", çalma listesi şu anda dolu.**");
                                    }
                                } else {
                                    bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", şarkı çalma listesine eklenemedi! Eğer ID'yi doğru girdiyseniz muhtemelen bu video botun bulunduğu ülkede (Amerika) yasaklanmış.**");
                                }
                            });
                        } else {
                            bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", e hani link ya da ID?**");
                        }
                    } else {
                        bot.sendMessage(osuTRgeneralChannel, "**" + msg.sender + ", bu komutu kullanmaya yetkiniz yok.**");
                    }
                }
            } catch(e) {
                logger.debug("Error !müzik at " + msg.channel + " : " + e);
            }
        }
    },
    "müzikliste": {
        hidden:"1",
        usage:"",
        description: "Müzik çalma listesini görüntüler.",
        process: function(bot,msg,suffix) {
            if(msg.channel.server.name == osuTRserver) {
                var songs = Object.keys(songList).map(function(k) {return songList[k];});
                var length = songs.length;
                if(length > 10) {
                    length = 10;
                }
                var reply = "";
                for(var i = 0; i < length; i++) {
                    if(i < (length-1))
                        reply += (i+1).toString() + ") " + songs[i].songName + " / Ekleyen: " + songs[i].submitterName + "\r\n";
                    else
                        reply += (i+1).toString() + ") " + songs[i].songName + " / Ekleyen: " + songs[i].submitterName;
                }
                if(length == 0) {
                    reply = "**Çalma listesinde hiç şarkı yok.**";
                }
                bot.sendMessage(msg.channel, reply);
            }
        }
    },
	"çal": {
	    hidden:"1",
	    usage:"[youtube video id]",
        description:"ID verilmezse çalma listesinden, ID verilirse o şarkıyı çalmaya başlar.",
	    process: function(bot,msg,suffix) {
	        try {
	            if(msg.channel.server.name == osuTRserver) {
	                if(checkPermission(msg.sender.id,"dev")) {
	                    if(suffix) {
	                        if(getYoutubeIDFromLink(suffix)) {
	                            suffix = suffix.substr(suffix.indexOf('v=')+2, 11);
	                        }
	                        playFromID(msg, suffix, false);
	                    }
	                    else
                            playFromList(msg);
	                } else {
	                    bot.sendMessage(msg.channel, "**" + msg.sender + ", bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
	                }
	            }
	        } catch(e) {
	            logger.debug("Error !çal at " + msg.channel + " : " + e);
	        }
	    }
	},
	"durdur": {
	    hidden:1,
	    description: "",
	    process: function(bot,msg,suffix) {
	        try {
	            if(msg.channel.server.name == osuTRserver) {
	                if(checkPermission(msg.sender.id,"dev")) {
	                    stopPlaying();
	                    bot.sendMessage(osuTRgeneralChannel, "**Çalan şarkı durduruldu.**");
	                } else {
	                    bot.sendMessage(msg.channel, "** " + msg.sender + ", bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
	                }
	            }
	        } catch(e) {
	            logger.debug("Error !dev at " + msg.channel + " : " + e);
	        }
	    }
	},
	"sıradaki": {
	    hidden:"1",
        description:"Çalma listesinde sıradaki şarkıyı çalar.",
	    process: function(bot,msg,suffix) {
	        try {
	            if(msg.channel.server.name == osuTRserver) {
	                if(checkPermission(msg.sender.id,"dev")) {
	                    //bot.deleteMessage(msg);
	                    bot.sendMessage(osuTRgeneralChannel,"**" + msg.sender + " sıradaki şarkıya geçti!**");
	                    playFromList(msg);
	                } else {
	                    bot.sendMessage(msg.channel, "** " + msg.sender + ", bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
	                }
	            }
	        } catch(e) {
	            logger.debug("Error !dev at " + msg.channel + " : " + e);
	        }
	    }
	},
	"temizle": {
	    hidden:"1",
        description:"Çalma listesini temizler.",
	    process: function(bot,msg,suffix) {
	        try {
	            if(msg.channel.server.name == osuTRserver) {
	                if(checkPermission(msg.sender.id,"dev")) {
	                    songList = {};
	                    updateSongList();
	                    bot.sendMessage(osuTRgeneralChannel, "**Şarkı listesi temizlendi!**");
	                } else {
	                    bot.sendMessage(msg.channel, "** " + msg.sender + ", bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
	                }
	            }
	        } catch(e) {
	            logger.debug("Error !dev at " + msg.channel + " : " + e);
	        }
	    }
	},
	"çalan": {
	    hidden:"1",
        description:"Çalan şarkının adını görüntülen.",
	    process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(nowPlaying.hasOwnProperty("songName") && nowPlaying.hasOwnProperty("submitterName") && nowPlaying.songName && nowPlaying.submitterName) {
                        bot.sendMessage(msg.channel, "**Çalan şarkı: " + nowPlaying.songName + " / Ekleyen: " + nowPlaying.submitterName + "**");
                    } else {
                        bot.sendMessage(msg.channel, "**Şu an bir şarkı çalmıyor.**");
                    }
                }
	        } catch(e) {
	            logger.debug("Error !dev at " + msg.channel + " : " + e);
	        }
	    }
	},
	"çalanlink": {
	    hidden:"1",
        description:"Çalan şarkının Youtube linkini verir.",
	    process: function(bot,msg,suffix) {
	        try {
	            if(msg.channel.server.name == osuTRserver) {
                    if(nowPlaying.hasOwnProperty("songID") && nowPlaying.songID) {
                        bot.sendMessage(msg.channel, "*https://www.youtube.com/watch?v=" + nowPlaying.songID + "*");
                    } else {
                        bot.sendMessage(msg.channel, "**Şu an bir şarkı çalmıyor.**");
                    }
	            }
	        } catch(e) {
	            logger.debug("Error !çalanlink at " + msg.channel + " : " + e);
	        }
	    }
	},
	"çalanid": {
	    hidden:"1",
	    description:"Çalan şarkının ID'sini verir.",
	    process: function(bot,msg,suffix) {
	        try {
	            if(msg.channel.server.name == osuTRserver) {
                    if(nowPlaying.hasOwnProperty("songID") && nowPlaying.songID) {
                        bot.sendMessage(msg.channel, nowPlaying.songID);
                    } else {
                        bot.sendMessage(msg.channel, "**Şu an bir şarkı çalmıyor.**");
                    }
	            }
	        } catch(e) {
	            logger.debug("Error !çalanid at " + msg.channel + " : " + e);
	        }
	    }
	},
	"kalansüre": {
	    hidden:"1",
        description:"Şarkıda kalan süreyi gösterir.",
	    process: function(bot,msg,suffix) {
	        try {
	            if(msg.channel.server.name == osuTRserver) {
                    if(nowPlaying && nowPlaying.startTime) {
                        var date1 = nowPlaying.startTime;
                        var playTime = timediff(date1, Date());
                        var remainingSec = Math.abs(parseInt(nowPlaying.songLength, 10) - playTime.aseconds);
                        var remainingMin = parseInt(remainingSec / 60, 10);
                        remainingSec %= 60;
                        var remainingHou = parseInt(remainingMin / 60, 10);
                        remainingMin %= 60;
    
                        var currentSec = playTime.aseconds;
                        var currentMin = parseInt(currentSec / 60, 10);
                        currentSec %= 60;
                        var currentHou = parseInt(currentMin / 60, 10);
                        currentMin %= 60;
    
                        var reply1 = timeFormatString(currentHou, currentMin, currentSec);
                        var reply2 = timeFormatString(remainingHou, remainingMin, remainingSec);
                        bot.sendMessage(msg.channel, "**Şarkının başından bu yana" + reply1 + " geçti ve şarkının bitmesine" + reply2 + " kaldı.**");
                    } else {
                        bot.sendMessage(msg.channel, "**Şu an bir şarkı çalmıyor.**");
                    }
	            }
	        } catch(e) {
	            logger.debug("Error !kalansüre at " + msg.channel + " : " + e);
	        }
	    }
	},
	"rip": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/nonfic/bRip.png', 'bRip.png');
	    }
	},
	"rio": {
	    hidden:1,
	    usage:"",
        description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/nonfic/rio.jpg', 'rio.jpg');
	    }
	},
	"ayar": {
	    hidden:1,
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/ayar.png', 'ayar.png');
	    }
	},
	"doge": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/nonfic/doge.jpg', 'doge.jpg');
	    }
	},
	"scream": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/nonfic/scream.gif', 'scream.gif');
	    }
	},
	"justdoit": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        if(Math.random() == 0) {
	            bot.sendFile(msg.channel, './caps/nonfic/justdoit2.png', 'justdoit2.png');
	        } else {
	            bot.sendFile(msg.channel, './caps/nonfic/justdoit1.gif', 'justdoit1.gif');
	        }
	    }
	},
	"kappa": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/kappa.png', 'kappa.png');
	    }
	},
	"shululu": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        if(msg.channel.server.name == osuTRserver) {
	            bot.sendFile(msg.channel, './caps/shululu.png', 'shululu.png');
	        }
	    }
	},
	"kont": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/kont.jpg', 'kont.jpg');
	    }
	},
	"lemmyface": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/nonfic/lemmy.jpg', 'lemmy.jpg');
	    }
	},
	"astımgeldimi": {
	    disabled:1,
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/astim.jpg', 'astim.jpg');
	    }
	},
	"rp": {
	    disabled:1,
	    hidden:1,
	        usage:"",
          description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/rareparrot.gif', 'rareparrot.gif');
	    }
	},
	"banaparaver": {
	    hidden:1,
	    usage:"",
     description:"",
	    process: function(bot,msg,suffix) {
	        bot.sendFile(msg.channel, './caps/nonfic/bpv.gif', 'bpv.gif');
	    }
	},
	"nil":{
         hidden:"1",
         usage:"",
         description:"",
         process: function(bot,msg,suffix) {
            try {
                if(msg.author == "<@90076279646212096>")
                    bot.sendFile(msg.channel, "./caps/nil.jpg", 'nil.jpg');
                logger.debug("Sending !nil to from " + msg.sender + msg.author + msg.channel);
            }
            catch (e){
                logger.debug("Error !nil at " + msg.channel + " : " + e);
            }
         }
    },
    "nil2":{
         hidden:"1",
         usage:"",
         description:"",
         process: function(bot,msg,suffix) {
             try {
                if(msg.author == "<@90076279646212096>")
                    bot.sendFile(msg.channel, "./caps/nil2.png", 'nil2.png');
                logger.debug("Sending !nil2 to from " + msg.sender + msg.author + msg.channel);
            }
            catch (e){
                logger.debug("Error !nil2 at " + msg.channel + " : " + e);
            }
         }
    },
    "summon":{
     hidden:"1",
     usage:"",
     description:"",
     process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id,"dev")){
                    if(msg.sender.voiceChannel != null && isDeving)
                        bot.joinVoiceChannel(msg.sender.voiceChannel);
                }
            } catch(e) {
                logger.debug("Error !summon at " + msg.channel + " : " + e);
            }
        }
    },
    "ttv":{
        usage:"<twitch>",
        description:"Kanalın yayında olup olmadığını görün.",
        process : function(bot,msg,suffix) {
            try {
                suffix = suffix.replace(" ","");
                ttvc.streams({ channel: suffix }, function(err, response) {
                    if(err) throw new Error (err);
                    if(response.stream == null) {
                        bot.sendMessage(msg.channel, "Aradğınız yayın kapalı.");
                    } else {
                        var rt = "**Title:** " + response.stream.channel.status + "\n";
                            rt += "**Oyun:** " + response.stream.game + "\n";
                            rt += "**İzleyici:** " + response.stream.viewers + "\n";
                            rt += "**Link:** *" + response.stream.channel.url + "*\n";
                            bot.sendMessage(msg.channel, rt);
                    }
                });
            } catch(e) {
                logger.debug("Error !ttv at " + msg.channel + " : " + e);
            }
        }
    },
    "bach": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                bot.sendFile(msg.channel, "./caps/nonfic/bach.jpg", 'bach.jpg');
            } catch (e) {
                logger.debug("Error !bach at " + msg.channel + " : " + e);
            }
        }
    },
    "termos": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                bot.sendFile(msg.channel, "./caps/termos.jpg", 'termos.jpg');
            } catch (e) {
                logger.debug("Error !bach at " + msg.channel + " : " + e);
            }
        }
    },
    "b8": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                bot.sendFile(msg.channel, "./caps/bait/ " + Math.floor(Math.random() * 139) +".png");
            } catch (e) {
                logger.debug("Error !b8 at " + msg.channel + " : " + e);
            }
        }
    },
    "cahil": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                bot.sendFile(msg.channel, "./caps/cahil/" + Math.floor(Math.random() * 21) +".jpg");
            } catch (e) {
                logger.debug("Error !cahil at " + msg.channel + " : " + e);
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
    "like": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                bot.sendFile(msg.channel, "./caps/nonfic/like.png", 'like.png');
            } catch (e) {
                logger.debug("Error !like at " + msg.channel + " : " + e);
            }
        }
    },
    "bravo": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                bot.sendFile(msg.channel, "./caps/nonfic/bravo.jpg", 'bravo.jpg');
            } catch (e) {
                logger.debug("Error !bravo at " + msg.channel + " : " + e);
            }
        }
    },
    "dabbe": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                bot.sendFile(msg.channel, "./caps/dabbe.jpg", 'dabbe.jpg');
            } catch (e) {
                logger.debug("Error !dabbe at " + msg.channel + " : " + e);
            }
        }
    },
    "brainpower2": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                bot.sendFile(msg.channel, "./caps/brainpower.png", 'brainpower.png');
            } catch (e) {
                logger.debug("Error !brainpower2 at " + msg.channel + " : " + e);
            }
        }
    },
    "mekanik": {
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    bot.sendFile(msg.channel, "./caps/mekanik.png", 'mekanik.png');
                }
            } catch (e) {
                logger.debug("Error !mekanik at " + msg.channel + " : " + e);
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
                bot.sendMessage(msg.channel, "*http://www.google.com/search?q=" + encodeURIComponent(suffix) + "*");
            }
        }
    },
    "beatmap": {
        usage:"<aranacak şey>",
        description:"osu beatmap araması yapar.",
        process: function(bot,msg,suffix) {
            if(suffix) {
                //suffix = suffix.replace(" ", "%20");
                bot.sendMessage(msg.channel, "*http://osu.ppy.sh/p/beatmaplist?q=" + encodeURIComponent(suffix) + "*");
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
    "shop": {
        hidden:"1",
        usage:"Opsiyonel : <Alınacak index> <Şeçim>",
        description:"Marketi görün veya satın alın.",
        process: function(bot,msg,suffix) {
            if(msg.channel.server.name == osuTRserver) {
                if(!suffix) {
                    bot.sendMessage(msg.channel, "**Market : \n1. Özel renk : " + colorPara.toLocaleString() + " ₺**");
                }
                else {
                    var args = suffix.split(' ');
			        var shopindex = args.shift();
			        var color = args.join(' ');
			        if(shopindex == 1) {
			            if(color == "")
			            {
			                bot.sendMessage(msg.channel, "**Renkler : \n1. Kırmızı\n2. Turuncu\n3. Kahverengi\n4. Pembe\n5. Mor\n6. Yeşil**");
			            } else {
			                var colorToBuy = -1;
			                switch(color)
			                {
			                    case "1": colorToBuy = 1; break;
			                    case "2": colorToBuy = 2; break;
			                    case "3": colorToBuy = 3; break;
			                    case "4": colorToBuy = 4; break;
			                    case "5": colorToBuy = 5; break;
			                    case "6": colorToBuy = 6; break;
			                    default: bot.sendMessage(msg.channel, "**Lütfen doğru renk şeçiniz !**"); break;
			                }
			                if(colorToBuy != -1) {
			                    var sender = msg.sender.id;
			                    if(Economy[sender].money > colorPara) {
			                         
			                    } else {
			                        bot.sendMessage(msg.channel, msg.sender + "**, yeterli paranız yok (" + colorPara.toLocaleString() + " ₺)**");
			                    }
			                }
			            }
			        } else {
			            bot.sendMessage(msg.channel, "**Alınacak paketi yanlış şeçtiniz**");
			        }
                }
            }
        }
    }
};

var faq = {
    "slotchat": {
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(suffix) {
                        bot.sendMessage(msg.channel, suffix + "**, Lütfen slot komutlarını <#144816900591976448> kanalında kullan.**");
                    } else {
                        bot.sendMessage(msg.channel,"**Lütfen slot komutlarını <#144816900591976448> kanalında kullanın.**");
                    }
                }
            } catch(e) {
                logger.debug("Error at !faq:slotchat : " + e);
            }
        }
    },
    "lines": {
        process: function(bot,msg,suffix) {
            try {
                if(msg.channel.server.name == osuTRserver) {
                    if(suffix) {
                        bot.sendMessage(msg.channel, suffix + "**, Lütfen yazacaklarını tek bir satırda yazmaya çalış.**");
                    } else {
                        bot.sendMessage(msg.channel,"**Lütfen yazacaklarınızı tek bir satırda yazmaya çalışın.**");
                    }
                }
            } catch(e) {
                logger.debug("Error at !faq:lines : " + e);
            }
        }
    }
};
//}
// <Events> {
bot.on("ready", function () {
    if(!osuTRgeneralChannel)
        osuTRgeneralChannel = bot.channels.get("id", "134666472864743424");
    if(!osuTRserver)
        osuTRserver = bot.servers.get("id", "134666472864743424");
    //bot.sendMessage(osuTRgeneralChannel,"**Ben geldim :3**")
	logger.debug("Ready to begin! " + bot.channels.length + " channels are active.");
	load_plugins();
	var gtp = Math.floor(Math.random() * Object.keys(gameList).length) + 1;
	bot.setPlayingGame(gameList[gtp]);
	if(!isDeving) {
        var discoch = bot.channels.get("id", "134677180113354753");
        if(discoch)
            bot.joinVoiceChannel(discoch);
	}
	if(nowPlaying)
	    stopPlaying();
	//changeTriviaIndex();
});

bot.on("disconnected", function () {
	logger.debug("Disconnected!");
	process.exit(1); //exit node.js with an error
});

bot.on("message", function (msg) {
    if(!osuTRgeneralChannel)
        osuTRgeneralChannel = bot.channels.get("id", "134666472864743424");
    //if(msg.channel.isPrivate) {
    //    bot.sendMessage(msg.sender, "**PM den komut kabul etmiyoruz, söri.**");
    //    return;
    //}
    if(msg.author.id != bot.user.id && checklink(msg.content)) {
        var txt = msg.content;
        var mode = txt.substr(txt.indexOf("sh/") + 3, 1);
        if(txt.indexOf("&") > -1 || txt.indexOf("?") > -1)
            txt = txt.substr(0, txt.length-4);
        var numb = txt.match(/\d/g);
        var id = numb.join("");
        getBeatmapDetail(id,msg.channel,mode);
        
    }
	if(msg.author.id != bot.user.id && (msg.content[0] === '!' || msg.content.indexOf(bot.user.mention()) == 0)) {
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
        }
        else if(cmdTxt.indexOf("faq") == 0) {
            var komut = cmdTxt.substring(cmdTxt.indexOf(':')+1, cmdTxt.length);
            var faqp = faq[komut];
            if(faqp) {
                try {
                    faqp.process(bot,msg,suffix);
                    return;
                } catch(e) {
                    if(Config.debug){
	    		    		bot.sendMessage(msg.channel, "!faq:" + komut + " başarısız :(\n" + e.stack);
	    		    	}
	    		    }
	    	} else {
	    		if(Config.respondToInvalid){
	    			bot.sendMessage(msg.channel, "Bilinmeyen komut !faq:" + komut);
	    		}
            }
        }
		else if(cmd) {
			try{
			    if(!cmd.disabled)
				    cmd.process(bot,msg,suffix);

			} catch(e){
				if(Config.debug){
					bot.sendMessage(msg.channel, "komut " + cmdTxt + " başarısız :(\n" + e.stack);
				}
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
		        if(msg.sender.id !== users[i].id || selfMention) {
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
		                        else if(m && m > 0 && h >= 0) bot.sendMessage(msg.channel, "**" + msg.sender + ", " + users[i] + " kullan��cısı AFK ve muhtemelen " + m + " dakika sonra (" + date1.getHours() + ":" + date1.getMinutes() + ") geri dönecek. Ayrıca, bu mesajı bırakmış: \"" + afkList[users[i].id].message + "\"**");
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
        if(msg.content.indexOf("kappa") >= 0 && !msg.content.startsWith('!') && msg.sender.id != "134987945827368960") {
            bot.sendFile(msg.channel, './caps/kappa.png', 'kappa.png');
        }
        if(msg.content.indexOf("lennyface") > -1 && !msg.content.startsWith('!') && msg.sender.id != bot.user.id) {
            bot.deleteMessage(msg);
            var nw = msg.content;
            while(nw.indexOf("lennyface") > -1)
                nw = nw.replace("lennyface","( ͡° ͜ʖ ͡°)");
            bot.sendMessage(msg.channel, msg.sender + ": " + nw);
        }
        /*if (msg.author != bot.user && msg.isMentioned(bot.user)) {
                bot.sendMessage(msg.channel,msg.author + ", sen mi seslendin?");
        }*/
    }
});

bot.on("presence", function(user,status,gameId) {
	//if(status === "online"){
	//logger.debug("presence update");
	//}
	try{
	    if(status != 'offline'){
	    	if(messagebox.hasOwnProperty(user.id)){
	    		logger.debug("found message for " + user.id);
	    		var message = messagebox[user.id];
	    		var channel = bot.channels.get("id",message.channel);
	    		delete messagebox[user.id];
	    		updateMessagebox();
	    		bot.sendMessage(channel,message.content);
	    	}
	    }
	    if(status == 'offline') {
	    	if(afkList.hasOwnProperty(user.id)) {
	    		var channel = bot.channels.get("id", afkList[user.id].channel);
	    		bot.sendMessage(channel,"**"+ user + " AFK iken Discord'dan çıktı.**");
	    		delete afkList[user.id];
	    		updateAfkList();
	    	}
	    }
	} catch(e) {}
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