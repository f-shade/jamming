import React, { Component } from 'react';
/*import logo from './logo.svg'; */
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import Playlist from '../Playlist/Playlist';
import SearchResults from '../SearchResults/SearchResults';
import Spotify from '../../util/Spotify';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {searchResults: [],
                  playlistName: 'New Playlist',
                  playlistTracks: []};
    this.searchSpotify = this.searchSpotify.bind(this);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);

    let urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.toString());
  }

  async searchSpotify(term) {
    console.log('Searching Spotify with ' + term);
    let trackList = await Spotify.search(term);
    this.setState({searchResults: trackList});
    console.log(this.state.searchResults);
  }

  addTrack(track) {
      // If the track is already in the playlist, we can simply return
      if (this.state.playlistTracks.find(function (playlistTrack) { return track.id === playlistTrack.id })) {
        return;
      }

      // Correctly updating the state to trigger a fresh Playlist render
      let newPlaylist = this.state.playlistTracks.slice();
      newPlaylist.push(track);
      this.setState({ playlistTracks: newPlaylist });
  }

  removeTrack(track) {
      // If the track is not currently in the playlist, we can simply return
      if (!this.state.playlistTracks.find(function (playlistTrack) { return track.id === playlistTrack.id })) {
        console.log('Track is not currently in playlist');
        return;
      }

      console.log('Track is currently in playlist');
      // Correctly updating the state to trigger a fresh Playlist render
      let newPlaylist = this.state.playlistTracks.slice();
      newPlaylist = newPlaylist.filter(playlistTrack => track.id !== playlistTrack.id);
      this.setState({ playlistTracks: newPlaylist });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  async savePlaylist() {
    let trackURIs = this.state.playlistTracks.map(track => track.uri)
    await Spotify.savePlaylist(this.state.playlistName, trackURIs);

    console.log('Save Done');

    this.setState({ playlistTracks: [] });
    this.setState({ playlistName: 'New Playlist' });

  }

  render() {
    console.log('App! ' + this.state.searchResults);
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          < SearchBar searchSpotify={this.searchSpotify} />
          <div className="App-playlist">
            <SearchResults tracks={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist onSave={this.savePlaylist} onNameChange={this.updatePlaylistName} playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
