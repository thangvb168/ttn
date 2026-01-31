import { Card } from "antd";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Fix Leflet Icon issue
// @ts-ignore
import icon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const mockMarkers = [
  { id: "d1", lat: 10.033333, lng: 105.783333, name: "Loa Ninh Kiều" },
  { id: "d2", lat: 10.02, lng: 105.79, name: "Loa Cái Răng" },
];

export const DeviceMap: React.FC = () => {
  return (
    <Card
      title="Bản đồ thiết bị"
      className="h-full"
      bodyStyle={{ height: "400px", padding: 0 }}
    >
      <MapContainer
        center={[10.033333, 105.783333]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mockMarkers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>{m.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
};
