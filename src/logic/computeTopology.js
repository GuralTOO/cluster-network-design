var math = require("mathjs");

export default function createNetworkTopology(gpuCount) {
  var portsPerSwitch = 64;

  if (gpuCount > portsPerSwitch * (portsPerSwitch / 2)) {
    throw new Error("Too many GPUs for this topology");
  }

  var leafCount = math.ceil(gpuCount / (portsPerSwitch / 2));

  var spineCount = math.ceil(gpuCount / portsPerSwitch);

  // init a few arrays
  var leafSouthBound = [];
  var leafNorthBound = [];
  for (var i = 0; i <= leafCount; i++) {
    leafSouthBound.push([]);
    leafNorthBound.push([]);
  }

  var gpuConnections = [];
  for (var i = 0; i <= gpuCount; i++) {
    gpuConnections.push([]);
  }

  var spineConnections = [];
  for (var i = 0; i <= spineCount; i++) {
    spineConnections.push([]);
  }

  var gpusPerLeaf = math.ceil(gpuCount / leafCount);

  // calculate compute connections
  for (var i = 1; i <= leafCount; i++) {
    for (
      var j = gpusPerLeaf * (i - 1) + 1;
      j <= math.min(gpusPerLeaf * i, gpuCount);
      j++
    ) {
      leafSouthBound[i].push({
        gpu: j,
        cableCount: 1,
        gpuPort: j,
        leafPorts: [j - gpusPerLeaf * (i - 1)],
      });
      gpuConnections[j] = { leaf: i };
    }
    for (var j = 1; j <= spineCount; j++) {
      leafNorthBound[i].push({
        spine: j,
        cableCount: gpusPerLeaf / spineCount,
        leafPorts: math
          .range((i - 1) * (portsPerSwitch / 2) + 1, i * (portsPerSwitch / 2))
          .toArray(),
        spinePort: i,
      });
      spineConnections[j].push = {
        leaf: i,
        cableCount: gpusPerLeaf / spineCount,
        spinePort: i,
        leafPorts: math
          .range((i - 1) * (portsPerSwitch / 2) + 1, i * (portsPerSwitch / 2))
          .toArray(),
      };
    }
  }
  console.log(leafSouthBound);
  console.log(leafNorthBound);
  return {
    leafSouthBound: leafSouthBound,
    leafNorthBound: leafNorthBound,
    gpuConnections: gpuConnections,
    spineConnections: spineConnections,
  };
}
