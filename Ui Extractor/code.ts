(async () => {
  await figma.loadAllPagesAsync();

  interface CustomNodeData {
    id: string;
    name: string;
    type: string;
    children?: CustomNodeData[];
  }

  function traverse(node: BaseNode): CustomNodeData {
    const nodeData: CustomNodeData = {
      id: node.id,
      name: node.name,
      type: node.type
    };

    // If the node supports children, recursively traverse them
    if ("children" in node && node.children && node.children.length > 0) {
      nodeData.children = [];
      for (const child of node.children) {
        nodeData.children.push(traverse(child));
      }
    }
    return nodeData;
  }

  const data = traverse(figma.root);
  console.log(data);

  // Convert the data to JSON string and send via HTTP POST to your Python server
  fetch('http://localhost:5000/receive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => {
    console.log('Data sent to Python server:', response.status);
  }).catch(err => {
    console.error('Error sending data:', err);
  });

  figma.closePlugin();
})();
