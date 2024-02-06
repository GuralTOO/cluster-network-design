import React, { useState, useEffect } from 'react';
import createNetworkTopology from '../logic/computeTopology';



const NetworkVisualizationSVG = ({ gpuCount }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const topology = createNetworkTopology(gpuCount);

    // Example positions calculation (you might need to adjust this)
    const calculatePositions = () => {
      const positions = { spines: [], leaves: [], gpus: [] };
      const spacingX = 100; // Horizontal spacing
      const spineY = 50, leafY = 150, gpuY = 250; // Vertical positions

      // Spines
      topology.spineConnections.forEach((_, i) => {
        if (i > 0) {
          positions.spines.push({ id: `spine-${i}`, x: i * spacingX, y: spineY });
        }
      });

      // Leaves
      topology.leafSouthBound.forEach((_, i) => {
        if (i > 0) {
          positions.leaves.push({ id: `leaf-${i}`, x: i * spacingX, y: leafY });
        }
      });

      // GPUs
      topology.gpuConnections.forEach((_, i) => {
        if (i > 0) {
          positions.gpus.push({ id: `gpu-${i}`, x: i * spacingX, y: gpuY });
        }
      });

      return positions;
    };

    // Example edges calculation
    const calculateEdges = (positions) => {
      const edges = [];

      // Connect leaves to spines
      positions.leaves.forEach((leaf, i) => {
        const spineIndex = Math.floor(i / 2); // Example connection logic
        if (positions.spines[spineIndex]) {
          edges.push({ from: leaf.id, to: positions.spines[spineIndex].id });
        }
      });

      // Connect GPUs to leaves
      positions.gpus.forEach((gpu, i) => {
        const leafIndex = Math.floor(i / 4); // Example connection logic
        if (positions.leaves[leafIndex]) {
          edges.push({ from: gpu.id, to: positions.leaves[leafIndex].id });
        }
      });

      return edges;
    };

    const positions = calculatePositions();
    setNodes([...positions.spines, ...positions.leaves, ...positions.gpus]);
    setEdges(calculateEdges(positions));
  }, [gpuCount]);

  return (
    <svg width="1000" height="300" style={{ border: '1px solid black' }}>
      {edges.map((edge, index) => {
        const fromNode = nodes.find(node => node.id === edge.from);
        const toNode = nodes.find(node => node.id === edge.to);
        return (
          <line
            key={index}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
            stroke="black"
          />
        );
      })}
      {nodes.map((node, index) => (
        <circle
          key={index}
          cx={node.x}
          cy={node.y}
          r="10"
          fill="red"
        />
      ))}
    </svg>
  );
};

export default NetworkVisualizationSVG;
