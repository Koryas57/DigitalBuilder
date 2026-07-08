import React from "react";
import { CoordinatesOverlay } from "./CoordinatesOverlay";
import { Scene } from "./Scene";
import { Toolbar } from "./Toolbar";
import "./MapBuilder.scss";

export const MapBuilder: React.FC = () => (
  <main className="map-builder">
    <Toolbar />
    <section className="map-builder-stage" aria-label="Editeur de niveau 3D">
      <Scene />
      <CoordinatesOverlay />
      <div className="map-builder-help">
        <span>Orbit: drag</span>
        <span>Pan: clic droit</span>
        <span>Zoom: molette</span>
        <span>G: move</span>
        <span>R: rotate 90</span>
        <span>Q/E: rotate</span>
        <span>Shift+Q/E: 5 deg</span>
        <span>[ / ]: snap</span>
        <span>Arrows: nudge</span>
        <span>Alt+Arrows: 0.01m</span>
        <span>Ctrl+D: duplicate</span>
        <span>Delete: remove</span>
      </div>
    </section>
  </main>
);
