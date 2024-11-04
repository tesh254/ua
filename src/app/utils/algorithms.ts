// Linear interpolation
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

// Exponential Moving Average
export const ema = (data: number[], alpha: number): number[] => {
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result[i] = alpha * data[i] + (1 - alpha) * result[i - 1];
  }
  return result;
};

// Double Exponential Smoothing
export const doubleExponentialSmoothing = (
  data: number[],
  alpha: number,
  beta: number
): number[] => {
  const result: number[] = [data[0]];
  let level = data[0];
  let trend = data[1] - data[0];

  for (let i = 1; i < data.length; i++) {
    const lastLevel = level;
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - lastLevel) + (1 - beta) * trend;
    result[i] = level + trend;
  }
  return result;
};

// Gaussian Weight Function
export const gaussianWeight = (x: number, sigma: number): number => {
  return (
    Math.exp(-(x * x) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI))
  );
};

// Catmull-Rom Spline
export const catmullRom = (
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};

// Critically Damped Spring
export const criticallyDampedSpring = (
  current: number,
  target: number,
  velocity: number,
  stiffness: number,
  deltaTime: number
): { position: number; velocity: number } => {
  const diff = target - current;
  const damping = 2 * Math.sqrt(stiffness);
  const acceleration = diff * stiffness - velocity * damping;
  const newVelocity = velocity + acceleration * deltaTime;
  const newPosition = current + newVelocity * deltaTime;
  return { position: newPosition, velocity: newVelocity };
};

// Moving Median Filter
export const movingMedian = (data: number[], windowSize: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const window = data.slice(
      Math.max(0, i - Math.floor(windowSize / 2)),
      Math.min(data.length, i + Math.floor(windowSize / 2) + 1)
    );
    const sorted = [...window].sort((a, b) => a - b);
    result.push(sorted[Math.floor(sorted.length / 2)]);
  }
  return result;
};

// Adaptive Threshold
export const adaptiveThreshold = (
  data: number[],
  windowSize: number,
  constant: number
): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const window = data.slice(
      Math.max(0, i - Math.floor(windowSize / 2)),
      Math.min(data.length, i + Math.floor(windowSize / 2) + 1)
    );
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    result.push(data[i] > mean + constant ? 1 : 0);
  }
  return result;
};

// Perlin Noise
export const perlin = {
  // Permutation table
  p: new Array(512),
  
  // Initialize permutation table
  init() {
    for(let i=0; i < 256 ; i++) this.p[256+i] = this.p[i] = Math.floor(Math.random() * 256);
  },
  
  fade(t: number): number { 
    return t * t * t * (t * (t * 6 - 15) + 10); 
  },
  
  lerp(t: number, a: number, b: number): number { 
    return a + t * (b - a); 
  },
  
  grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  },
  
  noise(x: number, y: number = 0, z: number = 0): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(w, 
      this.lerp(v, 
        this.lerp(u, 
          this.grad(this.p[AA], x, y, z),
          this.grad(this.p[BA], x-1, y, z)
        ),
        this.lerp(u,
          this.grad(this.p[AB], x, y-1, z),
          this.grad(this.p[BB], x-1, y-1, z)
        )
      ),
      this.lerp(v,
        this.lerp(u,
          this.grad(this.p[AA+1], x, y, z-1),
          this.grad(this.p[BA+1], x-1, y, z-1)
        ),
        this.lerp(u,
          this.grad(this.p[AB+1], x, y-1, z-1),
          this.grad(this.p[BB+1], x-1, y-1, z-1)
        )
      )
    );
  }
};

// QuadTree for spatial partitioning
export class QuadTree {
  boundary: { x: number; y: number; width: number; height: number };
  capacity: number;
  points: Array<{ x: number; y: number }>;
  divided: boolean;
  northeast?: QuadTree;
  northwest?: QuadTree;
  southeast?: QuadTree;
  southwest?: QuadTree;

  constructor(boundary: { x: number; y: number; width: number; height: number }, capacity: number) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    const ne = { x: x + w, y: y - h, width: w, height: h };
    const nw = { x: x - w, y: y - h, width: w, height: h };
    const se = { x: x + w, y: y + h, width: w, height: h };
    const sw = { x: x - w, y: y + h, width: w, height: h };

    this.northeast = new QuadTree(ne, this.capacity);
    this.northwest = new QuadTree(nw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);
    
    this.divided = true;
  }

  insert(point: { x: number; y: number }): boolean {
    if (!this.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northeast!.insert(point) ||
      this.northwest!.insert(point) ||
      this.southeast!.insert(point) ||
      this.southwest!.insert(point)
    );
  }

  contains(point: { x: number; y: number }): boolean {
    return (
      point.x >= this.boundary.x - this.boundary.width &&
      point.x <= this.boundary.x + this.boundary.width &&
      point.y >= this.boundary.y - this.boundary.height &&
      point.y <= this.boundary.y + this.boundary.height
    );
  }
}

// A* Pathfinding
export interface Node {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  walkable: boolean;
  parent?: Node;
}

export const astar = {
  search(grid: Node[][], start: Node, end: Node): Node[] {
    const openList: Node[] = [];
    const closedList: Set<Node> = new Set();
    
    start.g = 0;
    start.h = this.heuristic(start, end);
    start.f = start.g + start.h;
    
    openList.push(start);
    
    while (openList.length > 0) {
      // Find node with lowest f value
      let currentNode = openList[0];
      let currentIndex = 0;
      
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < currentNode.f) {
          currentNode = openList[i];
          currentIndex = i;
        }
      }
      
      // Remove current node from open list and add to closed list
      openList.splice(currentIndex, 1);
      closedList.add(currentNode);
      
      // Found the goal
      if (currentNode === end) {
        const path: Node[] = [];
        let current: Node | undefined = currentNode;
        while (current) {
          path.push(current);
          current = current.parent;
        }
        return path.reverse();
      }
      
      // Generate neighbors
      const neighbors = this.getNeighbors(grid, currentNode);
      
      for (const neighbor of neighbors) {
        if (closedList.has(neighbor) || !neighbor.walkable) {
          continue;
        }
        
        const tentativeG = currentNode.g + 1;
        
        if (!openList.includes(neighbor)) {
          openList.push(neighbor);
        } else if (tentativeG >= neighbor.g) {
          continue;
        }
        
        neighbor.parent = currentNode;
        neighbor.g = tentativeG;
        neighbor.h = this.heuristic(neighbor, end);
        neighbor.f = neighbor.g + neighbor.h;
      }
    }
    
    return []; // No path found
  },
  
  heuristic(node: Node, goal: Node): number {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
  },
  
  getNeighbors(grid: Node[][], node: Node): Node[] {
    const neighbors: Node[] = [];
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    for (const [dx, dy] of dirs) {
      const x = node.x + dx;
      const y = node.y + dy;
      
      if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
        neighbors.push(grid[x][y]);
      }
    }
    
    return neighbors;
  }
};
