import React, { Component } from 'react';
import api from '../api';
import Pull from './PullListItem'
import CommentsContainer from './CommentsContainer'
import { Table, InputGroup, InputGroupAddon, InputGroupText, Input } from 'reactstrap';


class PullsPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      repo: null,
      pulls: [],
      comments: null,
      searchValue: "",
      orderBy: "",
      order: "",
      dropDownActive: false
    }
  }



  componentDidMount() {
    this.fetchRepoInfo()
    console.log(this.state.repo)
    
  
  }

  fetchRepoInfo() {
    let repoName = this.props.match.params.repo
    api.fetchRepoInfo(repoName)
    .then(repo=>{
      console.log("fetched Repo:",repo)
      this.setState({
        repo:repo[0]
      })
      return
    })
    .then(_=>{
      return this.updatePulls() 
    })
    .then(_=>{
      return this.getComments()
    })
    .catch(err=>{
      console.log("error at fetchRepoInfo",err)
    })
  }


  updatePulls() {
    // const repoName = this.props.repo.name //OLD
    const repoName = this.state.repo.name //NEW
    const repoId = this.state.repo.githubID
      this.setState({
        pulls: null
      })

    api.getPulls(repoName,repoId)
      .then(pulls => {
        this.setState({ pulls })
        // this.checkVotes()
        return api.updatePulls(repoName)
      })
      // .then(res => {
      //   return api.getPulls(repoName,repoId)
      // })
      // .then(pulls => {
      //   this.setState({ pulls })
      // })
      // .then(_ => {
      //   console.log("check votes called in updatePulls()")
      //   this.checkVotes()
      // })
      .catch(err => console.log(err))
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.match.params.repo !== prevProps.match.params.repo ) {
      this.fetchRepoInfo()
      console.log('componentdidupdate')
      // this.updatePulls()
      // this.getComments()
    }
  }

  handleClick = (value) => {
    this.props.click(value)
  }

  handleChange = (event) => {
    console.log("handleChange called", event)
    const { name, value } = event.target;
    this.setState({[name]: value});
  }


  getComments() {
    api.getRepoComments(this.state.repo._id)
      .then(comments => {
        this.setState({comments})
      })
  }

  // checkVotes() {
  //   console.log("check votes method called in PullsList")
  //   let data = {
  //     // pulls: this.state.pulls,
  //     _user: this.props.user._github,
  //     _repo: this.props.repo.githubID
  //   }
  //   api.checkVotes(data)
  //   .then(votes => {
  //     let pulls = [...this.state.pulls]
  //     let pullIds = votes.map(vote => vote._pull)
  //     let newPullsState = pulls.map(pull => {
  //       if (pullIds.includes(pull.pullRequestID)) pull.likedByUser = true
  //       return pull
  //     })
  //     this.setState({
  //       pulls: newPullsState
  //     })
  //   })
  //   .catch(err=> {
  //     console.log("Error at checkVotes PullList",err)
  //   })
  // }


  // componentDidMount() {
  //   console.log("PullListItem component did Mount")

  //   api.checkVote(data)
  //   .then(result => {
  //     this.setState({
  //       likedByUser: result.state
  //     })
  //   })
  //   .catch(err=> {
  //     console.log("error at PullListItem", err)
  //   })
  // }

  toggleLike(clickedPull) {
    let allPulls = [...this.state.pulls]
    let data = {
      _user: this.props.user._github,
      _pull: clickedPull,
      _repo: this.state.repo.githubID
    }
    let [match] = allPulls.filter(pulls => {
      return pulls.pullRequestID === clickedPull
    })
    if (!match.likedByUser) {
      match.likedByUser = true
      match.nbOfVotes++;
      api.castVote(data)
      .then(this.setState({
        pulls: allPulls
      }))
    } else {
      match.likedByUser = false
      match.nbOfVotes--;
      api.removeVote(data)
      .then(this.setState({
        pulls: allPulls
      }))
    } 
  }

  render() {   
    let filteredPulls;
    if (this.state.pulls) {
      filteredPulls = this.state.pulls.filter(pull=>{
        return pull.title.toUpperCase().includes(this.state.searchValue.toUpperCase()) || pull._githubUsername.toUpperCase().includes(this.state.searchValue.toUpperCase())
      }); 
    }   

    if (!this.state.repo) {
      return <h1>Loading....</h1>
    } else {
        return (
          <div className="PullsPage">
            <h1>{this.state.repo.name}</h1>
            <CommentsContainer getComments={()=>this.getComments()} comments={this.state.comments} repo={this.state.repo} user={this.props.user}/>
            <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Search</InputGroupText>
            </InputGroupAddon>
            <Input name="searchValue" onChange={e => this.handleChange(e)} value={this.state.searchValue} />
          </InputGroup>
            <Table>
              <thead>
                  <th scope="col">Campus</th>
                  <th scope="col">Pull Request</th>
                  <th scope="col">User</th>
                  <th scope="col">Date</th>
                  <th scope="col">Likes</th>
                  <th scope="col"></th>
              </thead>
              <tbody>  
                {!this.state.pulls && <div>Loading...</div>}
                  {filteredPulls && filteredPulls.map((pull, index) => {
                    return <Pull
                      key={index} 
                      repo={this.state.repo}
                      user={this.props.user}
                      // likedByUser={likedByUser}
                      pull={pull}
                      click={(value)=> this.handleClick(value)}
                      handleLike={()=>this.toggleLike(pull.pullRequestID)}
                      />
                  })}
                </tbody>
            </Table>
          </div>
        );
    }
    
   
  }
}

export default PullsPage;
