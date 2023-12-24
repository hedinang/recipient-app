import React, {Component} from "react";
import ReactMapGL, {LinearInterpolator} from "react-map-gl";
import DeckGL, {IconLayer} from "deck.gl";
import HOME_MARKERS from "../../assets/svg/home_marker.svg";

class TrackingMap extends Component {
  constructor(props) {
    super(props);
    const {shipment} = props;
    this.state = {
      viewport: {
        latitude: shipment.dropoff_address.lat || 37.772402,
        longitude: shipment.dropoff_address.lng || -122.414265,
        zoom: 15,
        width: 400,
        height: 400,
        maxZoom: 16,
        minZoom: 8,
      },
      mapStyle: `https://api.maptiler.com/maps/topo/style.json?key=${process.env.REACT_APP_MAP_TILER_KEY}`,
    }
  }

  renderMarker = (location) => {
    return new IconLayer({
      id: 'shipment-marker',
      data: [{
        location: [location.lng || location.dropoff_longitude, location.lat || location.dropoff_latitude],
        size: 40,
        icon: 'green',
      }],
      pickable: true,
      iconAtlas: HOME_MARKERS,
      iconMapping: {"green": {x: 0, y: 0, width: 168, height: 228, anchorY: 228}},
      getIcon: d => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      billboard: false,
      getPosition: d => d.location,
      getSize: d => d.size,
    });
  };

  render() {
    const {viewport, mapStyle} = this.state;
    const {shipment} = this.props;

    return (
      <ReactMapGL
        {...viewport}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        dragPan={false}
        dragRotate={false}
        mapStyle={mapStyle}
        transitionInterpolator={new LinearInterpolator()}
        onViewportChange={(viewport) => this.setState({viewport})}
        width="100%"
        height="100%"
      >
        <DeckGL layers={[this.renderMarker(shipment.dropoff_address)]}
                viewState={viewport}
        />
      </ReactMapGL>
    );
  }
}

export default TrackingMap;