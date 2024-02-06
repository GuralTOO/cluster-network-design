import React, { useEffect, useState } from 'react';
import Tree from 'react-d3-tree';
import createNetworkTopology from '../logic/computeTopology';

const NetworkVisualizationD3Tree = ({ gpuCount }) => {
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    const topology = createNetworkTopology(gpuCount);

    // Transform topology to tree structure
    const transformTopologyToTree = (topology) => {
      // Start with spine nodes as the root
      const spines = topology.spineConnections.map((_, index) => {
        if (index > 0) { // Skip the first empty entry
          return {
            name: `Spine ${index}`,
            children: [],
          };
        }
        return null;
      }).filter(Boolean);

      // Add leaf nodes as children of spines
      topology.leafNorthBound.forEach((connections, leafIndex) => {
        if (leafIndex > 0) {
          const leafNode = {
            name: `Leaf ${leafIndex}`,
            children: [],
          };

          // Find corresponding spine and add this leaf as a child
          connections.forEach((conn) => {
            const spineIndex = conn.spine - 1;
            if (spines[spineIndex]) {
              spines[spineIndex].children.push(leafNode);
            }
          });

          // Add GPU nodes as children of leaves
          topology.leafSouthBound[leafIndex].forEach((gpuConn) => {
            leafNode.children.push({
              name: `GPU ${gpuConn.gpu}`,
            });
          });
        }
      });
      console.log(spines);
      return [{ name: "Root", children: spines }];
    };
    var transformedTree = transformTopologyToTree(topology);
    console.log(transformedTree);
    // setTreeData(transformedTree);
  }, [gpuCount]);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Tree data={treeData} orientation="vertical" />
    </div>
  );
};

export default NetworkVisualizationD3Tree;
