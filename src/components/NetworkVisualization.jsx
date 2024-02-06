// src/NetworkVisualization.js

import React, { useEffect, useState, useRef } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import createNetworkTopology from '../logic/computeTopology';

const NetworkVisualization = () => {
  const networkRef = useRef(null);
  const [network, setNetwork] = useState(null);
  const [gpuCount, setGpuCount] = useState(0); // State for gpuCount input field

  useEffect(() => {
    const topology = createNetworkTopology(gpuCount);
  
    const nodes = new DataSet();
    const edges = new DataSet();
  
    // Y positions for different types of nodes
    const baseYDistance = 200;
    const dynamicDistanceMultiplier = Math.ceil(gpuCount / 256) * Math.ceil(gpuCount / 256);
    
    const spineY = 100;
    const leafY = spineY + baseYDistance * dynamicDistanceMultiplier;
    const gpuY = leafY + baseYDistance * dynamicDistanceMultiplier;    
    // Horizontal distance between nodes
    const nodeDistanceX = 20;
  
    // Assuming the first GPU node starts at 0, calculate the total width required for all GPU nodes
    const gpuNodesWidth = (topology.gpuConnections.length - 1) * nodeDistanceX;
  
    // Centering calculations for spine and leaf layers based on the width of the GPU layer
    const spineStartX = -(gpuNodesWidth / 2) + (gpuNodesWidth / (topology.spineConnections.length - 1)) / 2;
    const leafStartX = -(gpuNodesWidth / 2) + (gpuNodesWidth / (topology.leafSouthBound.length - 1)) / 2;
  
    // Create spine nodes centered above GPU nodes
    topology.spineConnections.forEach((_, index) => {
      if (index === 0) return; // Skip the first empty entry
      nodes.add({
        id: `spine-${index}`,
        label: `Spine ${index}`,
        group: 'spine',
        x: spineStartX + (gpuNodesWidth / (topology.spineConnections.length - 1)) * (index-1),
        y: spineY,
        fixed: true
      });
    });
  
    // Create leaf nodes centered above GPU nodes
    topology.leafSouthBound.forEach((_, index) => {
      if (index === 0) return; // Skip the first empty entry
      nodes.add({
        id: `leaf-${index}`,
        label: `Leaf ${index}`,
        group: 'leaf',
        x: leafStartX + (gpuNodesWidth / (topology.leafSouthBound.length - 1)) * (index-1),
        y: leafY,
        fixed: true
      });
    });
  
    // Add GPU nodes and their connections
    topology.gpuConnections.forEach((conn, index) => {
      if (index === 0) return; // Skip the first empty entry
      const gpuX = index * nodeDistanceX - (gpuNodesWidth / 2);
      nodes.add({
        id: `gpu-${index}`,
        label: `${index}`,
        group: 'gpu',
        x: gpuX,
        y: gpuY,
        fixed: true
      });
  
      // Connect GPU nodes to their respective leaves
      if (conn.leaf !== undefined) {
        edges.add({
          from: `leaf-${conn.leaf}`,
          to: `gpu-${index}`
        });
      }
    });
  
    // Add connections between leaves and spines
    topology.leafNorthBound.forEach((connections, leafIndex) => {
      connections.forEach(conn => {
        edges.add({
          from: `leaf-${leafIndex}`,
          to: `spine-${conn.spine}`
        });
      });
    });
  
    // Initialize network with updated nodes and edges
    if (networkRef.current) {
      const options = {
        physics: false, // Disable physics to manually set positions
        edges: {
          smooth: true
        }
      };
      setNetwork(new Network(networkRef.current, { nodes, edges }, options));
    }
  }, [gpuCount]);
  
  

  return (
    <div>
      <a>Enter GPU count - </a>
      <input type="number" value={gpuCount} onChange={(e) => setGpuCount(parseInt(e.target.value))} />
      <div ref={networkRef} style={{ height: '600px', width: '100%' }} />
    </div>
  );
};

export default NetworkVisualization;