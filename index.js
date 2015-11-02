var ipfsApi = require('ipfs-api')
var request = require('request')
var ndjson = require('ndjson')
var oboe = require('oboe')
var fs = require('fs');
var clear = require('clear');
var merger = require('./lib/merger')

var ipfs = new ipfsApi()

function ifErrThrow(err) {
	if(err) {
    console.log()
    console.log('### ERROR')
    console.log(err)
    console.log()
    console.log('Exiting...')
    process.exit(112)
  }
}

function log(cat, message) {
  if(process.env.DEBUG) {
    if(message === undefined) {
      console.log('#' + cat + ' called')
    } else {
      console.log('#' + cat + ' => ' + message)
    }
  }
}

function getIDHash() {
	log('getIDHash')
	return new Promise((resolve) => {
		ipfs.add('storage/id', (err, res) => {
			ifErrThrow(err)
			var hash = res[0].Hash
			log('getIDHash', hash)
			resolve(hash)
		})
	})
}

function addStorage() {
	log('addStorage')
	return new Promise((resolve) => {
		ipfs.add('storage', {recursive: true}, (err, res) => {
			ifErrThrow(err)
			var hash = res.pop().Hash
			log('addStorage', hash)
			resolve(hash)
		})
	})
}

function publish(hash) {
	log('publish')
	return new Promise((resolve) => {
		ipfs.name.publish(hash, (err, res) => {
			ifErrThrow(err)
			var name = res.Name
			log('publish', name)
			resolve(name)
		})
	})
}


function findPeers(hash) {
	log('findPeers')
	return new Promise((resolve) => {
		var peers = []
		oboe('http://127.0.0.1:5001/api/v0/dht/findprovs\?arg\='+hash)
		 .done(function(things) {
			 if(things.Type === 4) {
				 var id = things.Responses[0].ID
				 log('findPeers', id)
				 peers.push(id)
			 }
			 if(things.Extra === "routing: not found") {
			 	resolve(peers)
			 }
		 })
		 .fail(function() {
			 console.log('Something terrible happen!')
		 });
	})
}

function resolveID(id) {
	log('resolveID')
	return new Promise((resolve) => {
		ipfs.name.resolve(id, (err, res) => {
			ifErrThrow(err)
			var path = res.Path
			log('resolveID', path)
			resolve(path)
		})
	})
}

function getMessages(path) {
	log('getMessages')
	return new Promise((resolve) => {
		ipfs.cat(path + '/messages', (err, res) => {
			ifErrThrow(err)
			var chunks = []
			res.on('data',function(chunk){
				chunks.push(chunk)
			});
			res.on('end',function(){
				var results = JSON.parse(chunks.join(''))
				log('getMessages', results)
				resolve(results);
			});
		})
	})
}

function read(options) {
	return new Promise((resolve) => {
		fs.readFile('storage/messages', function (err, data) {
			ifErrThrow(err)
			resolve(JSON.parse(data))
		});
	})
}

function write(peer_id, text) {
	return new Promise((resolve) => {
		read().then((messages) => {
			messages.push({
				user: peer_id,
				timestamp: new Date(),
				text: text
			})
			fs.writeFile('storage/messages', JSON.stringify(messages, null, 2), (err) => {
				ifErrThrow(err)
				resolve(messages)
			})
		})
	})
}

function printMessages(messages) {
	return new Promise((resolve) => {
    clear()
		messages.forEach((message) => {
			var username = message.user ? message.user : 'System'
			console.log(message.timestamp + ' ' + username + ': ' + message.text)
		})
		resolve()
	})
}

function getMessagesFromPeers(peers) {
  return new Promise((resolve) => {
		var peers_promises = peers.map((peer) => {
			return resolveID(peer).then(getMessages)
		})
    Promise.all(peers_promises).then((messages) => {
      var merged_messages = merger(messages)
      resolve(merged_messages)
    })
  })
}

function saveMessages(messages) {
  return new Promise((resolve) => {
    fs.writeFile('storage/messages', JSON.stringify(messages, null, 2), (err) => {
      ifErrThrow(err)
      resolve()
    })
  })
}

if(process.argv[2] === "read") {
	if(process.argv[3] === "forever") {
    clear()
		read().then(printMessages);
    (function sync() {
      read().then(printMessages)
      getIDHash()
        .then(findPeers)
        .then(getMessagesFromPeers)
        .then(saveMessages)
        .then(read)
        .then(printMessages)
        .then(() => {
          sync()
        })
    })()
	} else {
		console.log('Reading remote, fetching new messages...')
    clear()
		read().then(printMessages)
    getIDHash()
      .then(findPeers)
      .then(getMessagesFromPeers)
      .then(saveMessages)
      .then(read)
      .then(printMessages)
	}
}
if(process.argv[2] === "write") {
  ipfs.id((err, res) => {
    ifErrThrow(err)
    var id = res.ID
    console.log('Publishing your message...')
    write(id, process.argv[3])
      .then(addStorage)
      .then(publish)
      .then((path) => {
        console.log('Published! As ' + path)
      })
  })
}
if(process.argv[2] === "findpeers") {
	getIDHash().then(findPeers).then((peers) => {
		log('finding people')
		log('finding people', peers)
		var peers_promises = peers.map((peer) => {
			return resolveID(peer).then(getMessages)
		})
    Promise.all(peers_promises).then((messages) => {
      var merged_messages = merger(messages)
			fs.writeFile('storage/messages', JSON.stringify(merged_messages, null, 2), (err) => {
				ifErrThrow(err)
			})
    })
	})
}

module.exports = {
  readLocal: () => {
    return new Promise((resolve) => {
      read().then(resolve);
    })
  },
  read: () => {
    return new Promise((resolve) => {
      getIDHash()
        .then(findPeers)
        .then(getMessagesFromPeers)
        .then(saveMessages)
        .then(read)
        .then(resolve)
    })
  },
  write: (message) => {
  return new Promise((resolve) => {
    ipfs.id((err, res) => {
      ifErrThrow(err)
      var id = res.ID
      write(id, message)
        .then(addStorage)
        .then(publish)
        .then((path) => {
          resolve(path)
        })
    })
  })
  }
}

//var peers = ['QmcHUExQEJJqYKfDdshPiFZA9Crh3B7Q465X7jh8SsDtjW']
//
//resolveID(peers[0]).then(getMessages).then((messages) => {
//	console.log(messages)
//})

//addStorage().then(publish).then((res) => {
//	log('boot')
//	log('boot', res)
//})


