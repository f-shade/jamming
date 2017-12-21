import React from 'react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends React.Component {
  render() {
    console.log('TrackList! ' + this.props.tracks);
    return (
      <div className="TrackList">
        { this.props.tracks.map(item => {
          console.log(item);
          return < Track track={item} isRemoval={this.props.isRemoval} onAdd={this.props.onAdd} onRemove={this.props.onRemove} />;
        })}
      </div>
    );
  }
};

export default TrackList;
