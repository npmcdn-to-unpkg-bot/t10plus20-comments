var CommentBox = React.createClass({
	loadCommentsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data})
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString())
				console.warn(xhr.responseText)
			}.bind(this)
		})
	},
	handleCommentSubmit: function(comment) {
		var comments = this.state.data
		comment.id = Date.now()
		var newComment = comments.concat([comment])
		this.setState({data: newComment})

		$.ajax({
			url: this.props.url, 
			dataType: 'json', 
			type: 'POST', 
			data: comment,
			success: function(data) {
				this.setState({data: data})
			}.bind(this),
			error: function(xhr, status, err) {
				this.setState({data: comments})
				console.error(this.props.url, status, err.toString())
			}.bind(this)
		})
	},
	getInitialState: function() {
		return {data: []}
	}, 
	componentDidMount: function() {
		this.loadCommentsFromServer()
		setInterval(this.loadCommentsFromServer, this.props.pollInterval)
	}, 
	render: function() {
		return (
			<div className="commentBox">
				<CommentForm onCommentSubmit={this.handleCommentSubmit} />
				<CommentList data={this.state.data} />
			</div>
		)
	}
})

var CommentForm = React.createClass({
	getInitialState: function() {
		return {author: '', text: ''}
	}, 
	handleAuthorChange: function(e) {
		this.setState({author: e.target.value})
	}, 
	handleTextChange: function(e) {
		this.setState({text: e.target.value})
	}, 
	handleSubmit: function(e) {
		e.preventDefault()
		var author = this.state.author.trim()
		var text = this.state.text.trim()
		if (!text || !author) {
			return
		}
		this.props.onCommentSubmit({author: author, text: text})
		this.setState({author: '', text: ''})
	}, 
	render: function() {
		return (
			<div className="commentFormContainer">
				<h1>Message/comment/idea bord</h1>
				<form className="commentForm" onSubmit={this.handleSubmit}>
					<input type="text" placeholder="What's on your mind" value={this.state.text} onChange={this.handleTextChange} />
					<input type="text" placeholder="Name" value={this.state.author} onChange={this.handleAuthorChange} />
					<input className="formSubmit" type="submit" value="Post" />
				</form>
			</div>
		)
	}
})

var CommentList = React.createClass({
	render: function() {
		var that = this
		var commentNodes = this.props.data.map(function(comment, index) {
			return (
				<Comment author={comment.author} key={comment.id} id={index}>
					{comment.text}
				</Comment>
			)
		})
		return (
			<div className="commentList">
				{commentNodes}
			</div>
		)
	}
})

var Comment = React.createClass({
	render: function() {
		return (
			<div className="comment">
				<p>
					{this.props.children}
				</p>
				<h4 className="commentAuthor">
					 - {this.props.author}
				</h4>
			</div>
		)
	}
})

ReactDOM.render(
	<CommentBox url="/api/comments" pollInterval={2000} />, document.getElementById('content')
)