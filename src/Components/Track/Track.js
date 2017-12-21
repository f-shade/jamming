import React from 'react';
import './Track.css';

// TODO: Determine if the Track-action should be 'add' or 'subtract' (+/-)
// Parent component should set an attribut to determine which action to take
class Track extends React.Component {
  constructor(props) {
    super(props);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
  }

  renderAction() {
    let removalAnchor = (<a className="Track-action" onClick={this.removeTrack}>-</a>);
    let additionAnchor = (<a className="Track-action" onClick={this.addTrack}>+</a>);
    return this.props.isRemoval ? removalAnchor : additionAnchor;
  }

  addTrack() {
    this.props.onAdd(this.props.track);
  }

  removeTrack() {
    console.log('removeTrack Hello!');
    this.props.onRemove(this.props.track);
  }

  render() {
    return (
      <div className="Track" key={this.props.track.id}>
        <div className="Track-information">
          <h3>{this.props.track.songName}</h3>
          <p>{this.props.track.artistName} | {this.props.track.albumName}</p>
        </div>
        {this.renderAction()}
      </div>
    );
  }

};

export default Track;
