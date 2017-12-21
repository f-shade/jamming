import React from 'react';
import './SearchBar.css';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      term: ''
    };
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleTermChange(event) {
    this.setState({term: event.target.value});
  }

  handleSearch(event) {
    this.props.searchSpotify(this.state.term);
    event.preventDefault();
  }

  render() {
    return (
      <div className="SearchBar">
        <input placeholder="Enter A Song Title" onChange={this.handleTermChange} />
        <a onClick={this.handleSearch}>SEARCH</a>
      </div>
    );
  }
};

export default SearchBar;
