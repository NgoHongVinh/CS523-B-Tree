export const CODE_SNIPPETS = {
  search: `// Tìm kiếm trong B-Tree
search(node, keyValue) {
  let i = 0;
  while (i < node.keys.length && keyValue > node.keys[i].key) {
    i++;
  }

  if (i < node.keys.length && keyValue === node.keys[i].key) {
    return { node, index: i }; // Tìm thấy
  }

  if (node.isLeaf) {
    return null; // Không tìm thấy ở lá
  }

  return this.search(node.children[i], keyValue);
}`,
  insert: `// Chèn vào B-Tree
insert(key) {
  // 1. Tìm đường đến lá
  const path = this.findPath(this.root, key.key);
  let currentNode = path.pop();

  // 2. Chèn vào nút lá
  this.insertIntoNode(currentNode, key);

  // 3. Tách nút nếu bị đầy (Overflow)
  while (currentNode.keys.length >= this.m) {
    this.split(currentNode, path);
  }
}`,
  split: `// Tách nút (Split)
split(node, path) {
  const midIndex = Math.floor(node.keys.length / 2);
  const promotedKey = node.keys[midIndex];
  
  const newNode = new BTreeNode(node.isLeaf);
  newNode.keys = node.keys.splice(midIndex + 1);
  node.keys.pop(); // Xóa khóa giữa

  if (path.length === 0) {
    const newRoot = new BTreeNode(false);
    newRoot.keys = [promotedKey];
    newRoot.children = [node, newNode];
    this.root = newRoot;
  } else {
    const parent = path.pop();
    this.insertIntoNode(parent, promotedKey, newNode);
  }
}`,
  delete: `// Xóa khỏi B-Tree
delete(keyValue) {
  this.deleteRecursive(this.root, keyValue);
  
  // Hạ cấp cây nếu gốc trống
  if (this.root.keys.length === 0 && !this.root.isLeaf) {
    this.root = this.root.children[0];
  }
}`,
  borrow: `// Vay mượn khóa (Borrow)
borrowFromPrev(parent, i) {
  const child = parent.children[i];
  const sibling = parent.children[i - 1];

  child.keys.unshift(parent.keys[i - 1]);
  parent.keys[i - 1] = sibling.keys.pop();
}`,
  merge: `// Gộp nút (Merge)
merge(parent, i) {
  const child = parent.children[i];
  const sibling = parent.children[i + 1];

  child.keys.push(parent.keys[i]);
  child.keys.push(...sibling.keys);
  
  parent.keys.splice(i, 1);
  parent.children.splice(i + 1, 1);
}`
};
