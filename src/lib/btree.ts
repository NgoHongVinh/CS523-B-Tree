import { CODE_SNIPPETS } from '../constants/codeSnippets';

export interface Student {
  id: string; // MSSV
  name: string;
  gender: string;
  className: string;
  fileIndex: number; // Position in the simulated JSONL file
}

export interface BTreeKey {
  key: string; // The value being indexed (ID or Name)
  fileIndex: number;
}

export class BTreeNode {
  keys: BTreeKey[] = [];
  children: BTreeNode[] = [];
  isLeaf: boolean;
  id: string;

  constructor(isLeaf: boolean = true) {
    this.isLeaf = isLeaf;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

export interface SimulationStep {
  type: 'search' | 'insert' | 'delete' | 'split' | 'merge' | 'borrow' | 'info';
  nodeId: string;
  description: string;
  highlightKeys?: string[];
  codeSnippet?: string;
  highlightLines?: number[];
}

export class BTree {
  root: BTreeNode;
  m: number; // Order (max children)
  minKeys: number;

  constructor(m: number = 3) {
    this.root = new BTreeNode(true);
    this.m = m;
    this.minKeys = Math.ceil(m / 2) - 1;
  }

  // Search logic
  search(node: BTreeNode, keyValue: string, steps: SimulationStep[] = []): { node: BTreeNode; index: number } | null {
    let i = 0;
    while (i < node.keys.length && keyValue > node.keys[i].key) {
      i++;
    }

    steps.push({
      type: 'search',
      nodeId: node.id,
      description: `Kiểm tra nút. So sánh "${keyValue}" với các khóa trong nút.`,
      highlightKeys: node.keys.map(k => k.key),
      codeSnippet: CODE_SNIPPETS.search,
      highlightLines: [4, 5, 6, 7]
    });

    if (i < node.keys.length && keyValue === node.keys[i].key) {
      steps.push({
        type: 'search',
        nodeId: node.id,
        description: `Tìm thấy "${keyValue}" tại chỉ số ${i}.`,
        highlightKeys: [node.keys[i].key],
        codeSnippet: CODE_SNIPPETS.search,
        highlightLines: [9, 10, 11]
      });
      return { node, index: i };
    }

    if (node.isLeaf) {
      steps.push({
        type: 'search',
        nodeId: node.id,
        description: `Không tìm thấy "${keyValue}" trong nút lá.`,
        codeSnippet: CODE_SNIPPETS.search,
        highlightLines: [13, 14, 15]
      });
      return null;
    }

    return this.search(node.children[i], keyValue, steps);
  }

  // Insert logic
  insert(key: BTreeKey, steps: SimulationStep[] = []) {
    const path: BTreeNode[] = [];
    this.findPath(this.root, key.key, path);
    
    let currentNode = path.pop()!;
    let currentKey = key;
    let rightChild: BTreeNode | null = null;

    // Insert into leaf
    this.insertIntoNode(currentNode, currentKey, rightChild);
    steps.push({
      type: 'insert',
      nodeId: currentNode.id,
      description: `Thêm khóa "${key.key}" vào nút.`,
      codeSnippet: CODE_SNIPPETS.insert,
      highlightLines: [25, 26]
    });

    // Split if overflow
    while (currentNode.keys.length >= this.m) {
      const midIndex = Math.floor(currentNode.keys.length / 2);
      const promotedKey = currentNode.keys[midIndex];
      
      const newNode = new BTreeNode(currentNode.isLeaf);
      newNode.keys = currentNode.keys.splice(midIndex + 1);
      currentNode.keys.pop(); // Remove midKey from left node
      
      if (!currentNode.isLeaf) {
        newNode.children = currentNode.children.splice(midIndex + 1);
      }

      steps.push({
        type: 'split',
        nodeId: currentNode.id,
        description: `Nút bị đầy (${this.m} khóa). Tách nút: đẩy "${promotedKey.key}" lên trên.`,
        codeSnippet: CODE_SNIPPETS.split,
        highlightLines: [35, 36, 38, 39, 40]
      });

      if (path.length === 0) {
        // Create new root
        const newRoot = new BTreeNode(false);
        newRoot.keys = [promotedKey];
        newRoot.children = [currentNode, newNode];
        this.root = newRoot;
        steps.push({
          type: 'split',
          nodeId: newRoot.id,
          description: `Tạo gốc mới với khóa "${promotedKey.key}".`,
          codeSnippet: CODE_SNIPPETS.split,
          highlightLines: [42, 43, 44, 45, 46]
        });
        break;
      } else {
        const parent = path.pop()!;
        this.insertIntoNode(parent, promotedKey, newNode);
        currentNode = parent;
      }
    }
  }

  private findPath(node: BTreeNode, keyValue: string, path: BTreeNode[]) {
    path.push(node);
    if (node.isLeaf) return;
    
    let i = 0;
    while (i < node.keys.length && keyValue > node.keys[i].key) {
      i++;
    }
    this.findPath(node.children[i], keyValue, path);
  }

  private insertIntoNode(node: BTreeNode, key: BTreeKey, rightChild: BTreeNode | null) {
    let i = 0;
    while (i < node.keys.length && key.key > node.keys[i].key) {
      i++;
    }
    node.keys.splice(i, 0, key);
    if (rightChild) {
      node.children.splice(i + 1, 0, rightChild);
    }
  }

  // Delete logic
  delete(keyValue: string, steps: SimulationStep[] = []) {
    this.deleteRecursive(this.root, keyValue, steps);
    if (this.root.keys.length === 0 && !this.root.isLeaf) {
      this.root = this.root.children[0];
      steps.push({
        type: 'info',
        nodeId: this.root.id,
        description: `Gốc cũ trống, hạ cấp cây. Nút con trở thành gốc mới.`,
        codeSnippet: CODE_SNIPPETS.delete,
        highlightLines: [57, 58, 59]
      });
    }
  }

  private deleteRecursive(node: BTreeNode, keyValue: string, steps: SimulationStep[]) {
    let i = 0;
    while (i < node.keys.length && keyValue > node.keys[i].key) {
      i++;
    }

    if (i < node.keys.length && keyValue === node.keys[i].key) {
      // Key found in this node
      if (node.isLeaf) {
        node.keys.splice(i, 1);
        steps.push({
          type: 'delete',
          nodeId: node.id,
          description: `Xóa "${keyValue}" khỏi nút lá.`,
          codeSnippet: CODE_SNIPPETS.delete,
          highlightLines: [53, 54]
        });
      } else {
        // Internal node deletion
        const leftChild = node.children[i];
        const rightChild = node.children[i + 1];

        if (leftChild.keys.length > this.minKeys) {
          const pred = this.getPredecessor(leftChild);
          node.keys[i] = pred;
          steps.push({
            type: 'borrow',
            nodeId: node.id,
            description: `Xóa "${keyValue}" ở nút trong. Thay thế bằng khóa tiền nhiệm "${pred.key}" từ con trái.`,
            codeSnippet: CODE_SNIPPETS.delete,
            highlightLines: [53, 54]
          });
          this.deleteRecursive(leftChild, pred.key, steps);
        } else if (rightChild.keys.length > this.minKeys) {
          const succ = this.getSuccessor(rightChild);
          node.keys[i] = succ;
          steps.push({
            type: 'borrow',
            nodeId: node.id,
            description: `Xóa "${keyValue}" ở nút trong. Thay thế bằng khóa kế nhiệm "${succ.key}" từ con phải.`,
            codeSnippet: CODE_SNIPPETS.delete,
            highlightLines: [53, 54]
          });
          this.deleteRecursive(rightChild, succ.key, steps);
        } else {
          // Merge left and right
          this.merge(node, i, steps);
          this.deleteRecursive(leftChild, keyValue, steps);
        }
      }
    } else {
      // Key not in this node
      if (node.isLeaf) {
        steps.push({
          type: 'info',
          nodeId: node.id,
          description: `Không tìm thấy "${keyValue}" để xóa.`,
          codeSnippet: CODE_SNIPPETS.delete,
          highlightLines: [53, 54]
        });
        return;
      }

      const lastChild = (i === node.keys.length);
      if (node.children[i].keys.length <= this.minKeys) {
        this.fill(node, i, steps);
      }

      // After fill, the child might have changed
      if (lastChild && i > node.keys.length) {
        this.deleteRecursive(node.children[i - 1], keyValue, steps);
      } else {
        this.deleteRecursive(node.children[i], keyValue, steps);
      }
    }
  }

  private getPredecessor(node: BTreeNode): BTreeKey {
    let curr = node;
    while (!curr.isLeaf) {
      curr = curr.children[curr.children.length - 1];
    }
    return curr.keys[curr.keys.length - 1];
  }

  private getSuccessor(node: BTreeNode): BTreeKey {
    let curr = node;
    while (!curr.isLeaf) {
      curr = curr.children[0];
    }
    return curr.keys[0];
  }

  private fill(parent: BTreeNode, i: number, steps: SimulationStep[]) {
    if (i !== 0 && parent.children[i - 1].keys.length > this.minKeys) {
      this.borrowFromPrev(parent, i, steps);
    } else if (i !== parent.keys.length && parent.children[i + 1].keys.length > this.minKeys) {
      this.borrowFromNext(parent, i, steps);
    } else {
      if (i !== parent.keys.length) {
        this.merge(parent, i, steps);
      } else {
        this.merge(parent, i - 1, steps);
      }
    }
  }

  private borrowFromPrev(parent: BTreeNode, i: number, steps: SimulationStep[]) {
    const child = parent.children[i];
    const sibling = parent.children[i - 1];

    child.keys.unshift(parent.keys[i - 1]);
    if (!child.isLeaf) {
      child.children.unshift(sibling.children.pop()!);
    }
    parent.keys[i - 1] = sibling.keys.pop()!;
    
    steps.push({
      type: 'borrow',
      nodeId: parent.id,
      description: `Vay mượn từ anh em bên trái để đảm bảo số lượng khóa tối thiểu.`,
      codeSnippet: CODE_SNIPPETS.borrow,
      highlightLines: [66, 67]
    });
  }

  private borrowFromNext(parent: BTreeNode, i: number, steps: SimulationStep[]) {
    const child = parent.children[i];
    const sibling = parent.children[i + 1];

    child.keys.push(parent.keys[i]);
    if (!child.isLeaf) {
      child.children.push(sibling.children.shift()!);
    }
    parent.keys[i] = sibling.keys.shift()!;

    steps.push({
      type: 'borrow',
      nodeId: parent.id,
      description: `Vay mượn từ anh em bên phải để đảm bảo số lượng khóa tối thiểu.`,
      codeSnippet: CODE_SNIPPETS.borrow,
      highlightLines: [66, 67]
    });
  }

  private merge(parent: BTreeNode, i: number, steps: SimulationStep[]) {
    const child = parent.children[i];
    const sibling = parent.children[i + 1];

    child.keys.push(parent.keys[i]);
    child.keys.push(...sibling.keys);
    if (!child.isLeaf) {
      child.children.push(...sibling.children);
    }

    parent.keys.splice(i, 1);
    parent.children.splice(i + 1, 1);

    steps.push({
      type: 'merge',
      nodeId: parent.id,
      description: `Gộp hai nút con và khóa cha để đảm bảo cấu trúc cây.`,
      codeSnippet: CODE_SNIPPETS.merge,
      highlightLines: [74, 75, 77, 78]
    });
  }
}
