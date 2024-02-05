// src/NetworkVisualization.js
import React, { useEffect, useState, useRef } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import createNetworkTopology from '../logic/computeTopology';

const NetworkVisualization = ({ gpuCount }) => {
  const networkRef = useRef(null);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    const topology = createNetworkTopology(gpuCount);

    // Convert topology data to visualization format
    const nodes = new DataSet();
    const edges = new DataSet();

    // Add GPU nodes
    topology.gpuConnections.forEach((conn, index) => {
      if (index > 0) { // Skip the first empty entry
        nodes.add({ id: index, label: `GPU ${index}`, group: 'gpu' });
      }
    });

    // Add leaf and spine nodes
    topology.leafSouthBound.forEach((_, index) => {
      if (index > 0) { // Skip the first empty entry
        nodes.add({ id: `leaf-${index}`, label: `Leaf ${index}`, group: 'leaf' });
      }
    });
    topology.spineConnections.forEach((_, index) => {
      if (index > 0) { // Skip the first empty entry
        nodes.add({ id: `spine-${index}`, label: `Spine ${index}`, group: 'spine' });
      }
    });

    // Add connections (edges)
    topology.leafSouthBound.forEach((connections, i) => {
      connections.forEach(conn => {
        edges.add({ from: i, to: conn.gpu });
      });
    });

    // Initialize network
    if (networkRef.current) {
      setNetwork(new Network(networkRef.current, { nodes, edges }, {}));
    }
  }, [gpuCount]);

  return <div ref={networkRef} style={{ height: '500px', width: '100%' }} />;
};

export default NetworkVisualization;
