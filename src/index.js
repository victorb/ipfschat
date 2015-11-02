import React, { Component } from 'react'
import ReactDOM from 'react-dom'

var ipc = require('ipc');

class Line extends Component {
  render() {
    const preStyle = {
      padding: 0,
      margin: 0,
      fontSize: '12px'
    }
    const greyStyle = {
      color: 'lightgrey'
    }
    return <pre style={preStyle}>
    <span style={greyStyle}>
    {this.props.timestamp}
    &nbsp;|&nbsp;
    {this.props.user.substr(0, 16)}
    </span>
    &nbsp;>&nbsp;
    <span>{this.props.text}</span>
  </pre>
  }
}

class Lines extends Component {
  render() {
    var lines = this.props.messages.map((message) => {
      return <Line timestamp={message.timestamp}
        user={message.user}
        text={message.text}
      />
    })
    return <div>
      {lines}
    </div>
  }
}

class MessageSender extends Component {
  render() {
    return <div>
      <form action="#" onSubmit={this.props.onSend}>
        <input value={this.props.message} onChange={this.props.onChange} placeholder="Write your message here..."></input>
        <input type="submit" value="Send"></input>
      </form>
    </div>
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: null
    }
  }
  handleOnChange(ev) {
    this.setState({message: ev.target.value})
  }
  handleOnSend(ev) {
    const message_to_send = this.state.message
    ipc.send('send-message', message_to_send)
    ev.preventDefault()
    this.setState({message: null})
  }
  render() {
    return <div>
      <Lines messages={this.props.messages}/>
      <MessageSender
        message={this.state.message}
        onChange={this.handleOnChange.bind(this)}
        onSend={this.handleOnSend.bind(this)}
      />
    </div>
  }
}

ipc.on('got-messages', function(messages) {
  ReactDOM.render(<App messages={messages}/>, document.getElementById('root'))
})
ipc.send('get-messages')

setInterval(function() {
  ipc.send('get-messages')
}, 1000 * 10)

ipc.on('sent-message', function(path) {
  ipc.send('get-messages')
})

//ipc.on('asynchronous-reply', function(lines) {
//  ReactDOM.render(<App messages={lines}/>, document.getElementById('root'))
//});
//ipc.send('asynchronous-message', 'ping');
